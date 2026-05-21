import { Response } from 'express';
import { getIsMongoConnected } from '../config/db.js';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { dbService } from '../services/storage.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

// Helper function to calculate project progress percentage
async function calculateProjectProgress(projectId: string, isMongo: boolean): Promise<number> {
  try {
    let totalTasks = 0;
    let completedTasks = 0;

    if (isMongo) {
      totalTasks = await Task.countDocuments({ project: projectId });
      completedTasks = await Task.countDocuments({ project: projectId, status: 'completed' });
    } else {
      const allTasks = await dbService.getTasks();
      const projTasks = allTasks.filter(t => t.project === projectId);
      totalTasks = projTasks.length;
      completedTasks = projTasks.filter(t => t.status === 'completed').length;
    }

    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  } catch {
    return 0;
  }
}

// GET /api/projects
export async function getProjects(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const isMongo = getIsMongoConnected();
    let projectsList = [];

    if (isMongo) {
      // Admins see all projects, members see only their assigned projects
      const query = userRole === 'admin' ? {} : { members: userId };
      const prjs = await Project.find(query)
        .populate('createdBy', 'name email role avatar')
        .populate('members', 'name email role avatar')
        .sort({ createdAt: -1 });

      projectsList = await Promise.all(
        prjs.map(async p => {
          const progress = await calculateProjectProgress(p._id.toString(), true);
          return {
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            createdBy: p.createdBy,
            members: p.members,
            progress,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        })
      );
    } else {
      const allPrjs = await dbService.getProjects();
      const filteredPrjs = userRole === 'admin' ? allPrjs : allPrjs.filter(p => p.members.includes(userId));

      projectsList = await Promise.all(
        filteredPrjs.map(async p => {
          const progress = await calculateProjectProgress(p._id, false);
          const creator = await dbService.populateUser(p.createdBy);
          const membersList = await Promise.all(p.members.map(mId => dbService.populateUser(mId)));

          return {
            id: p._id,
            name: p.name,
            description: p.description,
            createdBy: creator,
            members: membersList.filter(Boolean),
            progress,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          };
        })
      );
    }

    res.status(200).json({ success: true, count: projectsList.length, projects: projectsList });
  } catch (error: any) {
    console.error('getProjects error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving projects' });
  }
}

// POST /api/projects
export async function createProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { name, description, members } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: 'Project name is required' });
    return;
  }

  try {
    const isMongo = getIsMongoConnected();
    let createdProjectObj = null;

    // Ensure creator is always a member
    const memberSet = new Set(members || []);
    memberSet.add(req.user.id);
    const finalMembers = Array.from(memberSet) as string[];

    if (isMongo) {
      const prj = new Project({
        name,
        description: description || '',
        members: finalMembers,
        createdBy: req.user.id,
      });
      await prj.save();

      const populated = await Project.findById(prj._id)
        .populate('createdBy', 'name email role avatar')
        .populate('members', 'name email role avatar');

      createdProjectObj = {
        id: prj._id.toString(),
        name: prj.name,
        description: prj.description,
        createdBy: populated?.createdBy,
        members: populated?.members,
        progress: 0,
        createdAt: prj.createdAt,
      };
    } else {
      const created = await dbService.createProject({
        name,
        description: description || '',
        members: finalMembers,
        createdBy: req.user.id,
      });

      const creator = await dbService.populateUser(created.createdBy);
      const membersList = await Promise.all(created.members.map(mId => dbService.populateUser(mId)));

      createdProjectObj = {
        id: created._id,
        name: created.name,
        description: created.description,
        createdBy: creator,
        members: membersList.filter(Boolean),
        progress: 0,
        createdAt: created.createdAt,
      };
    }

    res.status(201).json({ success: true, message: 'Project created successfully', project: createdProjectObj });
  } catch (error: any) {
    console.error('createProject error:', error);
    res.status(500).json({ success: false, message: 'Server error during project creation' });
  }
}

