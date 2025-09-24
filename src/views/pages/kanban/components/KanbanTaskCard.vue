<template>
  <div 
    class="kanban-task-card"
    :class="cardClasses"
    :draggable="draggable"
    :aria-label="`Task: ${task.title}. Priority: ${task.priority}. Status: ${task.status}`"
    :tabindex="0"
    role="button"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Selection Checkbox -->
    <div v-if="showSelection" class="task-selection" @click.stop>
      <v-checkbox
        :model-value="selected"
        density="compact"
        hide-details
        @update:model-value="$emit('select')"
      />
    </div>

    <!-- Priority Badge -->
    <div class="task-priority">
      <v-chip
        :color="getPriorityColor(task.priority)"
        size="x-small"
        variant="flat"
      >
        {{ task.priority }}
      </v-chip>
    </div>

    <!-- Task Title -->
    <h4 class="task-title">{{ task.title }}</h4>

    <!-- Task Description -->
    <p v-if="task.description" class="task-description">
      {{ task.description }}
    </p>

    <!-- Task Meta Information -->
    <div class="task-meta">
      <!-- Project -->
      <div class="meta-item">
        <v-icon size="14" color="primary">mdi-folder</v-icon>
        <span class="meta-text">{{ task.project.name }}</span>
      </div>

      <!-- Department -->
      <div class="meta-item">
        <v-icon size="14" color="grey">mdi-office-building</v-icon>
        <span class="meta-text">{{ task.department.name }}</span>
      </div>

      <!-- Due Date -->
      <div v-if="task.dueDate" class="meta-item" :class="dueDateClasses">
        <v-icon size="14" :color="dueDateColor">mdi-calendar</v-icon>
        <span class="meta-text">{{ formatDueDate(task.dueDate) }}</span>
      </div>

      <!-- Progress -->
      <div v-if="task.progress !== undefined" class="meta-item">
        <v-icon size="14" color="grey">mdi-progress-check</v-icon>
        <span class="meta-text">{{ task.progress }}%</span>
      </div>

      <!-- Estimated Hours -->
      <div v-if="task.estimatedHours" class="meta-item">
        <v-icon size="14" color="grey">mdi-clock-outline</v-icon>
        <span class="meta-text">{{ task.estimatedHours }}h</span>
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="task.progress !== undefined" class="progress-section">
      <v-progress-linear
        :model-value="task.progress"
        :color="getProgressColor(task.progress)"
        height="4"
        rounded
      />
    </div>

    <!-- Checklist Progress -->
    <div v-if="task.checklistCount" class="checklist-section">
      <div class="checklist-progress">
        <v-icon size="16" color="grey">mdi-format-list-checks</v-icon>
        <span class="checklist-text">
          {{ task.checklistCompleted || 0 }}/{{ task.checklistCount }} tasks
        </span>
        <v-progress-circular
          :model-value="checklistProgress"
          :color="getProgressColor(checklistProgress)"
          size="20"
          width="2"
        />
      </div>
    </div>

    <!-- Task Footer -->
    <div class="task-footer">
      <!-- Assignee -->
      <div class="task-assignee">
        <v-avatar
          v-if="task.assignedUser"
          size="24"
          :color="getAvatarColor(task.assignedUser.email)"
        >
          <v-img
            v-if="task.assignedUser.avatar"
            :src="task.assignedUser.avatar"
            :alt="task.assignedUser.name || task.assignedUser.email"
          />
          <span v-else class="text-caption">
            {{ getInitials(task.assignedUser.name || task.assignedUser.email) }}
          </span>
        </v-avatar>
        <v-avatar
          v-else
          size="24"
          color="grey-lighten-2"
        >
          <v-icon size="16" color="grey">mdi-account-outline</v-icon>
        </v-avatar>
      </div>

      <!-- Task Actions -->
      <div class="task-actions">
        <v-btn
          v-if="userPermissions.canEditAllTasks || task.canEdit"
          icon
          size="x-small"
          variant="text"
          aria-label="Edit task"
          @click.stop="$emit('edit')"
        >
          <v-icon size="16">mdi-pencil</v-icon>
        </v-btn>
        
        <v-menu>
          <template #activator="{ props: menuProps }">
            <v-btn
              icon
              size="x-small"
              variant="text"
              aria-label="Task options"
              v-bind="menuProps"
              @click.stop
            >
              <v-icon size="16">mdi-dots-horizontal</v-icon>
            </v-btn>
          </template>
          
          <v-list density="compact">
            <v-list-item
              prepend-icon="mdi-eye"
              title="View Details"
              @click="$emit('view')"
            />
            <v-list-item
              v-if="userPermissions.canEditAllTasks || task.canEdit"
              prepend-icon="mdi-pencil"
              title="Edit Task"
              @click="$emit('edit')"
            />
            <v-list-item
              v-if="userPermissions.canAssignTasks"
              prepend-icon="mdi-account-arrow-right"
              title="Reassign"
              @click="$emit('reassign')"
            />
            <v-divider v-if="userPermissions.canDeleteTasks || task.canDelete" />
            <v-list-item
              v-if="userPermissions.canDeleteTasks || task.canDelete"
              prepend-icon="mdi-delete"
              title="Delete"
              class="text-error"
              @click="$emit('delete')"
            />
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Drag Handle -->
    <div v-if="draggable" class="drag-handle" aria-label="Drag to move task">
      <v-icon size="16" color="grey-lighten-1" aria-hidden="true">mdi-drag-vertical</v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KanbanTask } from '../types/kanban';

