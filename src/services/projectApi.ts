import axios from 'axios';

const API_BASE_URL = process.env.VUE_APP_API_URL || '/api';

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
  managerId?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
  departmentId: string;
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
  projectId: string;
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

export interface ProjectDraft {
  id: string;
  projectId: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

// Project Management APIs
export const projectApi = {
  // Get all projects with filtering
  getProjects: async (params?: {
    search?: string;
    type?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await axios.get(`${API_BASE_URL}/projects`, { params });
    return response.data;
  },

  // Get single project
  getProject: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
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
    ownerId: string;
    userId: string; // Required by backend validation
    walletAddress: string; // Required by backend validation
    departmentIds: string[];
    tagNames: string[];
  }) => {
    const response = await axios.post(`${API_BASE_URL}/projects`, projectData);
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

// Department APIs
export const departmentApi = {
  // Get project departments
  getProjectDepartments: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/departments`);
    return response.data;
  },

  // Create department
  createDepartment: async (projectId: string, departmentData: {
    name: string;
    type: 'MAJOR' | 'MINOR';
    description?: string;
    order: number;
    managerId?: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/departments`, departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (projectId: string, departmentId: string, updates: Partial<Department>) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/departments/${departmentId}`, updates);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (projectId: string, departmentId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/departments/${departmentId}`);
    return response.data;
  },

  // Reorder departments
  reorderDepartments: async (projectId: string, departmentIdsInOrder: string[]) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/departments/reorder`, {
      departmentIdsInOrder
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

  // Create task
  createTask: async (projectId: string, taskData: {
    title: string;
    description?: string;
    departmentId: string;
    employeeId?: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/tasks`, taskData);
    return response.data;
  },

  // Update task
  updateTask: async (projectId: string, taskId: string, updates: Partial<Task>) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (projectId: string, taskId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`);
    return response.data;
  },

  // Change task status
  updateTaskStatus: async (projectId: string, taskId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED') => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}/status`, { status });
    return response.data;
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
    userId: string;
    role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
    departmentOrder?: string[];
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
  }
};

// Invite APIs
export const inviteApi = {
  // Get project invites
  getProjectInvites: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/invites`);
    return response.data;
  },

  // Send invite
  sendInvite: async (projectId: string, inviteData: {
    email: string;
    role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
    expiresAt: string;
  }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/invites`, inviteData);
    return response.data;
  },

  // Update invite status
  updateInviteStatus: async (projectId: string, inviteId: string, status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED') => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/invites/${inviteId}`, { status });
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

// Draft APIs
export const draftApi = {
  // Get project drafts
  getProjectDrafts: async (projectId: string) => {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/drafts`);
    return response.data;
  },

  // Save draft
  saveDraft: async (projectId: string, draftData: { data: any }) => {
    const response = await axios.post(`${API_BASE_URL}/projects/${projectId}/drafts`, draftData);
    return response.data;
  },

  // Update draft
  updateDraft: async (projectId: string, draftId: string, draftData: { data: any }) => {
    const response = await axios.patch(`${API_BASE_URL}/projects/${projectId}/drafts/${draftId}`, draftData);
    return response.data;
  },

  // Delete draft
  deleteDraft: async (projectId: string, draftId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/projects/${projectId}/drafts/${draftId}`);
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

// Global Department APIs
export const globalDepartmentApi = {
  // Get all departments
  getAllDepartments: async () => {
    const response = await axios.get(`${API_BASE_URL}/departments`);
    return response.data;
  },

  // Get department templates
  getDepartmentTemplates: async () => {
    const response = await axios.get(`${API_BASE_URL}/departments/templates`);
    return response.data;
  }
};

// Project Template APIs
export const projectTemplateApi = {
  // Get all templates
  getAllTemplates: async () => {
    const response = await axios.get(`${API_BASE_URL}/project-templates`);
    return response.data;
  },

  // Get template structure
  getTemplate: async (templateId: string) => {
    const response = await axios.get(`${API_BASE_URL}/project-templates/${templateId}`);
    return response.data;
  }
};
