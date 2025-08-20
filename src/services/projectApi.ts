import axios from 'axios';

// Production backend URL - hardcoded for Vercel deployment
// Vercel environment variables are not available at runtime in the browser
const API_BASE_URL = 'https://sizerpbackend2-0-production.up.railway.app/api';

// Helper function to get authentication headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    // Get JWT token from your "API" template
    const token = await window.Clerk?.session?.getToken({ 
      template: "API" 
    });
    
    if (token) {
      console.log('Got JWT token from API template:', token.substring(0, 20) + '...');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    
    // Fallback to session token if JWT template fails
    const sessionToken = await window.Clerk?.session?.getToken();
    if (sessionToken) {
      console.log('Fallback to session token:', sessionToken.substring(0, 20) + '...');
      return {
        'Authorization': `Bearer ${sessionToken}`,
        'Content-Type': 'application/json'
      };
    }
    
    console.warn('No Clerk token available');
    return {
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Failed to get JWT token:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

// Types based on your Prisma schema
export interface Project {
  id: string;
  name: string;
  description?: string;
  type: 'PROGRESSIVE' | 'PARALLEL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  budgetRange?: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  type: 'MAJOR' | 'MINOR';
  description?: string;
  order: number;
  isVisible: boolean;
  projectId: string;
  managers: UserRole[];
  accessibleRoles: UserRole[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  departmentId: string;
  assignedRoleId?: string;
  employeeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  projectId: string;
  role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  departmentOrder: string[];
  departmentScope: string[];
  managedDepartments: Department[];
  accessibleDepartments: Department[];
  assignedTasks: Task[];
  createdAt: string;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvite {
  id: string;
  email: string;
  role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  project: Project;
  projectId: string;
  user?: User;
  userId?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTag {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
}

// New interfaces for the enhanced APIs
export interface CreateInviteData {
  email: string;
  role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  projectId: string;
  expiresAt: string;
}

export interface CreateDepartmentData {
  name: string;
  type: 'MAJOR' | 'MINOR';
  description?: string;
  order: number;
  projectId: string;
  isVisible?: boolean;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  departmentId: string;
  assignedRoleId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// Project Management APIs
export const projectApi = {
  // Get all projects with filtering
  getProjects: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/projects`, { params, headers });
    return response.data;
  },

  // Get single project
  getProject: async (projectId: string) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, { headers });
    return response.data;
  },

  // Create project
  createProject: async (projectData: {
    name: string;
    description?: string;
    type: 'PROGRESSIVE' | 'PARALLEL';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    budgetRange?: string;
    startDate: string;
    endDate: string;
  }) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/projects`, projectData, { headers });
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, updates: Partial<Project>) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}`, updates);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}`);
    return response.data;
  }
};

// Project Invite APIs
export const projectInviteApi = {
  // Get all invites for a user (when they log in)
  getUserInvites: async (userId: string): Promise<ProjectInvite[]> => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/invites/user/${userId}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch user invites');
    return response.json();
  },
  
  // Get all invites for a project (for project owner to see)
  getProjectInvites: async (projectId: string): Promise<ProjectInvite[]> => {
    const response = await fetch(`${API_BASE_URL}/invites/project/${projectId}`);
    if (!response.ok) throw new Error('Failed to fetch project invites');
    return response.json();
  },
  
  // Accept/decline an invite
  respondToInvite: async (inviteId: string, status: 'ACCEPTED' | 'DECLINED'): Promise<ProjectInvite> => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) throw new Error('Failed to respond to invite');
    return response.json();
  },
  
  // Create invite (for project owner)
  createInvite: async (data: CreateInviteData): Promise<ProjectInvite> => {
    const response = await fetch(`${API_BASE_URL}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create invite');
    return response.json();
  },
  
  // Resend/update invite
  updateInvite: async (inviteId: string, data: Partial<ProjectInvite>): Promise<ProjectInvite> => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update invite');
    return response.json();
  },
  
  // Delete invite
  deleteInvite: async (inviteId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/invites/${inviteId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete invite');
  }
};

// User Role APIs
export const userRoleApi = {
  // Get project users
  getProjectUsers: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/users`);
    return response.data;
  },

  // Add user to project
  addUserToProject: async (projectId: string, userData: {
    email: string;
    role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
    departmentScope?: string[];
  }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/users`, userData);
    return response.data;
  },

  // Update user role
  updateUserRole: async (projectId: string, userId: string, updates: Partial<UserRole>) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/users/${userId}`, updates);
    return response.data;
  },

  // Remove user from project
  removeUserFromProject: async (projectId: string, userId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/users/${userId}`);
    return response.data;
  },
  
  // Get user's role in a specific project
  getUserRoleInProject: async (userId: string, projectId: string): Promise<UserRole | null> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/user-roles/project/${projectId}/user/${userId}`, { headers });
    if (response.status === 404) return null;
    return response.data;
  },
  
  // Update user role (for project owner)
  updateUserRoleById: async (roleId: string, data: Partial<UserRole>) => {
    const response = await axios.patch(`${API_BASE_URL}/user-roles/${roleId}`, data);
    return response.data;
  },
  
  // Remove user from project (for project owner)
  removeUserFromProjectById: async (roleId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/user-roles/${roleId}`);
    return response.data;
  },
  
  // Get all users in a project with their roles
  getProjectTeam: async (projectId: string): Promise<UserRole[]> => {
    const response = await axios.get(`${API_BASE_URL}/user-roles/project/${projectId}`);
    return response.data;
  },
  
  // Assign user to department
  assignUserToDepartment: async (roleId: string, departmentId: string) => {
    const response = await axios.post(`${API_BASE_URL}/user-roles/${roleId}/departments/${departmentId}`);
    return response.data;
  }
};

// Department APIs
export const departmentApi = {
  // Get project departments
  getProjectDepartments: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/departments`);
    return response.data;
  },

  // Create department (for project owner/manager)
  createDepartment: async (data: CreateDepartmentData): Promise<Department> => {
    const response = await axios.post(`${API_BASE_URL}/departments`, data);
    return response.data;
  },
  
  // Update department
  updateDepartment: async (departmentId: string, data: Partial<Department>): Promise<Department> => {
    const response = await axios.patch(`${API_BASE_URL}/departments/${departmentId}`, data);
    return response.data;
  },
  
  // Delete department
  deleteDepartment: async (departmentId: string): Promise<void> => {
    const response = await axios.delete(`${API_BASE_URL}/departments/${departmentId}`);
    return response.data;
  },
  
  // Reorder departments
  reorderDepartments: async (projectId: string, departmentIds: string[]): Promise<Department[]> => {
    const response = await axios.patch(`${API_BASE_URL}/departments/project/${projectId}/reorder`, {
      departmentIds
    });
    return response.data;
  }
};

