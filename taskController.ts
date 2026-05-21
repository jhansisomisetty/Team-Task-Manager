import { Response } from 'express';
import { getIsMongoConnected } from '../config/db.js';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { dbService } from '../services/storage.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// GET /api/tasks
export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const userRole = req.user.role;
  const { projectId, status, priority } = req.query;

  try {
    const isMongo = getIsMongoConnected();
    let tasksList = [];

    // Filter construction
    if (isMongo) {
      const matchCriteria: any = {};

      if (projectId) {
        matchCriteria.project = projectId;
      }

      if (status) {
        matchCriteria.status = status;
      }

      if (priority) {
        matchCriteria.priority = priority;
      }

      // MongoDB retrieval with populate
      const dbTasks = await Task.find(matchCriteria)
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name email role avatar')
        .populate('project', 'name description')
        .sort({ dueDate: 1 });

      // If user is a member, they can only see tasks where they are the assigned user
      // OR they are a member of the project. Let's filter of authorized ones.
      tasksList = await Promise.all(
        dbTasks.map(async t => {
          const formatted = {
            id: t._id.toString(),
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignedTo: t.assignedTo,
            createdBy: t.createdBy,
            project: t.project,
            createdAt: t.createdAt,
          };
          return formatted;
        })
      );

      // Filter tasks by permission in memory if Member
      if (userRole !== 'admin') {
        const authorizedProjects = await Project.find({ members: userId }).select('_id');
        const projIds = authorizedProjects.map(p => p._id.toString());

        tasksList = tasksList.filter(t => {
          const isAssigned = (t.assignedTo as any)?._id?.toString() === userId;
          const isProjectMember = t.project && projIds.includes((t.project as any)?._id?.toString());
          return isAssigned || isProjectMember;
        });
      }
    } else {
      const dbTasks = await dbService.getTasks();
      let filtered = dbTasks;

      if (projectId) {
        filtered = filtered.filter(t => t.project === projectId);
      }
      if (status) {
        filtered = filtered.filter(t => t.status === status);
      }
      if (priority) {
        filtered = filtered.filter(t => t.priority === priority);
      }

      const preppedTasks = await Promise.all(
        filtered.map(async t => {
          const assignee = await dbService.populateUser(t.assignedTo);
          const creator = await dbService.populateUser(t.createdBy);
          const proj = await dbService.getProjectById(t.project);

          return {
            id: t._id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignedTo: assignee,
            createdBy: creator,
            project: proj ? { _id: proj._id, name: proj.name, description: proj.description } : null,
            createdAt: t.createdAt,
          };
        })
      );

      // Member filtering
      if (userRole === 'admin') {
        tasksList = preppedTasks;
      } else {
        const allPrjs = await dbService.getProjects();
        const memberProjIds = allPrjs.filter(p => p.members.includes(userId)).map(p => p._id);

        tasksList = preppedTasks.filter(t => {
          const isAssigned = (t.assignedTo as any)?.id === userId || (t.assignedTo as any)?._id === userId;
          const isProjectMember = t.project && memberProjIds.includes(t.project._id);
          return isAssigned || isProjectMember;
        });
      }
    }

    res.status(200).json({ success: true, count: tasksList.length, tasks: tasksList });
  } catch (error: any) {
    console.error('getTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tasks' });
  }
}

// POST /api/tasks
export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

  if (!title || !dueDate || !assignedTo || !project) {
    res.status(400).json({ success: false, message: 'Please provide all required fields' });
    return;
  }

  try {
    const isMongo = getIsMongoConnected();
    let createdTaskObj = null;

    if (isMongo) {
      if (!project.match(/^[0-9a-fA-F]{24}$/) || !assignedTo.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Project or User Object ID formats' });
        return;
      }

      // Check if project exists
      const projExist = await Project.findById(project);
      if (!projExist) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      // Check if user assignee exists
      const userExist = await User.findById(assignedTo);
      if (!userExist) {
        res.status(404).json({ success: false, message: 'Assignee user not found' });
        return;
      }

      const task = new Task({
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: new Date(dueDate),
        assignedTo,
        project,
        createdBy: req.user.id,
      });

      await task.save();

      const populated = await Task.findById(task._id)
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name email role avatar')
        .populate('project', 'name description');

      createdTaskObj = {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assignedTo: populated?.assignedTo,
        createdBy: populated?.createdBy,
        project: populated?.project,
        createdAt: task.createdAt,
      };
    } else {
      const projExist = await dbService.getProjectById(project);
      if (!projExist) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const userExist = await dbService.getUserById(assignedTo);
      if (!userExist) {
        res.status(404).json({ success: false, message: 'Assignee user not found' });
        return;
      }

      const created = await dbService.createTask({
        title,
        description: description || '',
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: new Date(dueDate).toISOString(),
        assignedTo,
        project,
        createdBy: req.user.id,
      });

      const assignee = await dbService.populateUser(created.assignedTo);
      const creator = await dbService.populateUser(created.createdBy);
      const proj = await dbService.getProjectById(created.project);

      createdTaskObj = {
        id: created._id,
        title: created.title,
        description: created.description,
        status: created.status,
        priority: created.priority,
        dueDate: created.dueDate,
        assignedTo: assignee,
        createdBy: creator,
        project: proj ? { _id: proj._id, name: proj.name, description: proj.description } : null,
        createdAt: created.createdAt,
      };
    }

    res.status(201).json({ success: true, message: 'Task created successfully', task: createdTaskObj });
  } catch (error: any) {
    console.error('createTask error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task' });
  }
}

