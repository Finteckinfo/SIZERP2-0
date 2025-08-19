<template>
  <div class="project-view">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <ProjectHeader
        project-name="My Projects"
        :team-members="headerTeamMembers"
        search-placeholder="Search Projects"
        back-route="/dashboard/default"
        @search="handleSearch"
      />

      <!-- Main Content -->
      <div class="main-content">
        <!-- Loading State -->
        <div v-if="loading || !user" class="loading-state">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="mt-4 text-grey">{{ !user ? 'Loading user...' : 'Loading projects...' }}</p>
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

          <!-- Project Filters -->
          <div class="project-filters mb-6">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="statusFilter"
                  :items="statusOptions"
                  label="Status"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="filterProjects"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="roleFilter"
                  :items="roleOptions"
                  label="My Role"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="filterProjects"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-select
                  v-model="priorityFilter"
                  :items="priorityOptions"
                  label="Priority"
                  variant="outlined"
                  density="compact"
                  clearable
                  @update:model-value="filterProjects"
                />
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-text-field
                  v-model="searchQuery"
                  label="Search Projects"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-magnify"
                  clearable
                  @input="filterProjects"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Projects Grid -->
          <div class="projects-grid">
            <v-row>
              <v-col 
                v-for="project in filteredProjects" 
                :key="project.id"
                cols="12" 
                sm="6" 
                lg="4"
              >
                <v-card 
                  class="project-card" 
                  elevation="2" 
                  @click="openProjectDetails(project)"
                >
                  <v-card-title class="d-flex align-center justify-space-between">
                    <span class="text-truncate project-name">{{ project.name }}</span>
                    <div class="d-flex align-center gap-2">
                      <v-chip 
                        :color="getProjectTypeColor(project.type)" 
                        size="small"
                        variant="tonal"
                      >
                        {{ getProjectTypeLabel(project.type) }}
                      </v-chip>
                      <v-chip 
                        :color="getStatusColor(getProjectStatus(project))" 
                        size="small"
                        variant="flat"
                      >
                        {{ getStatusLabel(getProjectStatus(project)) }}
                      </v-chip>
                    </div>
                  </v-card-title>

                  <v-card-text class="pt-2">
                    <p class="text-body-2 text-medium-emphasis mb-3 project-description">
                      {{ project.description || 'No description available' }}
                    </p>

                    <!-- Project Details -->
                    <div class="project-details mb-3">
                      <div class="detail-item">
                        <v-icon size="16" color="grey" class="mr-2">mdi-calendar</v-icon>
                        <span class="text-caption">
                          {{ formatDate(project.startDate) }} - {{ formatDate(project.endDate) }}
                        </span>
                      </div>
                      
                      <div class="detail-item">
                        <v-icon size="16" color="grey" class="mr-2">mdi-account-group</v-icon>
                        <span class="text-caption">{{ getProjectTeamSize(project.id) }} team members</span>
                      </div>

                      <div class="detail-item">
                        <v-icon size="16" color="grey" class="mr-2">mdi-flag</v-icon>
                        <span class="text-caption">{{ getPriorityLabel(project.priority) }}</span>
                      </div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="progress-section mb-3">
                      <div class="d-flex justify-space-between align-center mb-1">
                        <span class="text-caption text-medium-emphasis">Progress</span>
                        <span class="text-caption font-weight-medium">{{ getProjectProgress(project.id) }}%</span>
                      </div>
                      <v-progress-linear
                        :model-value="getProjectProgress(project.id)"
                        :color="getProgressColor(getProjectProgress(project.id))"
                        height="6"
                        rounded
                      />
                    </div>

                    <!-- User Role in Project -->
                    <div class="user-role-section">
                      <v-chip 
                        :color="getRoleColor(getUserRole(project.id))" 
                        size="small"
                        variant="outlined"
                        class="role-chip"
                      >
                        <v-icon size="16" class="mr-1">{{ getRoleIcon(getUserRole(project.id)) }}</v-icon>
                        {{ getUserRoleLabel(getUserRole(project.id)) }}
                      </v-chip>
                    </div>
                  </v-card-text>

                  <v-card-actions class="pt-0">
                    <v-btn 
                      color="primary" 
                      variant="text" 
                      size="small"
                      @click.stop="openProjectDetails(project)"
                    >
                      View Details
                    </v-btn>
                    <v-spacer />
                    <v-btn 
                      color="secondary" 
                      variant="text" 
                      size="small"
                      @click.stop="openProjectWorkspace(project)"
                    >
                      Open Workspace
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- Empty State -->
            <div v-if="filteredProjects.length === 0 && !loading" class="empty-state">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-folder-open</v-icon>
              <h3 class="text-h6 text-grey-darken-1 mb-2">
                {{ projects.length === 0 ? 'No projects found' : 'No projects match your filters' }}
              </h3>
              <p class="text-body-1 text-grey">
                {{ projects.length === 0 
                  ? 'You don\'t have any projects yet. Create your first project to get started.' 
                  : 'Try adjusting your filters or search criteria.' 
                }}
              </p>
              <v-btn 
                v-if="projects.length === 0"
                color="primary" 
                class="mt-4"
                @click="router.push('/projects/create')"
              >
                Create Project
              </v-btn>
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@clerk/vue';
import { ProjectHeader, ProjectStats } from './components';
import { projectApi, taskApi, userRoleApi, type Project, type Task, type UserRole } from '@/services/projectApi';

