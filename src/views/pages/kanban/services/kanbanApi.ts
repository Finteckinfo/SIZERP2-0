import axios from 'axios';
import { authService } from '@/services/authService';
import type { 
  KanbanBoard, 
  KanbanFilters, 
  TaskPosition, 
  BulkTaskUpdate, 
  BulkUpdateResult,
  TaskActivity,
  KanbanMetrics,
  WebSocketMessage 
} from '../types/kanban';

// Backend URL from environment
const API_BASE_URL_ENV = (import.meta as any).env?.VITE_BACKEND_URL as string | undefined;
const API_BASE_URL = (API_BASE_URL_ENV || '').replace(/\/+$/, '');

if (!API_BASE_URL) {
  console.warn('[kanbanApi] VITE_BACKEND_URL is not set. Please define it in your .env file.');
}

// Centralized axios instance with proper JWT authentication interceptor
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await authService.getJWTToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('[kanbanApi] Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    console.error('[kanbanApi] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[kanbanApi] API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn('[kanbanApi] Authentication error - user may need to re-login');
    }
    
    return Promise.reject(error);
  }
);

export const kanbanApi = {
  /**
   * Get kanban board data with tasks organized by status columns
   */
  getKanbanBoard: async (projectId: string, filters?: KanbanFilters): Promise<KanbanBoard> => {
    const params = new URLSearchParams();
    
    if (filters?.departmentId) {
      params.append('departmentId', filters.departmentId);
    }
    
    if (filters?.assignedRoleIds?.length) {
      filters.assignedRoleIds.forEach(roleId => {
        params.append('assignedRoleIds', roleId);
      });
    }
    
    if (filters?.priorities?.length) {
      filters.priorities.forEach(priority => {
        params.append('priorities', priority);
      });
    }
    
    if (filters?.includeCompleted !== undefined) {
      params.append('includeCompleted', filters.includeCompleted.toString());
    }

    const queryString = params.toString();
    const url = `/api/tasks/kanban/${projectId}${queryString ? '?' + queryString : ''}`;
    
    console.log('[kanbanApi] Fetching kanban board:', { projectId, filters, url });
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Update task position for drag & drop functionality
   */
  updateTaskPosition: async (taskId: string, position: TaskPosition): Promise<{
    taskId: string;
    status: string;
    order: number;
    updatedAt: string;
    affectedTasks: Array<{ id: string; order: number }>;
  }> => {
    console.log('[kanbanApi] Updating task position:', { taskId, position });
    
    const response = await api.patch(`/api/tasks/${taskId}/position`, {
      status: position.status,
      order: position.order,
      departmentId: position.departmentId
    });
    
    return response.data;
  },

  /**
   * Bulk update multiple tasks
   */
  bulkUpdateTasks: async (bulkUpdate: BulkTaskUpdate): Promise<BulkUpdateResult> => {
    console.log('[kanbanApi] Bulk updating tasks:', bulkUpdate);
    
    const response = await api.patch('/api/tasks/bulk-update', {
      taskIds: bulkUpdate.taskIds,
      updates: bulkUpdate.updates
    });
    
    return response.data;
  },

  /**
   * Get task activity history
   */
  getTaskActivity: async (taskId: string): Promise<{
    taskId: string;
    activities: TaskActivity[];
  }> => {
    console.log('[kanbanApi] Fetching task activity:', taskId);
    
    const response = await api.get(`/api/tasks/${taskId}/activity`);
    return response.data;
  },

  /**
   * Get kanban performance metrics
   */
  getKanbanMetrics: async (
    projectId: string, 
    timeRange?: string, 
    departmentId?: string
  ): Promise<KanbanMetrics> => {
    const params = new URLSearchParams();
    
    if (timeRange) {
      params.append('timeRange', timeRange);
    }
    
    if (departmentId) {
      params.append('departmentId', departmentId);
    }

    const queryString = params.toString();
    const url = `/api/analytics/kanban/${projectId}/metrics${queryString ? '?' + queryString : ''}`;
    
    console.log('[kanbanApi] Fetching kanban metrics:', { projectId, timeRange, departmentId });
    
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Create WebSocket connection for real-time updates
   */
  createWebSocketConnection: (projectId: string, onMessage: (message: WebSocketMessage) => void): WebSocket | null => {
    try {
      // Get the WebSocket URL
      const wsUrl = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');
      
      // Get auth token for WebSocket connection
      authService.getJWTToken().then((token: string | null) => {
        if (!token) {
          console.error('[kanbanApi] No auth token available for WebSocket connection');
          return;
        }

        const ws = new WebSocket(`${wsUrl}/api/tasks/live/${projectId}?token=${token}`);
        
        ws.onopen = () => {
          console.log('[kanbanApi] WebSocket connected for project:', projectId);
        };
        
        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('[kanbanApi] WebSocket message received:', message);
            onMessage(message);
          } catch (error) {
            console.error('[kanbanApi] Failed to parse WebSocket message:', error);
          }
        };
        
        ws.onclose = (event) => {
          console.log('[kanbanApi] WebSocket closed:', { code: event.code, reason: event.reason });
        };
        
        ws.onerror = (error) => {
          console.error('[kanbanApi] WebSocket error:', error);
        };
        
        return ws;
      }).catch((error: any) => {
        console.error('[kanbanApi] Failed to get auth token for WebSocket:', error);
      });
      
      return null;
    } catch (error) {
      console.error('[kanbanApi] Failed to create WebSocket connection:', error);
      return null;
    }
  }
};

// Export the axios instance for direct use if needed
export { api as kanbanApiClient };
