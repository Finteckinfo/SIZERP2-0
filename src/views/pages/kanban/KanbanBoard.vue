<template>
  <div class="kanban-board">
    <!-- Header -->
    <div class="kanban-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="board-title">
            <v-icon class="mr-3" color="primary">mdi-view-column</v-icon>
            Kanban Board
          </h1>
          <div class="board-stats" v-if="!loading">
            <v-chip size="small" variant="outlined" class="mr-2">
              <v-icon start size="16">mdi-format-list-bulleted</v-icon>
              {{ totalTasks }} Tasks
            </v-chip>
            <v-chip 
              v-if="hasSelectedTasks" 
              size="small" 
              color="primary" 
              variant="flat"
              class="mr-2"
            >
              <v-icon start size="16">mdi-check-circle</v-icon>
              {{ selectedTasks.length }} Selected
            </v-chip>
          </div>
        </div>
        
        <div class="header-right">
          <v-btn
            v-if="hasSelectedTasks"
            variant="outlined"
            size="small"
            class="mr-2"
            @click="clearSelection"
          >
            <v-icon start>mdi-close</v-icon>
            Clear Selection
          </v-btn>
          
          <v-btn
            v-if="hasSelectedTasks"
            color="primary"
            size="small"
            class="mr-2"
            @click="showBulkActions = true"
          >
            <v-icon start>mdi-format-list-checks</v-icon>
            Bulk Actions
          </v-btn>
          
          <v-btn
            v-if="userPermissions.canCreateTasks"
            color="primary"
            @click="showCreateTask = true"
          >
            <v-icon start>mdi-plus</v-icon>
            New Task
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <KanbanFilters
      :filters="filters"
      :loading="loading"
      @update:filters="updateFilters"
      @refresh="loadKanbanData(true)"
    />

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-row>
        <v-col v-for="i in 4" :key="i" cols="12" md="3">
          <v-skeleton-loader type="card" />
        </v-col>
      </v-row>
    </div>

    <!-- Error State -->
    <v-alert
      v-if="error && !loading"
      type="error"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex align-center justify-space-between">
        <span>{{ error }}</span>
        <v-btn
          variant="text"
          size="small"
          @click="loadKanbanData(true)"
        >
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- Kanban Columns -->
    <div v-if="!loading && !error" class="kanban-columns">
      <div class="columns-container">
        <KanbanColumn
          v-for="column in columnConfigs"
          :key="column.id"
          :column="column"
          :tasks="(columns as any)[column.status] || []"
          :selected-tasks="selectedTasks"
          :user-permissions="userPermissions"
          @task-click="handleTaskClick"
          @task-select="toggleTaskSelection"
          @task-move="handleTaskMove"
          @add-task="handleAddTask"
          @column-action="handleColumnAction"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-if="!loading && !error && totalTasks === 0" 
      class="empty-state"
    >
      <div class="empty-content">
        <v-icon size="64" color="grey-lighten-1">mdi-view-column-outline</v-icon>
        <h3 class="text-h5 mt-4 mb-2">No tasks found</h3>
        <p class="text-body-1 mb-4">
          {{ filters.search || Object.keys(filters).length > 1 
            ? 'Try adjusting your filters to see more tasks.' 
            : 'Create your first task to get started.' }}
        </p>
        <v-btn
          v-if="userPermissions.canCreateTasks"
          color="primary"
          @click="showCreateTask = true"
        >
          <v-icon start>mdi-plus</v-icon>
          Create Task
        </v-btn>
      </div>
    </div>

    <!-- Task Detail Modal -->
    <TaskDetailModal
      v-model="showTaskDetail"
      :task="selectedTask"
      :user-permissions="userPermissions"
      @task-updated="handleTaskUpdated"
      @task-deleted="handleTaskDeleted"
    />

    <!-- Create Task Modal -->
    <CreateTaskModal
      v-model="showCreateTask"
      :project-id="projectId"
      @task-created="handleTaskCreated"
    />

    <!-- Bulk Actions Modal -->
    <BulkActionsModal
      v-model="showBulkActions"
      :task-ids="selectedTasks"
      :project-id="projectId"
      @actions-completed="handleBulkActionsCompleted"
    />

    <!-- Analytics Drawer -->
    <KanbanAnalytics
      v-model="showAnalytics"
      :project-id="projectId"
    />

    <!-- Floating Action Button for Analytics -->
    <v-btn
      class="analytics-fab"
      color="secondary"
      icon
      size="large"
      elevation="4"
      @click="showAnalytics = true"
    >
      <v-icon>mdi-chart-line</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useKanban } from './composables/useKanban';