const router = useRouter();
const { user } = useUser();

// Real project data from API
const projects = ref<Project[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Filters
const statusFilter = ref<string | null>(null);
const roleFilter = ref<string | null>(null);
const priorityFilter = ref<string | null>(null);
const searchQuery = ref<string>('');

// Filter options
const statusOptions = [
  { title: 'Active', value: 'ACTIVE' },
  { title: 'Pending', value: 'PENDING' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'On Hold', value: 'ON_HOLD' }
];

const roleOptions = [
  { title: 'Client', value: 'CLIENT' },
  { title: 'Project Owner', value: 'PROJECT_OWNER' },
  { title: 'Project Manager', value: 'PROJECT_MANAGER' },
  { title: 'Employee', value: 'EMPLOYEE' }
];

const priorityOptions = [
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Critical', value: 'CRITICAL' }
];

// Load data from API
const loadProjectData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Load projects
    const projectsResponse = await projectApi.getProjects();
    projects.value = projectsResponse.projects || [];
    
    // If no projects from API, add sample data for demonstration
    if (projects.value.length === 0) {
      projects.value = [
        {
          id: 'sample-1',
          name: 'Website Redesign',
          description: 'Modernize the company website with improved UX and mobile responsiveness',
          type: 'PROGRESSIVE',
          priority: 'HIGH',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          ownerId: 'sample-owner',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: 'sample-2',
          name: 'Mobile App Development',
          description: 'Create a cross-platform mobile application for customer engagement',
          type: 'PARALLEL',
          priority: 'CRITICAL',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          ownerId: 'sample-owner',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: 'sample-3',
          name: 'Database Migration',
          description: 'Migrate legacy database systems to modern cloud infrastructure',
          type: 'PROGRESSIVE',
          priority: 'MEDIUM',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          ownerId: 'sample-owner',
          createdAt: '2024-02-01',
          updatedAt: '2024-02-01'
        }
      ];
    }
    
    // Load tasks for all projects
    const allTasks: Task[] = [];
    for (const project of projects.value) {
      try {
        const tasksResponse = await taskApi.getProjectTasks(project.id);
        allTasks.push(...(tasksResponse.tasks || []));
      } catch (err) {
        // If API fails, add sample tasks for demonstration
        if (project.id.startsWith('sample-')) {
          allTasks.push(
            {
              id: `task-${project.id}-1`,
              title: 'Project Planning',
              description: 'Initial project setup and planning phase',
              status: 'COMPLETED',
              departmentId: project.id,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-2`,
              title: 'Development Phase',
              description: 'Core development and implementation',
              status: 'IN_PROGRESS',
              departmentId: project.id,
              createdAt: '2024-01-15',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-3`,
              title: 'Testing & QA',
              description: 'Quality assurance and testing procedures',
              status: 'PENDING',
              departmentId: project.id,
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            }
          );
        }
      }
    }
    tasks.value = allTasks;
    
    // Load team members for all projects
    const allTeamMembers: UserRole[] = [];
    for (const project of projects.value) {
      try {
        const teamResponse = await userRoleApi.getProjectUsers(project.id);
        allTeamMembers.push(...(teamResponse.userRoles || []));
      } catch (err) {
        // If API fails, add sample team members for demonstration
        if (project.id.startsWith('sample-')) {
          allTeamMembers.push(
            {
              id: `role-${project.id}-1`,
              userId: user.value?.id || 'sample-user',
              projectId: project.id,
              role: 'PROJECT_MANAGER',
              departmentOrder: [],
              departmentScope: [],
              createdAt: '2024-01-01',
              user: {
                id: user.value?.id || 'sample-user',
                email: user.value?.emailAddresses?.[0]?.emailAddress || 'user@example.com',
                firstName: user.value?.firstName || 'Sample',
                lastName: user.value?.lastName || 'User',
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
              }
            }
          );
        }
      }
    }
    teamMembers.value = allTeamMembers;
  } catch (err) {
    error.value = 'Failed to load project data';
    console.error('Error loading project data:', err);
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  if (user.value?.id) {
    loadProjectData();
  }
});

