<template>
  <div class="project-workspace">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <v-app-bar elevation="0" color="white" class="px-6 border-b">
        <div class="d-flex align-center">
          <v-btn icon @click="$router.push('/projects')" class="mr-4">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-lock</v-icon>
            <h1 class="text-h5 font-weight-bold text-grey-darken-3">{{ project?.name || 'Loading...' }}</h1>
            <v-chip 
              v-if="project"
              :color="getStatusColor(project.type)" 
              size="small" 
              class="ml-3"
            >
              {{ project.type }}
            </v-chip>
          </div>
        </div>
        
        <div class="d-flex align-center mr-6">
          <div class="d-flex align-center mr-4">
            <div class="user-avatars">
              <v-avatar 
                v-for="(member, index) in teamMembers" 
                :key="index"
                size="32" 
                :color="getAvatarColor(member.user?.firstName || member.user?.email || '')"
                class="mr-n2"
              >
                <v-icon color="white" size="20">mdi-account</v-icon>
              </v-avatar>
            </div>
            <v-btn variant="outlined" size="small" class="ml-4">
              <v-icon class="mr-2">mdi-account-plus</v-icon>
              Invite
            </v-btn>
          </div>
        </div>
        
        <v-spacer />
        
        <div class="d-flex align-center">
          <v-btn icon class="mr-2">
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-btn>
          <v-btn icon class="mr-2">
            <v-icon>mdi-filter-variant</v-icon>
          </v-btn>
          <v-btn icon class="mr-4">
            <v-icon>mdi-download</v-icon>
          </v-btn>
          <v-text-field
            placeholder="Search tasks..."
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
            prepend-inner-icon="mdi-magnify"
          />
        </div>
      </v-app-bar>

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
          <!-- Project Overview -->
          <v-row class="mb-6">
          <v-col cols="12" md="8">
            <v-card elevation="0" class="pa-4 border rounded-lg">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium">Project Overview</h3>
                <v-btn color="primary" variant="outlined" size="small">
                  <v-icon class="mr-2">mdi-pencil</v-icon>
                  Edit
                </v-btn>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-4">{{ project?.description || 'No description available' }}</p>
              
              <div class="project-stats">
                <div class="stat-item">
                  <v-icon size="20" color="primary">mdi-calendar</v-icon>
                  <span class="stat-label">Start Date:</span>
                  <span class="stat-value">{{ project ? formatDate(project.startDate) : 'N/A' }}</span>
                </div>
                <div class="stat-item">
                  <v-icon size="20" color="warning">mdi-calendar</v-icon>
                  <span class="stat-label">End Date:</span>
                  <span class="stat-value">{{ project ? formatDate(project.endDate) : 'N/A' }}</span>
                </div>
                <div class="stat-item">
                  <v-icon size="20" color="success">mdi-account-group</v-icon>
                  <span class="stat-label">Team Size:</span>
                  <span class="stat-value">{{ projectStats.teamSize }} members</span>
                </div>
                <div class="stat-item">
                  <v-icon size="20" color="info">mdi-domain</v-icon>
                  <span class="stat-label">Departments:</span>
                  <span class="stat-value">{{ projectStats.departmentsCount }}</span>
                </div>
              </div>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <v-card elevation="0" class="pa-4 border rounded-lg">
              <h4 class="text-subtitle-1 font-weight-medium mb-3">Quick Actions</h4>
              <div class="d-flex flex-column gap-2">
                <v-btn color="primary" variant="outlined" size="small">
                  <v-icon class="mr-2">mdi-plus</v-icon>
                  Add Task
                </v-btn>
                <v-btn color="success" variant="outlined" size="small">
                  <v-icon class="mr-2">mdi-account-plus</v-icon>
                  Add Member
                </v-btn>
                <v-btn color="warning" variant="outlined" size="small">
                  <v-icon class="mr-2">mdi-calendar</v-icon>
                  Schedule Meeting
                </v-btn>
                <v-btn color="info" variant="outlined" size="small">
                  <v-icon class="mr-2">mdi-file-document</v-icon>
                  Create Report
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Task Management -->
        <div class="task-management">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium">Tasks & Sections</h3>
            <div class="d-flex gap-2">
              <v-btn color="primary" variant="outlined" size="small">
                <v-icon class="mr-2">mdi-folder-plus</v-icon>
                Add Section
              </v-btn>
              <v-btn color="primary" size="small">
                <v-icon class="mr-2">mdi-plus</v-icon>
                Add Task
              </v-btn>
            </div>
          </div>

          <!-- Task Sections -->
          <div class="task-sections">
            <div 
              v-for="section in projectSections" 
              :key="section.id"
              class="task-section"
            >
              <div class="section-header">
                <div class="d-flex align-center">
                  <v-icon 
                    :color="section.color" 
                    class="mr-2"
                    @click="toggleSection(section.id)"
                  >
                    {{ section.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
                  </v-icon>
                  <h4 class="text-subtitle-1 font-weight-medium">{{ section.name }}</h4>
                  <v-chip 
                    :color="section.color" 
                    size="small" 
                    class="ml-3"
                  >
                    {{ section.tasks.length }}
                  </v-chip>
                </div>
                <div class="section-actions">
                  <v-btn icon size="small" variant="text">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </div>
              </div>
              
              <div v-if="!section.collapsed" class="section-content">
                <div 
                  v-for="task in section.tasks" 
                  :key="task.id"
                  class="task-item"
                  :class="{ 'completed': task.completed }"
                >
                  <div class="task-checkbox">
                    <v-checkbox
                      v-model="task.completed"
                      :color="section.color"
                      hide-details
                      density="compact"
                    />
                  </div>
                  
                  <div class="task-content">
                    <div class="task-header">
                      <h5 class="task-title">{{ task.title }}</h5>
                      <div class="task-meta">
                        <v-chip 
                          :color="getPriorityColor(task.priority)" 
                          size="small"
                          variant="outlined"
                        >
                          {{ task.priority }}
                        </v-chip>
                        <span class="task-date">{{ formatDate(task.dueDate) }}</span>
                      </div>
                    </div>
                    
                    <p class="task-description">{{ task.description }}</p>
                    
                    <div class="task-footer">
                      <div class="task-assignees">
                        <v-avatar 
                          v-for="(assignee, index) in task.assignees" 
                          :key="index"
                          size="24" 
                          :color="getAvatarColor(assignee.color)"
                          class="mr-n1"
                        >
                          <v-icon color="white" size="16">mdi-account</v-icon>
                        </v-avatar>
                      </div>
                      
                      <div class="task-actions">
                        <v-btn icon size="small" variant="text">
                          <v-icon>mdi-comment</v-icon>
                        </v-btn>
                        <v-btn icon size="small" variant="text">
                          <v-icon>mdi-attachment</v-icon>
                        </v-btn>
                        <v-btn icon size="small" variant="text">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="add-task-placeholder" @click="addTaskToSection(section.id)">
                  <v-icon color="grey" class="mr-2">mdi-plus</v-icon>
                  <span class="text-grey">Add task to {{ section.name }}</span>
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
import { useRoute, useRouter } from 'vue-router';
import { projectApi, taskApi, departmentApi, userRoleApi, type Project, type Task, type Department, type UserRole } from '@/services/projectApi';

const route = useRoute();

const router = useRouter();
const projectId = route.params.projectId as string;

// Real project data from API
const project = ref<Project | null>(null);
const departments = ref<Department[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Load project data from API
const loadProjectData = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Load project details
    const projectResponse = await projectApi.getProject(projectId);
    project.value = projectResponse.project;
    
    // Load project departments
    const departmentsResponse = await departmentApi.getProjectDepartments(projectId);
    departments.value = departmentsResponse.departments || [];
    
    // Load project tasks
    const tasksResponse = await taskApi.getProjectTasks(projectId);
    tasks.value = tasksResponse.tasks || [];
    
    // Load team members
    const teamResponse = await userRoleApi.getProjectUsers(projectId);
    teamMembers.value = teamResponse.userRoles || [];
  } catch (err) {
    error.value = 'Failed to load project data';
    console.error('Error loading project data:', err);
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  if (projectId) {
    loadProjectData();
  }
});

// Computed properties for template
const projectStats = computed(() => ({
  teamSize: teamMembers.value.length,
  departmentsCount: departments.value.length,
  tasksCount: tasks.value.length,
  completedTasks: tasks.value.filter(t => t.status === 'COMPLETED').length
}));

const projectSections = computed(() => {
  return departments.value.map(dept => ({
    id: dept.id,
    name: dept.name,
    color: dept.type === 'MAJOR' ? 'primary' : 'success',
    collapsed: false,
    tasks: tasks.value.filter(task => task.departmentId === dept.id).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      priority: 'Medium', // Default priority
      dueDate: task.updatedAt,
      completed: task.status === 'COMPLETED',
      assignees: [{ color: 'blue' }] // Default assignee color
    }))
  }));
});