interface Props {
  task: KanbanTask;
  index: number;
  selected: boolean;
  userPermissions: {
    canCreateTasks: boolean;
    canEditAllTasks: boolean;
    canDeleteTasks: boolean;
    canAssignTasks: boolean;
  };
  draggable?: boolean;
  showSelection?: boolean;
}

interface Emits {
  (e: 'click'): void;
  (e: 'select'): void;
  (e: 'edit'): void;
  (e: 'view'): void;
  (e: 'reassign'): void;
  (e: 'delete'): void;
  (e: 'drag-start', taskId: string): void;
  (e: 'drag-end'): void;
}

const props = withDefaults(defineProps<Props>(), {
  draggable: false,
  showSelection: false
});

const emit = defineEmits<Emits>();

// Computed properties
const cardClasses = computed(() => ({
  'task-selected': props.selected,
  'task-draggable': props.draggable,
  'task-overdue': isOverdue.value,
  'task-due-soon': isDueSoon.value
}));

const isOverdue = computed(() => {
  if (!props.task.dueDate) return false;
  return new Date(props.task.dueDate) < new Date();
});

const isDueSoon = computed(() => {
  if (!props.task.dueDate || isOverdue.value) return false;
  const dueDate = new Date(props.task.dueDate);
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 3;
});

const dueDateClasses = computed(() => ({
  'meta-overdue': isOverdue.value,
  'meta-due-soon': isDueSoon.value
}));

const dueDateColor = computed(() => {
  if (isOverdue.value) return 'error';
  if (isDueSoon.value) return 'warning';
  return 'grey';
});

const checklistProgress = computed(() => {
  if (!props.task.checklistCount) return 0;
  return Math.round(((props.task.checklistCompleted || 0) / props.task.checklistCount) * 100);
});

// Methods
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'success';
    default: return 'grey';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 100) return 'success';
  if (progress >= 75) return 'info';
  if (progress >= 50) return 'warning';
  if (progress >= 25) return 'orange';
  return 'error';
};