// Watch for user availability
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadProjectData();
  }
}, { immediate: true });

// Team members for header (mapped from UserRole)
const headerTeamMembers = computed(() => {
  return teamMembers.value.slice(0, 5).map(member => ({
    color: getAvatarColor(member.user?.firstName || member.user?.email || ''),
    name: member.user?.firstName || member.user?.email || ''
  }));
});

// Computed properties
const projectStats = computed(() => {
  const total = projects.value.length;
  // Derive status from dates and tasks
  const active = projects.value.filter(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    return now >= start && now <= end;
  }).length;
  const pending = projects.value.filter(p => {
    const now = new Date();
    const start = new Date(p.startDate);
    return now < start;
  }).length;
  const completed = projects.value.filter(p => {
    const now = new Date();
    const end = new Date(p.endDate);
    return now > end;
  }).length;
  
  return [
    { key: 'total', label: 'Total Projects', value: total, icon: 'mdi-folder', color: 'primary' },
    { key: 'active', label: 'Active', value: active, icon: 'mdi-play-circle', color: 'success' },
    { key: 'pending', label: 'Pending', value: pending, icon: 'mdi-clock', color: 'warning' },
    { key: 'completed', label: 'Completed', value: completed, icon: 'mdi-check-circle', color: 'info' }
  ];
});

// Filtered projects
const filteredProjects = computed(() => {
  let filtered = projects.value;

  if (statusFilter.value) {
    filtered = filtered.filter(p => {
      const now = new Date();
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      
      switch (statusFilter.value) {
        case 'ACTIVE':
          return now >= start && now <= end;
        case 'PENDING':
          return now < start;
        case 'COMPLETED':
          return now > end;
        case 'ON_HOLD':
          return false; // No on-hold status in current schema
        default:
          return true;
      }
    });
  }

  if (roleFilter.value) {
    filtered = filtered.filter(p => {
      const userRole = getUserRole(p.id);
      return userRole === roleFilter.value;
    });
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(p => p.priority === priorityFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query))
    );
  }

  return filtered;
});