// Mock data removed - now using computed projectSections above

// Computed properties
const totalTasks = computed(() => {
  return projectSections.value.reduce((total, section) => total + section.tasks.length, 0);
});

const completedTasks = computed(() => {
  return projectSections.value.reduce((total, section) => {
    return total + section.tasks.filter(task => task.completed).length;
  }, 0);
});

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'TODO': return 'grey';
    case 'IN_PROGRESS': return 'warning';
    case 'REVIEW': return 'info';
    case 'DONE': return 'success';
    case 'REWORK': return 'error';
    default: return 'primary';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'primary';
  }
};

const getAvatarColor = (color: string) => {
  switch (color) {
    case 'red': return 'red';
    case 'purple': return 'purple';
    case 'blue': return 'blue';
    case 'green': return 'green';
    case 'orange': return 'orange';
    default: return 'grey';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Action functions
const toggleSection = (sectionId: string) => {
  const section = projectSections.value.find(s => s.id === sectionId);
  if (section) {
    section.collapsed = !section.collapsed;
  }
};

const addTaskToSection = (sectionId: string) => {
  console.log('Adding task to section:', sectionId);
  // TODO: Implement add task functionality
};

onMounted(() => {
  if (project.value) {
    console.log('ProjectWorkspace mounted for project:', project.value.name);
  }
});
</script>

<style scoped>
.project-workspace {
  background: #f8fafc;
  min-height: 100vh;
}

.main-content {
  padding: 24px;
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

.border {
  border: 1px solid #e2e8f0;
}

.border-b {
  border-bottom: 1px solid #e2e8f0;
}

.search-field {
  max-width: 300px;
}

.user-avatars {
  display: flex;
  align-items: center;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
}

.stat-value {
  color: #1e293b;
  font-weight: 500;
  font-size: 0.875rem;
}

.task-management {
  margin-top: 32px;
}

.task-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.section-header {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header h4 {
  margin: 0;
  color: #1e293b;
  font-size: 1rem;
}

.section-actions {
  display: flex;
  align-items: center;
}

.section-content {
  padding: 16px;
}

.task-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
  background: white;
  transition: all 0.3s ease;
}

.task-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.7;
  background: #f8fafc;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: #64748b;
}

.task-checkbox {
  flex-shrink: 0;
  margin-top: 4px;
}

.task-content {
  flex-grow: 1;
}

.task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.task-date {
  color: #64748b;
  font-size: 0.75rem;
}

.task-description {
  font-size: 0.75rem;
  color: #64748b;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.task-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.task-assignees {
  display: flex;
  align-items: center;
}

.task-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.add-task-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
  font-size: 0.875rem;
}

.add-task-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .project-stats {
    grid-template-columns: 1fr;
  }
  
  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .task-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