// GET /api/projects/:id
export async function getProjectById(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;

  try {
    const isMongo = getIsMongoConnected();
    let projectDetailsObj = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Project ID format' });
        return;
      }

      const p = await Project.findById(id)
        .populate('createdBy', 'name email role avatar')
        .populate('members', 'name email role avatar');

      if (!p) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      // Check if user has permission to view
      const isMember = p.members.some((m: any) => m._id.toString() === req.user?.id);
      if (req.user.role !== 'admin' && !isMember) {
        res.status(403).json({ success: false, message: 'Not authorized to view this project' });
        return;
      }

      const progress = await calculateProjectProgress(p._id.toString(), true);

      // Fetch associated tasks
      const tasksDoc = await Task.find({ project: p._id })
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name email role avatar')
        .sort({ createdAt: -1 });

      const tasks = tasksDoc.map(t => ({
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignedTo: t.assignedTo,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
      }));

      projectDetailsObj = {
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        createdBy: p.createdBy,
        members: p.members,
        progress,
        tasks,
        createdAt: p.createdAt,
      };
    } else {
      const p = await dbService.getProjectById(id);
      if (!p) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      if (req.user.role !== 'admin' && !p.members.includes(req.user.id)) {
        res.status(403).json({ success: false, message: 'Not authorized to view this project' });
        return;
      }

      const progress = await calculateProjectProgress(p._id, false);
      const creator = await dbService.populateUser(p.createdBy);
      const membersList = await Promise.all(p.members.map(mId => dbService.populateUser(mId)));

      // Fetch Tasks
      const allTasks = await dbService.getTasks();
      const projTasks = allTasks.filter(t => t.project === p._id);
      const tasks = await Promise.all(
        projTasks.map(async t => {
          const assignee = await dbService.populateUser(t.assignedTo);
          const taskCreator = await dbService.populateUser(t.createdBy);
          return {
            id: t._id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.dueDate,
            assignedTo: assignee,
            createdBy: taskCreator,
            createdAt: t.createdAt,
          };
        })
      );

      projectDetailsObj = {
        id: p._id,
        name: p.name,
        description: p.description,
        createdBy: creator,
        members: membersList.filter(Boolean),
        progress,
        tasks,
        createdAt: p.createdAt,
      };
    }

    res.status(200).json({ success: true, project: projectDetailsObj });
  } catch (error: any) {
    console.error('getProjectById error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving project details' });
  }
}

// PUT /api/projects/:id
export async function updateProject(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { id } = req.params;
  const { name, description, members } = req.body;

  try {
    const isMongo = getIsMongoConnected();
    let updatedObj = null;

    if (isMongo) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({ success: false, message: 'Invalid Project ID format' });
        return;
      }

      const prj = await Project.findById(id);
      if (!prj) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      if (name) prj.name = name;
      if (description !== undefined) prj.description = description;

      if (members) {
        // Enforce that owner/creator stays in the group
        const memberSet = new Set(members);
        memberSet.add(prj.createdBy.toString());
        prj.members = Array.from(memberSet);
      }

      await prj.save();

      const populated = await Project.findById(prj._id)
        .populate('createdBy', 'name email role avatar')
        .populate('members', 'name email role avatar');

      const progress = await calculateProjectProgress(prj._id.toString(), true);

      updatedObj = {
        id: prj._id.toString(),
        name: prj.name,
        description: prj.description,
        createdBy: populated?.createdBy,
        members: populated?.members,
        progress,
        createdAt: prj.createdAt,
      };
    } else {
      const prj = await dbService.getProjectById(id);
      if (!prj) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const updates: any = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;

      if (members) {
        const memberSet = new Set(members);
        memberSet.add(prj.createdBy);
        updates.members = Array.from(memberSet);
      }

      const updated = await dbService.updateProject(id, updates);
      if (updated) {
        const creator = await dbService.populateUser(updated.createdBy);
        const membersList = await Promise.all(updated.members.map(mId => dbService.populateUser(mId)));
        const progress = await calculateProjectProgress(updated._id, false);

        updatedObj = {
          id: updated._id,
          name: updated.name,
          description: updated.description,
          createdBy: creator,
          members: membersList.filter(Boolean),
          progress,
          createdAt: updated.createdAt,
        };
      }
    }

    res.status(200).json({ success: true, message: 'Project updated successfully', project: updatedObj });
  } catch (error: any) {
    console.error('updateProject error:', error);
    res.status(500).json({ success: false, message: 'Server error updating project' });
  }
}

// DELETE /api/projects/:id
export async function deleteProject(req: AuthenticatedRequest, res: Response): Promise<void> {
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
        res.status(400).json({ success: false, message: 'Invalid Project ID format' });
        return;
      }

      const prj = await Project.findById(id);
      if (!prj) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      // Cascade delete tasks first
      await Task.deleteMany({ project: id });
      await Project.findByIdAndDelete(id);
      isDeleted = true;
    } else {
      isDeleted = await dbService.deleteProject(id);
    }

    if (!isDeleted) {
      res.status(404).json({ success: false, message: 'Project not found or already deleted' });
      return;
    }

    res.status(200).json({ success: true, message: 'Project and all associated tasks deleted' });
  } catch (error: any) {
    console.error('deleteProject error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting project' });
  }
}
