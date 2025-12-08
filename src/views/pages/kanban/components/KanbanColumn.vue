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
          
          <v-menu :scrim="false" content-class="kanban-menu">
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
            
            <v-list density="compact" class="kanban-menu">
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
      :class="[
        { 'column-content-compact': compactView },
        { 'drag-over': isDragOver }
      ]"
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
          :compact="compactView"
          :inline-edit-handler="props.inlineEditHandler"
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
import { ref, computed, onMounted, watch } from 'vue';
import type { ColumnConfig, KanbanTask, KanbanTaskInlineUpdates, TaskPosition } from '../types/kanban';
import KanbanTaskCard from './KanbanTaskCard.vue';

interface InlineEditPayload {
  taskId: string;
  updates: KanbanTaskInlineUpdates;
}

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
  compactView?: boolean;
  initialCollapsed?: boolean;
  inlineEditHandler?: (payload: InlineEditPayload) => Promise<void>;
}

interface Emits {
  (e: 'task-click', task: KanbanTask): void;
  (e: 'task-select', taskId: string): void;
  (e: 'task-move', taskId: string, position: TaskPosition): void;
  (e: 'add-task', status: string): void;
  (e: 'column-action', action: string, status: string, payload?: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  compactView: false,
  initialCollapsed: false,
});
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

onMounted(() => {
  collapsed.value = props.initialCollapsed ?? false;
});

watch(
  () => props.initialCollapsed,
  (newVal) => {
    collapsed.value = newVal ?? false;
  }
);

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
  emit('column-action', 'collapse', props.column.status, { collapsed: collapsed.value });
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
    ColumnHeaderActions: 'ColumnHeaderActions',
    ColumnBody: 'ColumnBody',
    ColumnFooter: 'ColumnFooter',
  },
  {
    columnTitle: props.column.title,
    currentTasksCount: props.tasks.length
  });
  draggedTaskId.value = taskId;
};

const handleTaskDragEnd = (taskId?: string) => {
  console.log('[KanbanColumn] Task drag ended:', {
    taskId: taskId || draggedTaskId.value,
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
  
  // Find the task being moved to check permissions
  let sourceTask: any = null;
  Object.keys(props.column).forEach(() => {
    const task = props.tasks.find(t => t.id === taskId);
    if (task) {
      sourceTask = task;
    }
  });
  
  // Check if moving to APPROVED column - only project owner can approve tasks
  if (props.column.status === 'APPROVED') {
    // Check if user has permission to approve (only project owners)
    if (!sourceTask?.canApprove && !props.userPermissions.canEditAllTasks) {
      console.warn('[KanbanColumn] Only project owner can approve tasks - ignoring drop');
      // Show a visual feedback that the action was denied
      const toast = document.createElement('div');
      toast.textContent = '⚠️ Only the project owner can approve tasks';
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      return;
    }
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
  width: 340px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 22px;
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  position: relative;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.kanban-column::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.06), transparent 55%);
  opacity: 0.9;
  pointer-events: none;
}

.kanban-column:hover {
  transform: translateY(-4px);
  box-shadow: 0 35px 65px rgba(15, 23, 42, 0.16);
}

.column-header {
  flex-shrink: 0;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(244, 250, 246, 0.95));
  position: sticky;
  top: 0;
  z-index: 2;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.column-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.column-title {
  font-size: 1.05rem;
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
  margin-top: 0.75rem;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--erp-primary) 10%, var(--erp-surface));
  border: 1px solid color-mix(in srgb, var(--erp-primary) 30%, transparent);
}

.column-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1.25rem 1.5rem 1.75rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(249, 251, 255, 0.85));
  border-radius: 0 0 22px 22px;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.column-content.drag-over {
  background: color-mix(in srgb, var(--erp-primary) 18%, rgba(255, 255, 255, 0.95));
  border: 1px dashed color-mix(in srgb, var(--erp-primary) 50%, transparent);
}

.tasks-container {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.empty-drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  border: 2px dashed rgba(203, 213, 225, 0.9);
  border-radius: 16px;
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
  color: var(--erp-text);
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.empty-drop-zone.drag-over {
  border-color: rgba(16, 185, 129, 0.5);
  background: rgba(236, 253, 245, 0.85);
  transform: translateY(-2px);
}

.collapsed-content {
  padding: 1rem 1.25rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  border-top: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 0 0 22px 22px;
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
  color: var(--erp-text);
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  opacity: 0.8;
}

.column-collapsed {
  max-height: 140px;
}

.column-limit-reached .column-header {
  background: color-mix(in srgb, var(--erp-primary) 12%, var(--erp-surface));
}

.column-drag-over {
  transform: translateY(-4px);
  box-shadow: 0 28px 50px rgba(15, 23, 42, 0.18);
}

@media (max-width: 1024px) {
  .kanban-column {
    width: 300px;
    min-width: 300px;
  }
}

@media (max-width: 768px) {
  .kanban-column {
    width: 100%;
    min-width: 100%;
    border-radius: 20px;
  }

  .column-header,
  .column-content {
    padding: 1rem 1.1rem;
  }

  .tasks-container {
    gap: 0.75rem;
  }
}

.column-content::-webkit-scrollbar {
  width: 6px;
}

.column-content::-webkit-scrollbar-track {
  background: transparent;
}

.column-content::-webkit-scrollbar-thumb {
  background: var(--erp-border);
  border-radius: 3px;
}

.column-content::-webkit-scrollbar-thumb:hover {
  background: var(--erp-text);
  opacity: 0.4;
}

::global(.dark-theme) .kanban-column {
  background: rgba(15, 23, 42, 0.9);
  border-color: rgba(51, 65, 85, 0.8);
  box-shadow: 0 25px 45px rgba(2, 6, 23, 0.8);
}

::global(.dark-theme) .column-header {
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.85));
  border-bottom-color: rgba(51, 65, 85, 0.7);
}

::global(.dark-theme) .column-content {
  background: rgba(15, 23, 42, 0.85);
}

::global(.dark-theme) .empty-drop-zone {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(59, 130, 246, 0.35);
}
</style>