// Helper functions
const getUserRole = (projectId: string) => {
  if (!user.value?.id) return 'CLIENT';
  
  const userRole = teamMembers.value.find(member => 
    member.projectId === projectId && member.userId === user.value.id
  );
  return userRole?.role || 'CLIENT';
};

const getAvatarColor = (name: string) => {
  const colors = ['red', 'purple', 'blue', 'green', 'orange', 'black'];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const getProjectStatus = (project: Project) => {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  
  if (now < start) return 'PENDING';
  if (now >= start && now <= end) return 'ACTIVE';
  return 'COMPLETED';
};

const getProjectTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'PROGRESSIVE': 'success',
    'PARALLEL': 'warning'
  };
  return colors[type] || 'grey';
};

const getProjectTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'PROGRESSIVE': 'Progressive',
    'PARALLEL': 'Parallel'
  };
  return labels[type] || type;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'success',
    'PENDING': 'warning',
    'COMPLETED': 'info',
    'ON_HOLD': 'grey'
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed',
    'ON_HOLD': 'On Hold'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'CRITICAL': 'Critical'
  };
  return labels[priority] || priority;
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    'CLIENT': 'primary',
    'PROJECT_OWNER': 'primary',
    'PROJECT_MANAGER': 'success',
    'EMPLOYEE': 'info'
  };
  return colors[role] || 'grey';
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    'CLIENT': 'mdi-account',
    'PROJECT_OWNER': 'mdi-account-star',
    'PROJECT_MANAGER': 'mdi-account-cog',
    'EMPLOYEE': 'mdi-account-hard-hat'
  };
  return icons[role] || 'mdi-account';
};

const getUserRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'CLIENT': 'Client',
    'PROJECT_OWNER': 'Project Owner',
    'PROJECT_MANAGER': 'Project Manager',
    'EMPLOYEE': 'Employee'
  };
  return labels[role] || role;
};

const getProjectProgress = (projectId: string) => {
  const projectTasks = tasks.value.filter(task => task.departmentId === projectId);
  if (projectTasks.length === 0) return 0;
  
  const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED' || task.status === 'APPROVED');
  return Math.round((completedTasks.length / projectTasks.length) * 100);
};

const getProjectTeamSize = (projectId: string) => {
  return teamMembers.value.filter(member => member.projectId === projectId).length;
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

const formatDate = (date: string | Date | null) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

const filterProjects = () => {
  // This will trigger the computed property automatically
  console.log('Filtering projects...');
};

// Event handlers
const handleSearch = (query: string) => {
  searchQuery.value = query;
  filterProjects();
};

const openProjectDetails = (project: Project) => {
  console.log('Opening project details:', project.name);
  router.push(`/projects/${project.id}`);
};

const openProjectWorkspace = (project: Project) => {
  console.log('Opening project workspace:', project.name);
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

.project-filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.projects-grid {
  margin-top: 24px;
}

.project-card {
  height: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: white;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #cbd5e1;
}

.project-card .v-card-title {
  padding: 16px 16px 8px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.project-card .v-card-text {
  padding: 16px;
}

.project-card .v-card-actions {
  padding: 8px 16px 16px 16px;
  border-top: 1px solid #f1f5f9;
}

.project-name {
  font-weight: 600;
  color: #1e293b;
}

.gap-2 {
  gap: 8px;
}

.project-description {
  line-height: 1.5;
  color: #64748b;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: #64748b;
}

.progress-section {
  margin-top: 16px;
}

.user-role-section {
  margin-top: 16px;
}

.role-chip {
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  grid-column: 1 / -1;
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

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .customize-btn {
    right: 16px;
  }
  
  .project-filters {
    padding: 16px;
  }
  
  .project-card .v-card-title {
    padding: 12px 12px 8px 12px;
  }
  
  .project-card .v-card-text {
    padding: 12px;
  }
  
  .project-card .v-card-actions {
    padding: 8px 12px 12px 12px;
  }
  
  .gap-2 {
    gap: 4px;
  }
}
</style>