// GET /api/tasks/:id
export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    const isMongo = getIsMongoConnected();
    let taskObj = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Task ID format' });
        return;
      }

      const t = await Task.findById(id)
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name email role avatar')
        .populate('project', 'name description members');

      if (!t) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      // Check access permission
      const isProjectMember = t.project && (t.project as any).members.some((m: any) => m.toString() === req.user?.id);
      const isAssigned = t.assignedTo && (t.assignedTo as any)._id.toString() === req.user.id;

      if (req.user.role !== 'admin' && !isAssigned && !isProjectMember) {
        res.status(403).json({ success: false, message: 'Not authorized to view this task' });
        return;
      }

      taskObj = {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: t.assignedTo,
        createdBy: t.createdBy,
        project: t.project,
        createdAt: t.createdAt,
      };
    } else {
      const t = await dbService.getTaskById(id);
      if (!t) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      const assignee = await dbService.populateUser(t.assignedTo);
      const creator = await dbService.populateUser(t.createdBy);
      const proj = await dbService.getProjectById(t.project);

      const isProjectMember = proj && proj.members.includes(req.user.id);
      const isAssigned = t.assignedTo === req.user.id;

      if (req.user.role !== 'admin' && !isAssigned && !isProjectMember) {
        res.status(403).json({ success: false, message: 'Not authorized to view this task' });
        return;
      }

      taskObj = {
        id: t._id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: assignee,
        createdBy: creator,
        project: proj ? { _id: proj._id, name: proj.name, description: proj.description } : null,
        createdAt: t.createdAt,
      };
    }

    res.status(200).json({ success: true, task: taskObj });
  } catch (error: any) {
    console.error('getTaskById error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving task details' });
  }
}

// PUT /api/tasks/:id
export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const userRole = req.user.role;
  const userId = req.user.id;

  try {
    const isMongo = getIsMongoConnected();
    let updatedObj = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Task ID format' });
        return;
      }

      const t = await Task.findById(id);
      if (!t) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      if (userRole === 'admin') {
        // Admins can update everything
        const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

        if (title) t.title = title;
        if (description !== undefined) t.description = description;
        if (status) t.status = status;
        if (priority) t.priority = priority;
        if (dueDate) t.dueDate = new Date(dueDate);

        if (assignedTo) {
          const userExist = await User.findById(assignedTo);
          if (!userExist) {
            res.status(444).json({ success: false, message: 'Assignee user not found' });
            return;
          }
          t.assignedTo = assignedTo;
        }

        if (project) {
          const projExist = await Project.findById(project);
          if (!projExist) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
          }
          t.project = project;
        }
      } else {
        // Members can ONLY update status, and ONLY if the task is assigned to them
        if (t.assignedTo.toString() !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to modify this task' });
          return;
        }

        const { status } = req.body;
        if (status) {
          t.status = status;
        } else {
          res.status(400).json({ success: false, message: 'Members can only update task status' });
          return;
        }
      }

      await t.save();

      const populated = await Task.findById(t._id)
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name email role avatar')
        .populate('project', 'name description');

      updatedObj = {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: populated?.assignedTo,
        createdBy: populated?.createdBy,
        project: populated?.project,
        createdAt: t.createdAt,
      };
    } else {
      const t = await dbService.getTaskById(id);
      if (!t) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      const updates: any = {};

      if (userRole === 'admin') {
        const { title, description, status, priority, dueDate, assignedTo, project } = req.body;

        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (status) updates.status = status;
        if (priority) updates.priority = priority;
        if (dueDate) updates.dueDate = new Date(dueDate).toISOString();

        if (assignedTo) {
          const userExist = await dbService.getUserById(assignedTo);
          if (!userExist) {
            res.status(404).json({ success: false, message: 'Assignee user not found' });
            return;
          }
          updates.assignedTo = assignedTo;
        }

        if (project) {
          const projExist = await dbService.getProjectById(project);
          if (!projExist) {
            res.status(404).json({ success: false, message: 'Project not found' });
            return;
          }
          updates.project = project;
        }
      } else {
        if (t.assignedTo !== userId) {
          res.status(403).json({ success: false, message: 'Not authorized to modify this task' });
          return;
        }

        const { status } = req.body;
        if (status) {
          updates.status = status;
        } else {
          res.status(400).json({ success: false, message: 'Members can only update task status' });
          return;
        }
      }

      const updated = await dbService.updateTask(id, updates);
      if (updated) {
        const assignee = await dbService.populateUser(updated.assignedTo);
        const creator = await dbService.populateUser(updated.createdBy);
        const proj = await dbService.getProjectById(updated.project);

        updatedObj = {
          id: updated._id,
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority,
          dueDate: updated.dueDate,
          assignedTo: assignee,
          createdBy: creator,
          project: proj ? { _id: proj._id, name: proj.name, description: proj.description } : null,
          createdAt: updated.createdAt,
        };
      }
    }

    res.status(200).json({ success: true, message: 'Task updated successfully', task: updatedObj });
  } catch (error: any) {
    console.error('updateTask error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task' });
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    const isMongo = getIsMongoConnected();
    let isDeleted = false;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Task ID format' });
        return;
      }

      const t = await Task.findById(id);
      if (!t) {
        res.status(404).json({ success: false, message: 'Task not found' });
        return;
      }

      await Task.findByIdAndDelete(id);
      isDeleted = true;
    } else {
      isDeleted = await dbService.deleteTask(id);
    }

    if (!isDeleted) {
      res.status(404).json({ success: false, message: 'Task not found or already deleted' });
      return;
    }

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    console.error('deleteTask error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting task' });
  }
}