import { DEFAULT_COLUMNS } from './types/kanban';
import type { KanbanTask, TaskPosition } from './types/kanban';

// Import kanban styles
import './styles/kanban.css';

// Components
import KanbanFilters from './components/KanbanFilters.vue';
import KanbanColumn from './components/KanbanColumn.vue';
import TaskDetailModal from './components/TaskDetailModal.vue';
import CreateTaskModal from './components/CreateTaskModal.vue';
import BulkActionsModal from './components/BulkActionsModal.vue';
import KanbanAnalytics from './components/KanbanAnalytics.vue';

// Route and project ID
const route = useRoute();
const projectId = computed(() => route.query.projectId as string || '');

// Kanban composable
const {
  loading,
  error,
  columns,
  totalTasks,
  userPermissions,
  selectedTasks,
  hasSelectedTasks,
  filters,
  loadKanbanData,
  updateFilters,
  moveTask,
  toggleTaskSelection,
  clearSelection
} = useKanban(projectId.value);

// Local state
const showTaskDetail = ref(false);
const showCreateTask = ref(false);
const showBulkActions = ref(false);
const showAnalytics = ref(false);
const selectedTask = ref<KanbanTask | null>(null);

// Column configurations
const columnConfigs = computed(() => DEFAULT_COLUMNS);

// Methods
const handleTaskClick = (task: KanbanTask) => {
  selectedTask.value = task;
  showTaskDetail.value = true;
};

const handleTaskMove = async (taskId: string, position: TaskPosition) => {
  try {
    await moveTask(taskId, position);
  } catch (error) {
    console.error('Failed to move task:', error);
  }
};

const handleAddTask = (columnStatus: string) => {
  // Pre-fill the create task modal with the column status
  showCreateTask.value = true;
};

const handleColumnAction = (action: string, columnStatus: string) => {
  switch (action) {
    case 'select-all':
      // Implementation handled in useKanban
      break;
    case 'clear-column':
      // Future feature
      break;
    case 'collapse':
      // Future feature
      break;
  }
};

const handleTaskUpdated = (updatedTask: KanbanTask) => {
  // Refresh the board to show updates
  loadKanbanData(true);
  showTaskDetail.value = false;
};

const handleTaskDeleted = (taskId: string) => {
  // Refresh the board to remove deleted task
  loadKanbanData(true);
  showTaskDetail.value = false;
};

const handleTaskCreated = (newTask: KanbanTask) => {
  // Refresh the board to show new task
  loadKanbanData(true);
  showCreateTask.value = false;
};

const handleBulkActionsCompleted = () => {
  // Refresh the board and clear selection
  loadKanbanData(true);
  clearSelection();
  showBulkActions.value = false;
};

// Lifecycle
onMounted(() => {
  if (!projectId.value) {
    error.value = 'No project ID provided. Please select a project.';
  }
});
</script>

<style scoped>
.kanban-board {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--erp-background);
  overflow: hidden;
}

.kanban-header {
  flex-shrink: 0;
  background: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  padding: 1.5rem 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.board-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  display: flex;
  align-items: center;
}

.board-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.kanban-columns {
  flex: 1;
  overflow: hidden;
  padding: 1rem 2rem;
}

.columns-container {
  display: flex;
  gap: 1.5rem;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 1rem;
}

.loading-container {
  padding: 2rem;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.analytics-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
}

/* Responsive Design */
@media (max-width: 768px) {
  .kanban-header {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-left {
    width: 100%;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-start;
  }
  
  .kanban-columns {
    padding: 1rem;
  }
  
  .columns-container {
    gap: 1rem;
  }
  
  .analytics-fab {
    bottom: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .board-title {
    font-size: 1.25rem;
  }
  
  .board-stats {
    flex-wrap: wrap;
  }
  
  .header-right {
    flex-wrap: wrap;
  }
}
</style>
