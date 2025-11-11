<template>
  <div class="kanban-column" :class="columnClasses">
    <!-- Column Header -->
    <div class="column-header" :style="{ borderTopColor: column.color }">
      <div class="header-content">
        <div class="column-info">
          <v-icon :color="column.color" class="mr-2" aria-hidden="true">
            {{ getColumnIcon(column.status) }}
          </v-icon>
          <h3 class="column-title">{{ column.title }}</h3>
          <v-chip 
            size="small" 
            variant="outlined" 
            :color="column.color"
            class="ml-2"
            :aria-label="`${tasks.length} tasks in ${column.title}`"
          >
            {{ tasks.length }}
          </v-chip>
        </div>
        
        <div class="column-actions">
          <v-btn
            v-if="userPermissions.canCreateTasks"
            icon
            size="small"
            variant="text"
            :aria-label="`Add task to ${column.title}`"
            @click="$emit('add-task', column.status)"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
          
          <v-menu>
            <template #activator="{ props: menuProps }">
              <v-btn
                icon
                size="small"
                variant="text"
                aria-label="Column options"
                v-bind="menuProps"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            
            <v-list density="compact">
              <v-list-item
                prepend-icon="mdi-select-all"
                title="Select All"
                @click="selectAllTasks"
              />
              <v-list-item
                prepend-icon="mdi-eye-off"
                title="Collapse Column"
                @click="toggleCollapse"
              />
              <v-divider />
              <v-list-item
                prepend-icon="mdi-information"
                title="Column Info"
                @click="showColumnInfo = true"
              />
            </v-list>
          </v-menu>
        </div>
      </div>
      
      <!-- Column limit indicator -->
      <div v-if="column.limit && tasks.length >= column.limit" class="limit-indicator">
        <v-icon size="16" color="warning">mdi-alert</v-icon>
        <span class="text-caption">Limit reached ({{ column.limit }})</span>
      </div>
    </div>

    <!-- Column Content -->
    <div 
      v-show="!collapsed"
      class="column-content"
      :class="{ 'drag-over': isDragOver }"
      role="list"
      :aria-label="`${column.title} tasks`"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <!-- Tasks -->
      <div class="tasks-container">
        <KanbanTaskCard
          v-for="(task, index) in tasks"
          :key="task.id"
          :task="task"
          :index="index"
          :selected="selectedTasks.includes(task.id)"
          :user-permissions="userPermissions"
          :draggable="userPermissions.canEditAllTasks || task.canEdit"
          role="listitem"
          @click="$emit('task-click', task)"
          @select="$emit('task-select', task.id)"
          @drag-start="handleTaskDragStart"
          @drag-end="handleTaskDragEnd"
        />
      </div>

      <!-- Drop Zone -->
      <div 
        v-if="tasks.length === 0"
        class="empty-drop-zone"
        :class="{ 'drag-over': isDragOver }"
      >
        <v-icon size="48" color="grey-lighten-2">mdi-drag</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">
          Drop tasks here or click + to add
        </p>
      </div>
    </div>

    <!-- Collapsed State -->
    <div v-if="collapsed" class="collapsed-content">
      <v-btn
        variant="text"
        size="small"
        @click="toggleCollapse"
      >
        <v-icon class="mr-2">mdi-chevron-down</v-icon>
        Show {{ tasks.length }} tasks
      </v-btn>
    </div>

    <!-- Column Info Dialog -->
    <v-dialog v-model="showColumnInfo" max-width="400">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon :color="column.color" class="mr-2">
            {{ getColumnIcon(column.status) }}
          </v-icon>
          {{ column.title }}
        </v-card-title>
        
        <v-card-text>
          <div class="column-stats">
            <div class="stat-item">
              <span class="stat-label">Tasks:</span>
              <span class="stat-value">{{ tasks.length }}</span>
            </div>
            <div v-if="column.limit" class="stat-item">
              <span class="stat-label">Limit:</span>
              <span class="stat-value">{{ column.limit }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Status:</span>
              <span class="stat-value">{{ column.status }}</span>
            </div>
          </div>
          
          <p v-if="column.description" class="text-body-2 mt-3">
            {{ column.description }}
          </p>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showColumnInfo = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ColumnConfig, KanbanTask, TaskPosition } from '../types/kanban';
import KanbanTaskCard from './KanbanTaskCard.vue';

interface Props {
  column: ColumnConfig;
  tasks: KanbanTask[];
  selectedTasks: string[];
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
}

interface Emits {
  (e: 'task-click', task: KanbanTask): void;
  (e: 'task-select', taskId: string): void;
  (e: 'task-move', taskId: string, position: TaskPosition): void;
  (e: 'add-task', status: string): void;
  (e: 'column-action', action: string, status: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const collapsed = ref(false);
const isDragOver = ref(false);
const showColumnInfo = ref(false);
const draggedTaskId = ref<string | null>(null);

// Computed
const columnClasses = computed(() => ({
  'column-collapsed': collapsed.value,
  'column-drag-over': isDragOver.value,
  'column-limit-reached': props.column.limit && props.tasks.length >= props.column.limit
}));

// Methods
const getColumnIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    'PENDING': 'mdi-clipboard-text-outline',
    'IN_PROGRESS': 'mdi-clock-outline',
    'COMPLETED': 'mdi-check-circle',
    'APPROVED': 'mdi-check-all'
  };
  return iconMap[status] || 'mdi-circle';
};

const toggleCollapse = () => {
  collapsed.value = !collapsed.value;
  emit('column-action', 'collapse', props.column.status);
};

const selectAllTasks = () => {
  props.tasks.forEach(task => {
    if (!props.selectedTasks.includes(task.id)) {
      emit('task-select', task.id);
    }
  });
  emit('column-action', 'select-all', props.column.status);
};

