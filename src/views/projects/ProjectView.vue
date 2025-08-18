<template>
  <div class="project-view">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <ProjectHeader
        project-name="Northern Light"
        :team-members="headerTeamMembers"
        search-placeholder="Search Tasks"
        back-route="/dashboard/default"
        @search="handleSearch"
      />

      <!-- Main Content -->
      <div class="main-content">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">Loading project data...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <v-alert type="error" class="mb-4">
            {{ error }}
          </v-alert>
          <v-btn color="primary" @click="loadProjectData">Retry</v-btn>
        </div>

        <!-- Content -->
        <div v-else>
          <!-- Project Stats -->
          <ProjectStats :stats="projectStats" />

          <!-- Kanban Board -->
          <div class="kanban-board">
            <div class="kanban-columns">
              <KanbanColumn
                v-for="column in kanbanColumns"
                :key="column.status"
                :title="column.title"
                :status="column.status"
                :tasks="getProjectsByStatus(column.status)"
                @add-task="handleAddTask(column.status)"
                @column-menu="handleColumnMenu(column.status)"
                @task-click="openProjectDetails"
              />
            </div>
          </div>
        </div>

        <!-- Customize Button -->
        <v-btn
          class="customize-btn"
          color="primary"
          variant="outlined"
          icon
          size="large"
        >
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ProjectHeader, ProjectStats, KanbanColumn } from './components';
import { projectApi, taskApi, userRoleApi, type Project, type Task, type UserRole } from '@/services/projectApi';

const router = useRouter();

// Real project data from API
const projects = ref<Project[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Load data from API
const loadProjectData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Load projects
    const projectsResponse = await projectApi.getProjects();
    projects.value = projectsResponse.projects || [];
    
    // Load tasks for all projects
    const allTasks: Task[] = [];
    for (const project of projects.value) {
      const tasksResponse = await taskApi.getProjectTasks(project.id);
      allTasks.push(...(tasksResponse.tasks || []));
    }
    tasks.value = allTasks;
    
    // Load team members for current project (assuming first project for now)
    if (projects.value.length > 0) {
      const teamResponse = await userRoleApi.getProjectUsers(projects.value[0].id);
      teamMembers.value = teamResponse.userRoles || [];
    }
  } catch (err) {
    error.value = 'Failed to load project data';
    console.error('Error loading project data:', err);
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  loadProjectData();
});

// Team members for header (mapped from UserRole)
const headerTeamMembers = computed(() => {
  return teamMembers.value.map(member => ({
    color: getAvatarColor(member.user?.firstName || member.user?.email || ''),
    name: member.user?.firstName || member.user?.email || ''
  }));
});

// Kanban columns configuration (mapped to your TaskStatus enum)
const kanbanColumns = ref([
  { status: 'PENDING', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'Doing' },
  { status: 'COMPLETED', title: 'Completed' },
  { status: 'APPROVED', title: 'Approved' }
]);

// Computed properties
const projectStats = computed(() => {
  const total = projects.value.length;
  const active = projects.value.filter(p => p.startDate && p.endDate && new Date() >= new Date(p.startDate) && new Date() <= new Date(p.endDate)).length;
  const pending = projects.value.filter(p => p.startDate && new Date() < new Date(p.startDate)).length;
  const completed = projects.value.filter(p => p.endDate && new Date() > new Date(p.endDate)).length;
  
  return [
    { key: 'total', label: 'Total Projects', value: total, icon: 'mdi-folder', color: 'primary' },
    { key: 'active', label: 'Active', value: active, icon: 'mdi-play-circle', color: 'success' },
    { key: 'pending', label: 'Pending', value: pending, icon: 'mdi-clock', color: 'warning' },
    { key: 'completed', label: 'Completed', value: completed, icon: 'mdi-check-circle', color: 'info' }
  ];
});

// Helper functions
const getProjectsByStatus = (status: string) => {
  // Map tasks to project-like objects for kanban display
  const statusTasks = tasks.value.filter(task => task.status === status);
  return statusTasks.map(task => {
    const project = projects.value.find(p => p.id === task.departmentId);
    return {
      id: task.id,
      name: task.title,
      description: task.description || '',
      status: task.status,
      priority: 'MEDIUM', // Default priority
      startDate: task.createdAt,
      endDate: task.updatedAt,
      progress: task.status === 'COMPLETED' ? 100 : task.status === 'IN_PROGRESS' ? 50 : 0,
      teamSize: 1,
      views: 0,
      departments: project ? [{ name: project.name, type: 'MAJOR' }] : [],
      assignees: [{ color: 'blue' }] // Default assignee color
    };
  });
};

const getAvatarColor = (name: string) => {
  const colors = ['red', 'purple', 'blue', 'green', 'orange', 'black'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Event handlers
const handleSearch = (query: string) => {
  console.log('Searching for:', query);
  // TODO: Implement search functionality with API
};

const handleAddTask = (status: string) => {
  console.log('Adding task to status:', status);
  // TODO: Implement add task functionality with API
};

const handleColumnMenu = (status: string) => {
  console.log('Opening column menu for:', status);
  // TODO: Implement column menu functionality
};

const openProjectDetails = (project: any) => {
  console.log('Opening project:', project.name);
  router.push(`/projects/${project.id}/workspace`);
};
</script>

<style scoped>
.project-view {
  background: #f8fafc;
  min-height: 100vh;
}

.main-content {
  padding: 24px;
  position: relative;
}

.kanban-board {
  margin-top: 32px;
}

.kanban-columns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  align-items: start;
}

  .customize-btn {
    position: fixed;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px 24px;
    text-align: center;
  }

  .loading-state .v-progress-circular {
    margin-bottom: 16px;
  }

@media (max-width: 1200px) {
  .kanban-columns {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .kanban-columns {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 16px;
  }
  
  .customize-btn {
    right: 16px;
  }
}
</style>
