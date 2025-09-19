<template>
  <div class="kanban-column" :class="columnClasses">
    <!-- Column Header -->
    <div class="column-header" :style="{ borderTopColor: column.color }">
      <div class="header-content">
        <div class="column-info">
          <v-icon :color="column.color" class="mr-2">
            {{ getColumnIcon(column.status) }}
          </v-icon>
          <h3 class="column-title">{{ column.title }}</h3>
          <v-chip 
            size="small" 
            variant="outlined" 
            :color="column.color"
            class="ml-2"
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
  draggedTaskId.value = taskId;
};

const handleTaskDragEnd = () => {
  draggedTaskId.value = null;
  isDragOver.value = false;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  // Only clear drag over if leaving the column entirely
  const currentTarget = event.currentTarget as HTMLElement;
  const relatedTarget = event.relatedTarget as Node;
  if (currentTarget && !currentTarget.contains(relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;
  
  if (!draggedTaskId.value) return;
  
  // Calculate new position (append to end of column)
  const newPosition: TaskPosition = {
    taskId: draggedTaskId.value,
    status: props.column.status,
    order: props.tasks.length,
    departmentId: undefined // Will be handled by the API
  };
  
  emit('task-move', draggedTaskId.value, newPosition);
  draggedTaskId.value = null;
};
</script>

<style scoped>
.kanban-column {
  width: 320px;
  min-width: 320px;
  max-width: 320px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--erp-card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--erp-border);
  transition: all 0.2s ease;
}

.column-header {
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--erp-border);
  border-radius: 12px 12px 0 0;
  border-top: 3px solid transparent;
  background: var(--erp-surface);
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
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 1rem 1.25rem;
  transition: all 0.2s ease;
}

.column-content.drag-over {
  background: rgba(59, 130, 246, 0.05);
  border: 2px dashed rgba(59, 130, 246, 0.3);
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
    width: 280px;
    min-width: 280px;
    max-width: 280px;
  }
  
  .column-header {
    padding: 0.75rem 1rem;
  }
  
  .column-content {
    padding: 0.75rem 1rem;
  }
  
  .column-title {
    font-size: 0.8125rem;
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
