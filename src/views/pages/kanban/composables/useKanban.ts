import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { kanbanApi } from '../services/kanbanApi';
import type { 
  KanbanBoard, 
  KanbanTask, 
  KanbanFilters, 
  TaskPosition,
  WebSocketMessage,
  TaskMoveMessage,
  TaskAssignMessage
} from '../types/kanban';

export function useKanban() {
  // Reactive state
  const loading = ref(false);
  const error = ref<string | null>(null);
  const kanbanData = ref<KanbanBoard | null>(null);
  const filters = ref<KanbanFilters>({});
  const selectedTasks = ref<string[]>([]);
  const websocket = ref<WebSocket | null>(null);
  
  // Computed properties
  const columns = computed(() => {
    if (!kanbanData.value) return {};
    return kanbanData.value.columns;
  });

  const totalTasks = computed(() => {
    if (!kanbanData.value) return 0;
    return kanbanData.value.totalTasks;
  });

  const userPermissions = computed(() => {
    if (!kanbanData.value) return {
      canCreateTasks: false,
      canEditAllTasks: false,
      canDeleteTasks: false,
      canAssignTasks: false
    };
    return kanbanData.value.userPermissions;
  });

  const filteredColumns = computed(() => {
    if (!kanbanData.value?.columns) return {};
    
    const filtered: Record<string, KanbanTask[]> = {};
    const cols = kanbanData.value.columns;
    
    Object.keys(cols).forEach(status => {
      const tasks = cols[status as keyof typeof cols] || [];
      
      // Apply search filter
      let filteredTasks: KanbanTask[] = [...tasks];
      if (filters.value.search) {
        const searchLower = filters.value.search.toLowerCase();
        filteredTasks = filteredTasks.filter((task: KanbanTask) => 
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.assignedUser?.email.toLowerCase().includes(searchLower) ||
          task.department.name.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply due date filter
      if (filters.value.dueDateRange) {
        const { start, end } = filters.value.dueDateRange;
        filteredTasks = filteredTasks.filter((task: KanbanTask) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          const startDate = new Date(start);
          const endDate = new Date(end);
          return dueDate >= startDate && dueDate <= endDate;
        });
      }
      
      filtered[status] = filteredTasks;
    });
    
    return filtered;
  });

  const hasSelectedTasks = computed(() => selectedTasks.value.length > 0);

  // Methods
  const loadKanbanData = async (forceRefresh = false) => {
    if (loading.value && !forceRefresh) return;
    
    try {
      loading.value = true;
      error.value = null;
      
      console.log('[useKanban] Loading cross-project kanban data with filters:', filters.value);
      const data = await kanbanApi.getKanbanBoard(filters.value);
      kanbanData.value = data;
      
      console.log('[useKanban] Kanban data loaded successfully:', {
        totalTasks: data.totalTasks,
        columns: Object.keys(data.columns).map(status => ({
          status,
          taskCount: data.columns[status as keyof typeof data.columns].length
        })),
        projectSummary: data.projectSummary?.length || 0
      });
      
    } catch (err: any) {
      console.error('[useKanban] Failed to load kanban data:', err);
      error.value = err.message || 'Failed to load kanban board';
    } finally {
      loading.value = false;
    }
  };

  const updateFilters = async (newFilters: Partial<KanbanFilters>) => {
    console.log('[useKanban] Updating filters:', newFilters);
    filters.value = { ...filters.value, ...newFilters };
    await loadKanbanData(true);
  };

  const moveTask = async (taskId: string, position: TaskPosition) => {
    try {
      console.log('[useKanban] Moving task:', { taskId, position });
      
      const result = await kanbanApi.updateTaskPosition(taskId, position);
      
      // Update local state optimistically
      if (kanbanData.value) {
        // Remove task from old column
        Object.keys(kanbanData.value.columns).forEach(status => {
          const column = kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns];
          const taskIndex = column.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            const [task] = column.splice(taskIndex, 1);
            // Add task to new column
            task.status = position.status;
            task.order = position.order;
            kanbanData.value!.columns[position.status].splice(position.order, 0, task);
          }
        });
        
        // Update affected tasks order
        result.affectedTasks.forEach(({ id, order }) => {
          const task = findTaskById(id);
          if (task) {
            task.order = order;
          }
        });
        
        // Sort columns by order
        Object.keys(kanbanData.value.columns).forEach(status => {
          kanbanData.value!.columns[status as keyof typeof kanbanData.value.columns]
            .sort((a, b) => a.order - b.order);
        });
      }
      
      return result;
    } catch (err: any) {
      console.error('[useKanban] Failed to move task:', err);
      error.value = err.message || 'Failed to move task';
      // Refresh data to revert optimistic update
      await loadKanbanData(true);
      throw err;
    }
  };

  const findTaskById = (taskId: string): KanbanTask | null => {
    if (!kanbanData.value) return null;
    
    for (const status of Object.keys(kanbanData.value.columns)) {
      const tasks = kanbanData.value.columns[status as keyof typeof kanbanData.value.columns];
      const task = tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  };

  const toggleTaskSelection = (taskId: string) => {
    const index = selectedTasks.value.indexOf(taskId);
    if (index === -1) {
      selectedTasks.value.push(taskId);
    } else {
      selectedTasks.value.splice(index, 1);
    }
  };

  const selectAllTasks = (columnStatus?: string) => {
    if (!kanbanData.value) return;
    
    if (columnStatus) {
      const columnTasks = kanbanData.value.columns[columnStatus as keyof typeof kanbanData.value.columns];
      const taskIds = columnTasks.map(task => task.id);
      selectedTasks.value = [...new Set([...selectedTasks.value, ...taskIds])];
    } else {
      // Select all tasks
      const allTaskIds: string[] = [];
      Object.values(kanbanData.value.columns).forEach(tasks => {
        allTaskIds.push(...tasks.map(task => task.id));
      });
      selectedTasks.value = allTaskIds;
    }
  };

  const clearSelection = () => {
    selectedTasks.value = [];
  };

  const isTaskSelected = (taskId: string) => {
    return selectedTasks.value.includes(taskId);
  };

  // WebSocket real-time updates
  const connectWebSocket = () => {
    try {
      console.log('[useKanban] Connecting WebSocket for cross-project updates');
      
      websocket.value = kanbanApi.createWebSocketConnection('all-projects', handleWebSocketMessage);
      
    } catch (err) {
      console.error('[useKanban] Failed to connect WebSocket:', err);
    }
  };

  const disconnectWebSocket = () => {
    if (websocket.value) {
      console.log('[useKanban] Disconnecting WebSocket');
      websocket.value.close();
      websocket.value = null;
    }
  };

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    console.log('[useKanban] WebSocket message received:', message);
    
    switch (message.type) {
      case 'TASK_MOVED':
        handleTaskMoved(message as TaskMoveMessage);
        break;
      case 'TASK_ASSIGNED':
        handleTaskAssigned(message as TaskAssignMessage);
        break;
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
        // Refresh data for these events
        loadKanbanData(true);
        break;
    }
  };

  const handleTaskMoved = (message: TaskMoveMessage) => {
    if (!kanbanData.value) return;
    
    const task = findTaskById(message.taskId);
    if (task && task.status !== message.data.toStatus) {
      // Move task between columns
      const fromColumn = kanbanData.value.columns[message.data.fromStatus as keyof typeof kanbanData.value.columns];
      const toColumn = kanbanData.value.columns[message.data.toStatus as keyof typeof kanbanData.value.columns];
      
      const taskIndex = fromColumn.findIndex(t => t.id === message.taskId);
      if (taskIndex !== -1) {
        const [movedTask] = fromColumn.splice(taskIndex, 1);
        movedTask.status = message.data.toStatus as any;
        movedTask.order = message.data.toOrder;
        toColumn.push(movedTask);
        
        // Sort columns
        fromColumn.sort((a, b) => a.order - b.order);
        toColumn.sort((a, b) => a.order - b.order);
      }
    }
  };

  const handleTaskAssigned = (message: TaskAssignMessage) => {
    // Refresh data to get updated assignment info
    loadKanbanData(true);
  };

  // Watchers
  watch(() => filters.value, () => {
    loadKanbanData(true);
  }, { deep: true });

  // Lifecycle
  onMounted(() => {
    loadKanbanData();
    connectWebSocket();
  });

  onUnmounted(() => {
    disconnectWebSocket();
  });

  return {
    // State
    loading,
    error,
    kanbanData,
    filters,
    selectedTasks,
    
    // Computed
    columns: filteredColumns,
    totalTasks,
    userPermissions,
    hasSelectedTasks,
    
    // Methods
    loadKanbanData,
    updateFilters,
    moveTask,
    findTaskById,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    isTaskSelected,
    connectWebSocket,
    disconnectWebSocket
  };
}
