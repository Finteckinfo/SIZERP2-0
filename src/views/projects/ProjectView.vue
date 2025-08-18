<template>
  <div class="project-view">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <v-app-bar elevation="0" color="primary" class="px-6">
        <v-btn icon @click="$router.push('/dashboard/default')" class="mr-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold text-white">My Projects</h1>
          <p class="text-white text-opacity-80 mb-0">Manage and track your project progress</p>
        </div>
        <v-btn 
          color="white" 
          variant="flat"
          @click="$router.push('/projects/create')"
        >
          <v-icon class="mr-2">mdi-plus</v-icon>
          New Project
        </v-btn>
      </v-app-bar>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Project Stats -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" color="primary" class="pa-4 text-center">
              <v-icon size="32" color="white" class="mb-2">mdi-folder</v-icon>
              <h3 class="text-h4 font-weight-bold text-white">{{ projectStats.total }}</h3>
              <p class="text-white text-opacity-80 mb-0">Total Projects</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" color="success" class="pa-4 text-center">
              <v-icon size="32" color="white" class="mb-2">mdi-play-circle</v-icon>
              <h3 class="text-h4 font-weight-bold text-white">{{ projectStats.active }}</h3>
              <p class="text-white text-opacity-80 mb-0">Active</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" color="warning" class="pa-4 text-center">
              <v-icon size="32" color="white" class="mb-2">mdi-clock</v-icon>
              <h3 class="text-h4 font-weight-bold text-white">{{ projectStats.pending }}</h3>
              <p class="text-white text-opacity-80 mb-0">Pending</p>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card elevation="0" color="info" class="pa-4 text-center">
              <v-icon size="32" color="white" class="mb-2">mdi-check-circle</v-icon>
              <h3 class="text-h4 font-weight-bold text-white">{{ projectStats.completed }}</h3>
              <p class="text-white text-opacity-80 mb-0">Completed</p>
            </v-card>
          </v-col>
        </v-row>

        <!-- Kanban Board -->
        <div class="kanban-board">
          <div class="kanban-columns">
            <!-- To Do Column -->
            <div class="kanban-column">
              <div class="column-header todo">
                <h3 class="text-h6 font-weight-bold">To Do</h3>
                <span class="task-count">{{ getProjectsByStatus('TODO').length }}</span>
              </div>
              <div class="column-content">
                <div 
                  v-for="project in getProjectsByStatus('TODO')" 
                  :key="project.id"
                  class="project-card"
                  @click="openProjectDetails(project)"
                >
                  <div class="card-header">
                    <v-chip 
                      :color="getPriorityColor(project.priority)" 
                      size="small"
                      class="mb-2"
                    >
                      {{ project.priority }}
                    </v-chip>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn 
                          icon 
                          size="small" 
                          variant="text"
                          v-bind="props"
                          class="more-btn"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editProject(project)">
                          <v-list-item-title>Edit Project</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="archiveProject(project)">
                          <v-list-item-title>Archive</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <h4 class="project-title">{{ project.name }}</h4>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                      <span class="text-caption">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-account-group</v-icon>
                      <span class="text-caption">{{ project.teamSize }} members</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" color="grey" class="mr-2">mdi-domain</v-icon>
                      <span class="text-caption">{{ project.departments.length }} departments</span>
                    </div>
                  </div>
                  <div class="project-progress">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Progress</span>
                      <span class="text-caption">{{ project.progress }}%</span>
                    </div>
                    <v-progress-linear 
                      :model-value="project.progress" 
                      :color="getProgressColor(project.progress)"
                      height="6"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- In Progress Column -->
            <div class="kanban-column">
              <div class="column-header in-progress">
                <h3 class="text-h6 font-weight-bold">In Progress</h3>
                <span class="task-count">{{ getProjectsByStatus('IN_PROGRESS').length }}</span>
              </div>
              <div class="column-content">
                <div 
                  v-for="project in getProjectsByStatus('IN_PROGRESS')" 
                  :key="project.id"
                  class="project-card"
                  @click="openProjectDetails(project)"
                >
                  <div class="card-header">
                    <v-chip 
                      :color="getPriorityColor(project.priority)" 
                      size="small"
                      class="mb-2"
                    >
                      {{ project.priority }}
                    </v-chip>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn 
                          icon 
                          size="small" 
                          variant="text"
                          v-bind="props"
                          class="more-btn"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editProject(project)">
                          <v-list-item-title>Edit Project</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="archiveProject(project)">
                          <v-list-item-title>Archive</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <h4 class="project-title">{{ project.name }}</h4>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                      <span class="text-caption">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-account-group</v-icon>
                      <span class="text-caption">{{ project.teamSize }} members</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" color="grey" class="mr-2">mdi-domain</v-icon>
                      <span class="text-caption">{{ project.departments.length }} departments</span>
                    </div>
                  </div>
                  <div class="project-progress">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Progress</span>
                      <span class="text-caption">{{ project.progress }}%</span>
                    </div>
                    <v-progress-linear 
                      :model-value="project.progress" 
                      :color="getProgressColor(project.progress)"
                      height="6"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Review Column -->
            <div class="kanban-column">
              <div class="column-header review">
                <h3 class="text-h6 font-weight-bold">Review</h3>
                <span class="task-count">{{ getProjectsByStatus('REVIEW').length }}</span>
              </div>
              <div class="column-content">
                <div 
                  v-for="project in getProjectsByStatus('REVIEW')" 
                  :key="project.id"
                  class="project-card"
                  @click="openProjectDetails(project)"
                >
                  <div class="card-header">
                    <v-chip 
                      :color="getPriorityColor(project.priority)" 
                      size="small"
                      class="mb-2"
                    >
                      {{ project.priority }}
                    </v-chip>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn 
                          icon 
                          size="small" 
                          variant="text"
                          v-bind="props"
                          class="more-btn"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editProject(project)">
                          <v-list-item-title>Edit Project</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="archiveProject(project)">
                          <v-list-item-title>Archive</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <h4 class="project-title">{{ project.name }}</h4>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                      <span class="text-caption">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-account-group</v-icon>
                      <span class="text-caption">{{ project.teamSize }} members</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" color="grey" class="mr-2">mdi-domain</v-icon>
                      <span class="text-caption">{{ project.departments.length }} departments</span>
                    </div>
                  </div>
                  <div class="project-progress">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Progress</span>
                      <span class="text-caption">{{ project.progress }}%</span>
                    </div>
                    <v-progress-linear 
                      :model-value="project.progress" 
                      :color="getProgressColor(project.progress)"
                      height="6"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Completed Column -->
            <div class="kanban-column">
              <div class="column-header completed">
                <h3 class="text-h6 font-weight-bold">Completed</h3>
                <span class="task-count">{{ getProjectsByStatus('COMPLETED').length }}</span>
              </div>
              <div class="column-content">
                <div 
                  v-for="project in getProjectsByStatus('COMPLETED')" 
                  :key="project.id"
                  class="project-card"
                  @click="openProjectDetails(project)"
                >
                  <div class="card-header">
                    <v-chip 
                      :color="getPriorityColor(project.priority)" 
                      size="small"
                      class="mb-2"
                    >
                      {{ project.priority }}
                    </v-chip>
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn 
                          icon 
                          size="small" 
                          variant="text"
                          v-bind="props"
                          class="more-btn"
                        >
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="editProject(project)">
                          <v-list-item-title>Edit Project</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="archiveProject(project)">
                          <v-list-item-title>Archive</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                  <h4 class="project-title">{{ project.name }}</h4>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-meta">
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                      <span class="text-caption">{{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}</span>
                    </div>
                    <div class="d-flex align-center mb-2">
                      <v-icon size="16" color="grey" class="mr-2">mdi-account-group</v-icon>
                      <span class="text-caption">{{ project.teamSize }} members</span>
                    </div>
                    <div class="d-flex align-center">
                      <v-icon size="16" color="grey" class="mr-2">mdi-domain</v-icon>
                      <span class="text-caption">{{ project.departments.length }} departments</span>
                    </div>
                  </div>
                  <div class="project-progress">
                    <div class="d-flex justify-space-between mb-1">
                      <span class="text-caption">Progress</span>
                      <span class="text-caption">{{ project.progress }}%</span>
                    </div>
                    <v-progress-linear 
                      :model-value="project.progress" 
                      :color="getProgressColor(project.progress)"
                      height="6"
                      rounded
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Dummy project data
const projects = ref([
  {
    id: 1,
    name: 'E-commerce Platform Redesign',
    description: 'Modernize the existing e-commerce platform with improved UX and mobile responsiveness',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    progress: 65,
    teamSize: 8,
    departments: [
      { name: 'Frontend Development', type: 'MAJOR' },
      { name: 'Backend API', type: 'MAJOR' },
      { name: 'UI/UX Design', type: 'MAJOR' },
      { name: 'Testing', type: 'MINOR' }
    ]
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Create a cross-platform mobile application for iOS and Android',
    status: 'TODO',
    priority: 'MEDIUM',
    startDate: '2024-03-01',
    endDate: '2024-08-15',
    progress: 0,
    teamSize: 6,
    departments: [
      { name: 'Mobile Development', type: 'MAJOR' },
      { name: 'Backend Services', type: 'MAJOR' },
      { name: 'Design System', type: 'MINOR' }
    ]
  },
  {
    id: 3,
    name: 'Data Analytics Dashboard',
    description: 'Build comprehensive analytics dashboard for business intelligence',
    status: 'REVIEW',
    priority: 'LOW',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    progress: 90,
    teamSize: 4,
    departments: [
      { name: 'Data Engineering', type: 'MAJOR' },
      { name: 'Frontend Dashboard', type: 'MAJOR' }
    ]
  },
  {
    id: 4,
    name: 'API Gateway Implementation',
    description: 'Implement centralized API gateway for microservices architecture',
    status: 'COMPLETED',
    priority: 'HIGH',
    startDate: '2023-11-01',
    endDate: '2024-01-31',
    progress: 100,
    teamSize: 5,
    departments: [
      { name: 'Backend Infrastructure', type: 'MAJOR' },
      { name: 'DevOps', type: 'MINOR' }
    ]
  },
  {
    id: 5,
    name: 'Customer Support Portal',
    description: 'Develop self-service customer support portal with knowledge base',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    startDate: '2024-01-01',
    endDate: '2024-05-15',
    progress: 35,
    teamSize: 7,
    departments: [
      { name: 'Frontend Development', type: 'MAJOR' },
      { name: 'Backend Services', type: 'MAJOR' },
      { name: 'Content Management', type: 'MINOR' }
    ]
  },
  {
    id: 6,
    name: 'Security Audit & Updates',
    description: 'Comprehensive security audit and implementation of security updates',
    status: 'TODO',
    priority: 'CRITICAL',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    progress: 0,
    teamSize: 3,
    departments: [
      { name: 'Security Team', type: 'MAJOR' },
      { name: 'Infrastructure', type: 'MINOR' }
    ]
  }
]);

// Computed properties
const projectStats = computed(() => {
  const total = projects.value.length;
  const active = projects.value.filter(p => p.status === 'IN_PROGRESS').length;
  const pending = projects.value.filter(p => p.status === 'TODO').length;
  const completed = projects.value.filter(p => p.status === 'COMPLETED').length;
  
  return { total, active, pending, completed };
});

// Helper functions
const getProjectsByStatus = (status: string) => {
  return projects.value.filter(project => project.status === status);
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    case 'CRITICAL': return 'error';
    default: return 'grey';
  }
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Action functions
const openProjectDetails = (project: any) => {
  console.log('Opening project:', project.name);
  // TODO: Navigate to project details page
};

const editProject = (project: any) => {
  console.log('Editing project:', project.name);
  // TODO: Navigate to project edit page
};

const archiveProject = (project: any) => {
  console.log('Archiving project:', project.name);
  // TODO: Implement archive functionality
};

onMounted(() => {
  console.log('ProjectView mounted with', projects.value.length, 'projects');
});
</script>

<style scoped>
.project-view {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.main-content {
  padding: 32px;
}

.kanban-board {
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-columns {
  display: flex;
  gap: 24px;
  min-width: max-content;
}

.kanban-column {
  min-width: 320px;
  max-width: 320px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  color: white;
}

.column-header.todo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.column-header.in-progress {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.column-header.review {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.column-header.completed {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.task-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.column-content {
  min-height: 400px;
}

.project-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-left-color: rgb(var(--v-theme-primary));
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.more-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.project-card:hover .more-btn {
  opacity: 1;
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: rgb(var(--v-theme-on-surface));
}

.project-description {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  margin-bottom: 16px;
}

.project-meta .text-caption {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

.project-progress {
  margin-top: 16px;
}

.project-progress .text-caption {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 12px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .kanban-columns {
    gap: 16px;
  }
  
  .kanban-column {
    min-width: 280px;
    max-width: 280px;
  }
}

@media (max-width: 960px) {
  .main-content {
    padding: 16px;
  }
  
  .kanban-columns {
    flex-direction: column;
    gap: 24px;
  }
  
  .kanban-column {
    min-width: 100%;
    max-width: 100%;
  }
  
  .column-content {
    min-height: auto;
  }
}
</style>
