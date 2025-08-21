import axios from 'axios';
import { authService } from './authService';

// Backend URL from environment (do NOT include '/api' here; we prefix per-request)
const API_BASE_URL_ENV = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const API_BASE_URL = (API_BASE_URL_ENV || '').replace(/\/+$/, '');
if (!API_BASE_URL) {
  console.warn('[projectApi] VITE_BACKEND_URL is not set. Please define it in your .env file.');
}

// Ensure the URL is correct and accessible
console.log('🌐 API Base URL configured:', API_BASE_URL || '(missing)');

// Centralized axios instance with proper JWT authentication interceptor
const api = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 second timeout
});

// Request interceptor - automatically adds JWT token to every request
api.interceptors.request.use(async (config) => {
  try {
    // Ensure all relative paths are prefixed with '/api'
    if (config.url && !config.url.startsWith('http')) {
      const path = config.url.startsWith('/api') ? config.url : `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      config.url = path;
    }
    // Check if Clerk is ready before making any API calls
    if (!window.Clerk?.session || !window.Clerk?.user) {
      console.log('🚫 Clerk not ready, blocking API request:', config.url);
      throw new Error('Clerk not ready - please wait for authentication');
    }

    const headers = await authService.getAuthHeaders();
    config.headers = {
      ...(config.headers || {}),
      ...headers
    } as any; // Cast to any to resolve TypeScript error with AxiosHeaders

    // Enhanced logging for JWT debugging
    const authHeader = config.headers.Authorization as string;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const payload = authService['decodeJWTPayload'](token);
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: true,
        userId: payload?.user_id || payload?.sub,
        email: payload?.email,
        audience: payload?.aud,
        tokenPreview: token.substring(0, 30) + '...'
      });
    } else {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        hasAuth: false,
        error: 'No Authorization header'
      });
    }
  } catch (error) {
    console.error('❌ Failed to get auth headers:', error);
    throw new Error('Authentication required');
  }
  return config;
});

// Response interceptor - handles authentication errors globally
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error('🚨 API ERROR - FULL DETAILS FOR DEBUGGING:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      requestHeaders: error.config?.headers,
      responseHeaders: error.response?.headers,
      responseData: error.response?.data,
      requestBody: error.config?.data,
      timestamp: new Date().toISOString(),
      fullError: error
    });

    // Handle authentication errors globally
    if (error.response?.status === 401) {
      console.error('🔥 401 ERROR - CALLING AUTH ERROR HANDLER');
      authService.handleAuthError(error);
    }
    
    return Promise.reject(error);
  }
);

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
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  userId: string;
  projectId: string;
  role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
  departmentOrder: number[];
  departmentScope: number[];
  managedDepartments: Department[];
  accessibleDepartments: Department[];
  assignedTasks: Task[];
  createdAt: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInvite {
  id: string;
  projectId: string;
  email: string;
  role: 'PROJECT_MANAGER' | 'EMPLOYEE';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  expiresAt: string;
  createdAt: string;
  project: Project;
}

export interface ProjectTag {
  id: string;
  name: string;
  color: string;
  projectId: string;
  createdAt: string;
}

// API request data types
export interface CreateInviteData {
  projectId: string;
  email: string;
  role: 'PROJECT_MANAGER' | 'EMPLOYEE';
  departmentId?: string;
}

export interface CreateDepartmentData {
  name: string;
  type: 'MAJOR' | 'MINOR';
  description?: string;
  projectId?: string; // Optional for creation, will be set by backend
  order: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  departmentId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  estimatedHours?: number;
  dueDate?: string;
}

// Project Management APIs
export const projectApi = {
  // Get user's projects (filtered by backend)
  getProjects: async (params?: {
    search?: string;
    status?: string;
    priority?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get(`/projects/my-projects`, { params });
    return response.data;
  },

  // Get user's projects (simple, no pagination - perfect for dashboards)
  getUserProjectsSimple: async () => {
    const response = await api.get(`/projects/my-projects/simple`);
    return response.data;
  },

  // Get project by ID
  getProject: async (projectId: string) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData: {
    name: string;
    description?: string;
    type: 'PROGRESSIVE' | 'PARALLEL';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    budgetRange?: string;
    startDate: string;
    endDate: string;
    departments: CreateDepartmentData[];
    roles: {
      userEmail: string; // Match the frontend usage
      role: 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE';
      departmentId?: string | null; // Allow null for PROJECT_OWNER
    }[];
  }) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId: string, projectData: Partial<Project>) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId: string) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  }
};

// Project Invite APIs
export const projectInviteApi = {
  // Get user's invites (new endpoint)
  getUserInvites: async () => {
    const response = await api.get('/project-invites');
    return response.data;
  },

  // Get sent invites
  getSentInvites: async () => {
    const response = await api.get('/project-invites/sent');
    return response.data;
  },

  // Get specific invite
  getInvite: async (inviteId: string) => {
    const response = await api.get(`/project-invites/${inviteId}`);
    return response.data;
  },

  // Create invite
  createInvite: async (inviteData: CreateInviteData) => {
    const response = await api.post('/project-invites', inviteData);
    return response.data;
  },

  // Update invite
  updateInvite: async (inviteId: string, inviteData: Partial<ProjectInvite>) => {
    const response = await api.put(`/project-invites/${inviteId}`, inviteData);
    return response.data;
  },

  // Delete invite
  deleteInvite: async (inviteId: string) => {
    const response = await api.delete(`/project-invites/${inviteId}`);
    return response.data;
  },

  // Accept invite
  acceptInvite: async (inviteId: string) => {
    const response = await api.post(`/project-invites/${inviteId}/accept`);
    return response.data;
  },

  // Decline invite
  declineInvite: async (inviteId: string) => {
    const response = await api.post(`/project-invites/${inviteId}/decline`);
    return response.data;
  },

  // Resend invite
  resendInvite: async (inviteId: string) => {
    const response = await api.post(`/project-invites/${inviteId}/resend`);
    return response.data;
  },

  // Get project invites
  getProjectInvites: async (projectId: string) => {
    const response = await api.get(`/project-invites/project/${projectId}`);
    return response.data;
  },

  // Get user invites (legacy endpoint for backward compatibility)
  getUserInvitesLegacy: async (userId: string) => {
    const response = await api.get(`/project-invites/user/${userId}`);
    return response.data;
  },

  // Expire invite
  expireInvite: async (inviteId: string) => {
    const response = await api.patch(`/project-invites/${inviteId}/expire`);
    return response.data;
  },

  // Get invite statistics
  getInviteStats: async () => {
    const response = await api.get('/project-invites/stats');
    return response.data;
  },

  // Legacy respond to invite (for backward compatibility)
  respondToInvite: async (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => {
    if (status === 'ACCEPTED') {
      return await projectInviteApi.acceptInvite(inviteId);
    } else {
      return await projectInviteApi.declineInvite(inviteId);
    }
  }
};

// User Role APIs
export const userRoleApi = {
  // Get user role in project
  getUserRoleInProject: async (projectId: string, userId: string) => {
    const response = await api.get(`/user-roles/project/${projectId}/user/${userId}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (roleId: string, roleData: Partial<UserRole>) => {
    const response = await api.put(`/user-roles/${roleId}`, roleData);
    return response.data;
  },

  // Delete user role
  deleteUserRole: async (roleId: string) => {
    const response = await api.delete(`/user-roles/${roleId}`);
    return response.data;
  },

  // Get project user roles
  getProjectUserRoles: async (projectId: string) => {
    const response = await api.get(`/user-roles/project/${projectId}`);
    return response.data;
  },

  // Assign department to user role
  assignDepartmentToRole: async (roleId: string, departmentId: string) => {
    const response = await api.post(`/user-roles/${roleId}/departments/${departmentId}`);
    return response.data;
  }
};

// Department APIs
export const departmentApi = {
  // Create department
  createDepartment: async (departmentData: CreateDepartmentData) => {
    const response = await api.post('/departments', departmentData);
    return response.data;
  },

  // Update department
  updateDepartment: async (departmentId: string, departmentData: Partial<Department>) => {
    const response = await api.put(`/departments/${departmentId}`, departmentData);
    return response.data;
  },

  // Delete department
  deleteDepartment: async (departmentId: string) => {
    const response = await api.delete(`/departments/${departmentId}`);
    return response.data;
  },

  // Get project departments
  getProjectDepartments: async (projectId: string) => {
    const response = await api.get(`/departments/project/${projectId}`);
    return response.data;
  },

  // Reorder project departments
  reorderProjectDepartments: async (projectId: string, departmentOrder: { id: string; order: number }[]) => {
    const response = await api.put(`/departments/project/${projectId}/reorder`, { departmentOrder });
    return response.data;
  }
};

// Task APIs
export const taskApi = {
  // Create task
  createTask: async (taskData: CreateTaskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId: string, taskData: Partial<Task>) => {
    const response = await api.put(`/tasks/${taskId}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    const response = await api.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Assign task to role
  assignTaskToRole: async (taskId: string, roleId: string) => {
    const response = await api.post(`/tasks/${taskId}/assign/${roleId}`);
    return response.data;
  },

  // Get department tasks
  getDepartmentTasks: async (departmentId: string) => {
    const response = await api.get(`/tasks/department/${departmentId}`);
    return response.data;
  },

  // Get project tasks (legacy support)
  getProjectTasks: async (projectId: string) => {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  }
};

// Tag APIs
export const tagApi = {
  // Get project tags
  getProjectTags: async (projectId: string) => {
    const response = await api.get(`/tags/project/${projectId}`);
    return response.data;
  },

  // Create tag
  createTag: async (tagData: Omit<ProjectTag, 'id' | 'createdAt'>) => {
    const response = await api.post('/tags', tagData);
    return response.data;
  },

  // Update tag
  updateTag: async (tagId: string, tagData: Partial<ProjectTag>) => {
    const response = await api.put(`/tags/${tagId}`, tagData);
    return response.data;
  },

  // Delete tag
  deleteTag: async (tagId: string) => {
    const response = await api.delete(`/tags/${tagId}`);
    return response.data;
  }
};

// Auth APIs
export const authApi = {
  // Sync user with backend after Clerk authentication
  syncUser: async (userData: {
    userId: string;
    email: string;
    firstName?: string;
    lastName?: string;
  }) => {
    console.log('🔄 Calling sync endpoint with data:', userData);
    console.log('🌐 Full URL:', `${API_BASE_URL}/api/auth/sync-user`);
    
    const response = await api.post('/auth/sync-user', userData);
    console.log('✅ Sync response:', response.data);
    return response.data;
  },
  
  // Get current authenticated user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Health check for auth system
  healthCheck: async () => {
    console.log('🏥 Testing backend health...');
    const response = await api.get('/auth/health');
    console.log('✅ Health check response:', response.data);
    return response.data;
  },

  // Test backend connectivity
  testBackendConnection: async () => {
    try {
      console.log('🔍 Testing backend connectivity...');
      const response = await fetch(`${API_BASE_URL}/api/auth/health`);
      const data = await response.json();
      console.log('✅ Backend connectivity test:', data);
      return data;
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      throw error;
    }
  }
};

// User APIs
export const userApi = {
  // Get user profile
  getUserProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (userId: string, userData: Partial<User>) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  }
};