// Drag and Drop handlers
const handleTaskDragStart = (taskId: string) => {
  console.log('[KanbanColumn] Task drag started:', {
    taskId,
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    currentTasksCount: props.tasks.length
  });
  draggedTaskId.value = taskId;
};

const handleTaskDragEnd = () => {
  console.log('[KanbanColumn] Task drag ended:', {
    taskId: draggedTaskId.value,
    columnStatus: props.column.status,
    wasDragOver: isDragOver.value
  });
  draggedTaskId.value = null;
  isDragOver.value = false;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  console.log('[KanbanColumn] Drag over column:', {
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    draggedTaskId: draggedTaskId.value,
    currentTasksCount: props.tasks.length
  });
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  // Only clear drag over if leaving the column entirely
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as Node;
  if (currentTarget && !currentTarget.contains(relatedTarget)) {
    console.log('[KanbanColumn] Drag left column:', {
      columnStatus: props.column.status,
      columnTitle: props.column.title,
      draggedTaskId: draggedTaskId.value
    });
    isDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  console.log('[KanbanColumn] Drop event triggered:', {
    columnStatus: props.column.status,
    columnTitle: props.column.title,
    draggedTaskId: draggedTaskId.value,
    currentTasksCount: props.tasks.length,
    dropEvent: {
      clientX: event.clientX,
      clientY: event.clientY,
      dataTransfer: event.dataTransfer?.types || []
    }
  });
  
  const dataTransferTaskId = event.dataTransfer?.getData('text/plain');
  const taskId = draggedTaskId.value || dataTransferTaskId || null;

  if (!taskId) {
    console.warn('[KanbanColumn] Drop event but no dragged task ID - ignoring');
    return;
  }
  
  // Calculate new position (append to end of column)
  const newPosition: TaskPosition = {
    taskId,
    status: props.column.status,
    order: props.tasks.length,
    departmentId: undefined // Will be handled by the API
  };
  
  console.log('[KanbanColumn] Emitting task-move event:', {
    taskId,
    newPosition,
    fromColumn: 'unknown', // We don't track source column here
    toColumn: props.column.status
  });
  
  emit('task-move', taskId, newPosition);
  draggedTaskId.value = null;
};
</script>

<style scoped>
.kanban-column {
  width: 380px;
  min-width: 380px;
  max-width: 380px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 
    0 10px 25px rgba(0, 0, 0, 0.1),
    0 4px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  /* Ensure columns maintain their size and don't compress */
  flex-grow: 0;
  flex-basis: 380px;
}

.kanban-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
  border-radius: 20px 20px 0 0;
}

.column-header {
  flex-shrink: 0;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 20px 20px 0 0;
  border-top: 3px solid transparent;
  background: rgba(248, 250, 252, 0.8);
  position: relative;
  z-index: 2;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.column-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.column-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.025em;
}

.column-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.limit-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 6px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.5rem 2rem;
  transition: all 0.3s ease;
  position: relative;
}

.column-content.drag-over {
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed rgba(59, 130, 246, 0.3);
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border: 2px dashed var(--erp-border);
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.empty-drop-zone.drag-over {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.collapsed-content {
  padding: 1rem 1.25rem;
  text-align: center;
}

.column-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: 500;
  color: var(--erp-text);
}

.stat-value {
  color: var(--erp-text);
  opacity: 0.8;
}

/* Column States */
.column-collapsed {
  max-height: 120px;
}

.column-limit-reached .column-header {
  background: rgba(245, 158, 11, 0.05);
}

.column-drag-over {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .kanban-column {
    width: 300px;
    min-width: 300px;
    max-width: 300px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-basis: 300px;
  }
  
  .column-header {
    padding: 0.875rem 1rem;
  }
  
  .column-content {
    padding: 0.875rem 1rem;
  }
  
  .column-title {
    font-size: 0.875rem;
  }
  
  .column-actions .v-btn {
    min-width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .kanban-column {
    width: 280px;
    min-width: 280px;
    max-width: 280px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-basis: 280px;
  }
  
  .column-header {
    padding: 0.75rem 0.875rem;
  }
  
  .column-content {
    padding: 0.75rem 0.875rem;
  }
  
  .column-title {
    font-size: 0.8125rem;
  }
  
  .column-actions .v-btn {
    min-width: 28px;
    height: 28px;
  }
  
  .empty-drop-zone {
    min-height: 100px;
    padding: 1rem;
  }
  
  .empty-drop-zone .v-icon {
    font-size: 36px !important;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .kanban-column {
    width: 420px;
    min-width: 420px;
    max-width: 420px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-basis: 420px;
  }
  
  .column-header {
    padding: 2rem 2.5rem;
  }
  
  .column-content {
    padding: 2rem 2.5rem;
  }
  
  .column-title {
    font-size: 1.25rem;
  }
  
  .tasks-container {
    gap: 1.25rem;
  }
}

@media (min-width: 1920px) {
  .kanban-column {
    width: 480px;
    min-width: 480px;
    max-width: 480px;
    flex-shrink: 0;
    flex-grow: 0;
    flex-basis: 480px;
  }
  
  .column-header {
    padding: 2.5rem 3rem;
  }
  
  .column-content {
    padding: 2.5rem 3rem;
  }
  
  .column-title {
    font-size: 1.375rem;
  }
  
  .tasks-container {
    gap: 1.5rem;
  }
}

/* Scrollbar styling */
.column-content::-webkit-scrollbar {
  width: 4px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--erp-border);
  border-radius: 2px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--erp-text);
  opacity: 0.3;
}
</style>
