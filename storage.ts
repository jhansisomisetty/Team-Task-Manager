import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

export interface IDBUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'member';
  avatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDBProject {
  _id: string;
  name: string;
  description: string;
  members: string[]; // user IDs
  createdBy: string; // user ID
  createdAt: string;
  updatedAt: string;
}

export interface IDBTask {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string; // user ID
  project: string; // project ID
  createdBy: string; // user ID
  createdAt: string;
  updatedAt: string;
}

interface IDatabase {
  users: IDBUser[];
  projects: IDBProject[];
  tasks: IDBTask[];
}

// Generate a random 24-character hexadecimal string to look like an ObjectId
function generateId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

class LocalStorageEngine {
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
          }
          if (!fs.existsSync(DATA_FILE)) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            const initialData: IDatabase = {
              users: [
                {
                  _id: '60c72b2f9b1d8e1234567891',
                  name: 'System Admin',
                  email: 'admin@teamtask.com',
                  password: hashedPassword,
                  role: 'admin',
                  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567892',
                  name: 'Team Member',
                  email: 'member@teamtask.com',
                  password: hashedPassword,
                  role: 'member',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567893',
                  name: 'Alex Rivera',
                  email: 'alex@teamtask.com',
                  password: hashedPassword,
                  role: 'member',
                  avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&h=150&q=80',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ],
              projects: [
                {
                  _id: '60c72b2f9b1d8e1234567894',
                  name: 'Website Redesign 2026',
                  description: 'Revamping the primary marketing website and porting it to Vite + Tailwind v4.',
                  members: ['60c72b2f9b1d8e1234567891', '60c72b2f9b1d8e1234567892', '60c72b2f9b1d8e1234567893'],
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567895',
                  name: 'Mobile App Beta Launch',
                  description: 'Finalizing core notifications, testing App Store connect, and scheduling launch.',
                  members: ['60c72b2f9b1d8e1234567891', '60c72b2f9b1d8e1234567893'],
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ],
              tasks: [
                {
                  _id: '60c72b2f9b1d8e1234567896',
                  title: 'Design high-fidelity Tailwind layouts',
                  description: 'Create components, landing page cards, dashboard overview graphs, and responsive tables.',
                  status: 'completed',
                  priority: 'high',
                  dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                  assignedTo: '60c72b2f9b1d8e1234567892',
                  project: '60c72b2f9b1d8e1234567894',
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567897',
                  title: 'Integrate auth middleware & JWT utility',
                  description: 'Hook up authentication endpoints, password hashing, and cookie support on server.',
                  status: 'in_progress',
                  priority: 'medium',
                  dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days layout
                  assignedTo: '60c72b2f9b1d8e1234567892',
                  project: '60c72b2f9b1d8e1234567894',
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567898',
                  title: 'Perform end-to-end security audits',
                  description: 'Ensure route protections, check admin clearance levels, and secure confidential payloads.',
                  status: 'pending',
                  priority: 'high',
                  dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
                  assignedTo: '60c72b2f9b1d8e1234567893',
                  project: '60c72b2f9b1d8e1234567894',
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                },
                {
                  _id: '60c72b2f9b1d8e1234567899',
                  title: 'Prepare final bundle and deploy to Railway',
                  description: 'Build scripts, bundlers, and ensure local environment variables support proper MongoDB connectors.',
                  status: 'pending',
                  priority: 'low',
                  dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
                  assignedTo: '60c72b2f9b1d8e1234567891',
                  project: '60c72b2f9b1d8e1234567895',
                  createdBy: '60c72b2f9b1d8e1234567891',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
              ]
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
          }
        } catch (e) {
          console.error("Local Storage Seed failed:", e);
        }
      })();
    }
  }

  public async getDatabase(): Promise<IDatabase> {
    await this.initPromise;
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content) as IDatabase;
    } catch {
      return { users: [], projects: [], tasks: [] };
    }
  }

  public async saveDatabase(db: IDatabase): Promise<void> {
    await this.initPromise;
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  }

  // User Actions
  public async getUsers(): Promise<IDBUser[]> {
    const db = await this.getDatabase();
    return db.users;
  }

  public async getUserById(id: string): Promise<IDBUser | null> {
    const db = await this.getDatabase();
    return db.users.find(u => u._id === id) || null;
  }

  public async getUserByEmail(email: string): Promise<IDBUser | null> {
    const db = await this.getDatabase();
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async createUser(userData: Partial<IDBUser>): Promise<IDBUser> {
    const db = await this.getDatabase();
    const newUser: IDBUser = {
      _id: generateId(),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password || '',
      role: userData.role || 'member',
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name || 'User')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.users.push(newUser);
    await this.saveDatabase(db);
    return newUser;
  }

  public async updateUser(id: string, userData: Partial<IDBUser>): Promise<IDBUser | null> {
    const db = await this.getDatabase();
    const index = db.users.findIndex(u => u._id === id);
    if (index === -1) return null;

    db.users[index] = {
      ...db.users[index],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    await this.saveDatabase(db);
    return db.users[index];
  }

  // Project Actions
  public async getProjects(): Promise<IDBProject[]> {
    const db = await this.getDatabase();
    return db.projects;
  }

  public async getProjectById(id: string): Promise<IDBProject | null> {
    const db = await this.getDatabase();
    return db.projects.find(p => p._id === id) || null;
  }

  public async createProject(projectData: Partial<IDBProject>): Promise<IDBProject> {
    const db = await this.getDatabase();
    const newProject: IDBProject = {
      _id: generateId(),
      name: projectData.name || '',
      description: projectData.description || '',
      members: projectData.members || [],
      createdBy: projectData.createdBy || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.projects.push(newProject);
    await this.saveDatabase(db);
    return newProject;
  }

  public async updateProject(id: string, projectData: Partial<IDBProject>): Promise<IDBProject | null> {
    const db = await this.getDatabase();
    const index = db.projects.findIndex(p => p._id === id);
    if (index === -1) return null;

    db.projects[index] = {
      ...db.projects[index],
      ...projectData,
      updatedAt: new Date().toISOString()
    };
    await this.saveDatabase(db);
    return db.projects[index];
  }

  public async deleteProject(id: string): Promise<boolean> {
    const db = await this.getDatabase();
    const initialLen = db.projects.length;
    db.projects = db.projects.filter(p => p._id !== id);
    db.tasks = db.tasks.filter(t => t.project !== id); // Cascade delete tasks
    await this.saveDatabase(db);
    return db.projects.length < initialLen;
  }

  // Task Actions
  public async getTasks(): Promise<IDBTask[]> {
    const db = await this.getDatabase();
    return db.tasks;
  }

  public async getTaskById(id: string): Promise<IDBTask | null> {
    const db = await this.getDatabase();
    return db.tasks.find(t => t._id === id) || null;
  }

  public async createTask(taskData: Partial<IDBTask>): Promise<IDBTask> {
    const db = await this.getDatabase();
    const newTask: IDBTask = {
      _id: generateId(),
      title: taskData.title || '',
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate || new Date().toISOString(),
      assignedTo: taskData.assignedTo || '',
      project: taskData.project || '',
      createdBy: taskData.createdBy || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.tasks.push(newTask);
    await this.saveDatabase(db);
    return newTask;
  }

  public async updateTask(id: string, taskData: Partial<IDBTask>): Promise<IDBTask | null> {
    const db = await this.getDatabase();
    const index = db.tasks.findIndex(t => t._id === id);
    if (index === -1) return null;

    db.tasks[index] = {
      ...db.tasks[index],
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    await this.saveDatabase(db);
    return db.tasks[index];
  }

  public async deleteTask(id: string): Promise<boolean> {
    const db = await this.getDatabase();
    const initialLen = db.tasks.length;
    db.tasks = db.tasks.filter(t => t._id !== id);
    await this.saveDatabase(db);
    return db.tasks.length < initialLen;
  }

  // Population Helpers
  public async populateUser(userId: string): Promise<Omit<IDBUser, 'password'> | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  public async populateProject(projectId: string): Promise<IDBProject | null> {
    return await this.getProjectById(projectId);
  }
}

export const dbService = new LocalStorageEngine();