const getAvatarColor = (email: string) => {
  const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
  const index = email.charCodeAt(0) % colors.length;
  return colors[index];
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatDueDate = (dueDate: string) => {
  const date = new Date(dueDate);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays > 1 && diffDays <= 7) return `${diffDays} days`;
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

const handleClick = () => {
  emit('click');
};

const handleDragStart = (event: DragEvent) => {
  if (!props.draggable) return;
  
  event.dataTransfer!.effectAllowed = 'move';
  event.dataTransfer!.setData('text/plain', props.task.id);
  
  // Add a drag image
  const dragImage = event.currentTarget as HTMLElement;
  event.dataTransfer!.setDragImage(dragImage, 0, 0);
  
  emit('drag-start', props.task.id);
};

const handleDragEnd = () => {
  emit('drag-end');
};
</script>

<style scoped>
.kanban-task-card {
  position: relative;
  background: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.kanban-task-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.task-selected {
  border-color: rgba(59, 130, 246, 0.5);
  background: rgba(59, 130, 246, 0.05);
}

.task-draggable {
  cursor: grab;
}

.task-draggable:active {
  cursor: grabbing;
}

.task-overdue {
  border-left: 4px solid #ef4444;
}

.task-due-soon {
  border-left: 4px solid #f59e0b;
}

.task-selection {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.task-priority {
  margin-bottom: 0.75rem;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  word-break: break-word;
}

.task-description {
  font-size: 0.8125rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.meta-text {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.meta-overdue .meta-text {
  color: #ef4444;
  opacity: 1;
  font-weight: 500;
}

.meta-due-soon .meta-text {
  color: #f59e0b;
  opacity: 1;
  font-weight: 500;
}

.progress-section {
  margin-bottom: 0.75rem;
}

.checklist-section {
  margin-bottom: 0.75rem;
}

.checklist-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.checklist-text {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  flex: 1;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-assignee {
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.kanban-task-card:hover .task-actions {
  opacity: 1;
}

.drag-handle {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-draggable:hover .drag-handle {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .kanban-task-card {
    padding: 0.875rem;
    min-height: 120px;
  }
  
  .task-title {
    font-size: 0.875rem;
    line-height: 1.3;
    margin-bottom: 0.625rem;
  }
  
  .task-description {
    font-size: 0.8125rem;
    line-height: 1.4;
    margin-bottom: 0.875rem;
  }
  
  .task-meta {
    gap: 0.5rem;
    margin-bottom: 0.875rem;
  }
  
  .meta-item {
    gap: 0.5rem;
  }
  
  .meta-text {
    font-size: 0.8125rem;
  }
  
  .task-actions {
    opacity: 1;
  }
  
  .task-actions .v-btn {
    min-width: 28px;
    height: 28px;
  }
  
  .task-assignee .v-avatar {
    width: 28px !important;
    height: 28px !important;
  }
  
  .progress-section,
  .checklist-section {
    margin-bottom: 0.875rem;
  }
}

@media (max-width: 480px) {
  .kanban-task-card {
    padding: 0.75rem;
    min-height: 100px;
  }
  
  .task-title {
    font-size: 0.8125rem;
    margin-bottom: 0.5rem;
  }
  
  .task-description {
    font-size: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .task-meta {
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }
  
  .meta-item {
    gap: 0.375rem;
  }
  
  .meta-text {
    font-size: 0.75rem;
  }
  
  .task-actions .v-btn {
    min-width: 24px;
    height: 24px;
  }
  
  .task-assignee .v-avatar {
    width: 24px !important;
    height: 24px !important;
  }
  
  .task-priority .v-chip {
    font-size: 0.625rem;
    height: 20px;
  }
  
  .progress-section,
  .checklist-section {
    margin-bottom: 0.75rem;
  }
}

/* Large screen optimizations */
@media (min-width: 1440px) {
  .kanban-task-card {
    padding: 1.25rem;
    min-height: 140px;
  }
  
  .task-title {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .task-description {
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .task-meta {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .meta-text {
    font-size: 0.8125rem;
  }
  
  .task-actions .v-btn {
    min-width: 36px;
    height: 36px;
  }
  
  .task-assignee .v-avatar {
    width: 32px !important;
    height: 32px !important;
  }
  
  .task-priority .v-chip {
    font-size: 0.75rem;
    height: 24px;
  }
}

@media (min-width: 1920px) {
  .kanban-task-card {
    padding: 1.5rem;
    min-height: 160px;
  }
  
  .task-title {
    font-size: 1.125rem;
    margin-bottom: 0.875rem;
  }
  
  .task-description {
    font-size: 1rem;
    margin-bottom: 1.25rem;
  }
  
  .task-meta {
    gap: 0.625rem;
    margin-bottom: 1.25rem;
  }
  
  .meta-text {
    font-size: 0.875rem;
  }
  
  .task-actions .v-btn {
    min-width: 40px;
    height: 40px;
  }
  
  .task-assignee .v-avatar {
    width: 36px !important;
    height: 36px !important;
  }
  
  .task-priority .v-chip {
    font-size: 0.8125rem;
    height: 26px;
  }
}
</style>