// Task APIs
export const taskApi = {
  // Get project tasks
  getProjectTasks: async (projectId: string, params?: {
    departmentId?: string;
    status?: string;
    employeeId?: string;
    search?: string;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/tasks`, { params });
    return response.data;
  },

  // Create task (for project owner/manager)
  createTask: async (data: CreateTaskData): Promise<Task> => {
    const response = await axios.post(`${API_BASE_URL}/tasks`, data);
    return response.data;
  },
  
  // Update task
  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, data);
    return response.data;
  },
  
  // Delete task
  deleteTask: async (taskId: string): Promise<void> => {
    const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    return response.data;
  },
  
  // Assign task to user role
  assignTaskToRole: async (taskId: string, roleId: string): Promise<Task> => {
    const response = await axios.post(`${API_BASE_URL}/tasks/${taskId}/assign/${roleId}`);
    return response.data;
  },
  
  // Get tasks by department
  getTasksByDepartment: async (departmentId: string): Promise<Task[]> => {
    const response = await axios.get(`${API_BASE_URL}/tasks/department/${departmentId}`);
    return response.data;
  }
};

// Tag APIs
export const tagApi = {
  // Get project tags
  getProjectTags: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/tags`);
    return response.data;
  },

  // Add tag
  addTag: async (projectId: string, tagData: { name: string }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/tags`, tagData);
    return response.data;
  },

  // Remove tag
  removeTag: async (projectId: string, tagId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/tags/${tagId}`);
    return response.data;
  }
};

// Global User APIs
export const userApi = {
  // Search users
  searchUsers: async (params?: {
    search?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/users`, { params });
    return response.data;
  },

  // Get user details
  getUser: async (userId: string) => {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  }
};
