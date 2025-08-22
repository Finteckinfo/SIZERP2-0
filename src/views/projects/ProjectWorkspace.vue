<template>
  <ProjectAccessGate 
    :project-id="projectId"
    @access-granted="handleAccessGranted"
    @access-denied="handleAccessDenied"
  >
    <div class="project-workspace">
      <!-- Modern Header -->
      <div class="workspace-header">
        <div class="header-content">
          <div class="header-left">
            <v-btn 
              icon 
              variant="text" 
              @click="$router.push('/projects')" 
              class="back-btn"
            >
              <v-icon size="24">mdi-arrow-left</v-icon>
            </v-btn>
            <div class="project-info">
              <h1 class="project-title">{{ project?.name || 'Loading...' }}</h1>
              <div class="project-meta">
                <v-chip 
                  v-if="project"
                  :color="getStatusColor(getProjectStatus(project))" 
                  size="small" 
                  variant="tonal"
                >
                  {{ getStatusLabel(getProjectStatus(project)) }}
                </v-chip>
                <span class="project-type">{{ project?.type || 'Project' }}</span>
              </div>
            </div>
          </div>
          
          <div class="header-right">
            <div class="team-preview">
              <div class="avatar-stack">
                <v-avatar 
                  v-for="(member, index) in teamMembers.slice(0, 3)" 
                  :key="index"
                  size="32" 
                  :color="getAvatarColor(member.user?.firstName || member.user?.email || '')"
                  class="member-avatar"
                >
                  <v-icon color="white" size="16">mdi-account</v-icon>
                </v-avatar>
                <div v-if="teamMembers.length > 3" class="more-members">
                  +{{ teamMembers.length - 3 }}
                </div>
              </div>
              <v-btn variant="outlined" size="small" class="invite-btn">
                <v-icon size="16" class="mr-2">mdi-account-plus</v-icon>
                Invite
              </v-btn>
            </div>
            
            <div class="header-actions">
              <v-btn icon variant="text" size="small">
                <v-icon>mdi-magnify</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small">
                <v-icon>mdi-bell-outline</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="workspace-content">
        <v-container fluid class="pa-0">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
            <p class="mt-4 text-grey">Loading workspace...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-alert type="error" class="mb-4">
              {{ error }}
            </v-alert>
            <v-btn color="primary" @click="loadProjectData">Retry</v-btn>
          </div>

          <!-- Content -->
          <div v-else class="workspace-grid">
            <!-- Left Column - Project Info & Quick Actions -->
            <div class="left-column">
              <!-- Project Overview Card -->
              <v-card class="info-card" elevation="0">
                <div class="card-header">
                  <h3 class="card-title">Project Overview</h3>
                  <v-btn icon variant="text" size="small">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </div>
                
                <p class="project-description">
                  {{ project?.description || 'No description available' }}
                </p>
                
                <div class="project-stats">
                  <div class="stat-row">
                    <div class="stat-item">
                      <v-icon size="20" color="primary">mdi-calendar-start</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Start Date</span>
                        <span class="stat-value">{{ project?.startDate ? formatDate(project.startDate) : 'N/A' }}</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <v-icon size="20" color="warning">mdi-calendar-end</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">End Date</span>
                        <span class="stat-value">{{ project?.endDate ? formatDate(project.endDate) : 'N/A' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="stat-row">
                    <div class="stat-item">
                      <v-icon size="20" color="success">mdi-account-group</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Team Size</span>
                        <span class="stat-value">{{ projectStats.teamSize }} members</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <v-icon size="20" color="info">mdi-domain</v-icon>
                      <div class="stat-content">
                        <span class="stat-label">Departments</span>
                        <span class="stat-value">{{ projectStats.departmentsCount }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>

              <!-- Quick Actions Card -->
              <v-card class="actions-card" elevation="0">
                <h3 class="card-title">Quick Actions</h3>
                <div class="actions-grid">
                  <v-btn 
                    color="primary" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="addTask"
                  >
                    <v-icon size="20" class="mr-2">mdi-plus</v-icon>
                    Add Task
                  </v-btn>
                  <v-btn 
                    color="success" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="addMember"
                  >
                    <v-icon size="20" class="mr-2">mdi-account-plus</v-icon>
                    Add Member
                  </v-btn>
                  <v-btn 
                    color="warning" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="scheduleMeeting"
                  >
                    <v-icon size="20" class="mr-2">mdi-calendar</v-icon>
                    Schedule
                  </v-btn>
                  <v-btn 
                    color="info" 
                    variant="tonal" 
                    size="large"
                    class="action-btn"
                    @click="createReport"
                  >
                    <v-icon size="20" class="mr-2">mdi-file-document</v-icon>
                    Report
                  </v-btn>
                </div>
              </v-card>

              <!-- Progress Card -->
              <v-card class="progress-card" elevation="0">
                <h3 class="card-title">Project Progress</h3>
                <div class="progress-content">
                  <div class="progress-circle">
                    <v-progress-circular
                      :model-value="getProjectProgress()"
                      :color="getProgressColor(getProjectProgress())"
                      size="80"
                      width="8"
                    >
                      {{ getProjectProgress() }}%
                    </v-progress-circular>
                  </div>
                  <div class="progress-stats">
                    <div class="progress-stat">
                      <span class="stat-number">{{ tasks.length }}</span>
                      <span class="stat-label">Total Tasks</span>
                    </div>
                    <div class="progress-stat">
                      <span class="stat-number">{{ getCompletedTasksCount() }}</span>
                      <span class="stat-label">Completed</span>
                    </div>
                  </div>
                </div>
              </v-card>
            </div>

            <!-- Right Column - Tasks & Sections -->
            <div class="right-column">
              <!-- Tasks Header -->
              <div class="tasks-header">
                <h2 class="section-title">Tasks & Sections</h2>
                <div class="tasks-actions">
                  <v-btn color="primary" variant="outlined" size="small">
                    <v-icon size="16" class="mr-2">mdi-folder-plus</v-icon>
                    Add Section
                  </v-btn>
                  <v-btn color="primary" size="small">
                    <v-icon size="16" class="mr-2">mdi-plus</v-icon>
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
                  <div class="section-header" @click="toggleSection(section.id)">
                    <div class="section-info">
                      <v-icon 
                        :color="section.color" 
                        class="section-icon"
                      >
                        {{ section.collapsed ? 'mdi-chevron-right' : 'mdi-chevron-down' }}
                      </v-icon>
                      <h4 class="section-name">{{ section.name }}</h4>
                      <v-chip 
                        :color="section.color" 
                        size="small" 
                        variant="tonal"
                      >
                        {{ section.tasks.length }}
                      </v-chip>
                    </div>
                    <div class="section-actions">
                      <v-btn icon variant="text" size="small">
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </div>
                  </div>
                  
                  <div v-if="!section.collapsed" class="section-tasks">
                    <div 
                      v-for="task in section.tasks" 
                      :key="task.id"
                      class="task-item"
                    >
                      <div class="task-content">
                        <v-checkbox
                          v-model="task.completed"
                          :color="section.color"
                          hide-details
                          class="task-checkbox"
                        />
                        <div class="task-details">
                          <div class="task-title">{{ task.title }}</div>
                          <div class="task-meta">
                            <v-chip 
                              :color="getTaskStatusColor(task.completed ? 'COMPLETED' : 'PENDING')" 
                              size="x-small" 
                              variant="tonal"
                            >
                              {{ getTaskStatusLabel(task.completed ? 'COMPLETED' : 'PENDING') }}
                            </v-chip>
                            <v-chip 
                              :color="getPriorityColor(task.priority)" 
                              size="x-small" 
                              variant="outlined"
                            >
                              {{ getPriorityLabel(task.priority) }}
                            </v-chip>
                          </div>
                        </div>
                      </div>
                      <div class="task-actions">
                        <v-btn icon variant="text" size="small">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" size="small">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-container>
      </div>
    </div>
  </ProjectAccessGate>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { projectApi, taskApi, departmentApi, userRoleApi, type Project, type Task, type Department, type UserRole } from '@/services/projectApi';
import ProjectAccessGate from '@/components/ProjectAccessGate.vue';

const route = useRoute();
const router = useRouter();
const projectId = route.params.id as string;

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
          const teamResponse = await userRoleApi.getProjectUserRoles(projectId);
    teamMembers.value = teamResponse.userRoles || [];
  } catch (err) {
    error.value = 'Failed to load project data';
    console.error('Error loading project data:', err);
  } finally {
    loading.value = false;
  }
};

// Note: Project data loading is now handled by the access gate

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
const getProjectStatus = (project: Project) => {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  
  if (now < start) return 'PENDING';
  if (now >= start && now <= end) return 'ACTIVE';
  return 'COMPLETED';
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ACTIVE': 'success',
    'PENDING': 'warning',
    'COMPLETED': 'info'
  };
  return colors[status] || 'primary';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'ACTIVE': 'Active',
    'PENDING': 'Pending',
    'COMPLETED': 'Completed'
  };
  return labels[status] || status;
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

const getTaskStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'PENDING': 'warning',
    'IN_PROGRESS': 'info',
    'COMPLETED': 'success',
    'APPROVED': 'success'
  };
  return colors[status] || 'grey';
};

const getTaskStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'APPROVED': 'Approved'
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

const getProjectProgress = () => {
  if (tasks.value.length === 0) return 0;
  const completedTasks = tasks.value.filter(task => 
    task.status === 'COMPLETED' || task.status === 'APPROVED'
  );
  return Math.round((completedTasks.length / tasks.value.length) * 100);
};

const getProgressColor = (progress: number) => {
  if (progress >= 80) return 'success';
  if (progress >= 50) return 'warning';
  return 'error';
};

const getCompletedTasksCount = () => {
  return tasks.value.filter(task => 
    task.status === 'COMPLETED' || task.status === 'APPROVED'
  ).length;
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

const addTask = () => {
  console.log('Add task clicked');
  // TODO: Implement add task functionality
};

const addMember = () => {
  console.log('Add member clicked');
  // TODO: Implement add member functionality
};

const scheduleMeeting = () => {
  console.log('Schedule meeting clicked');
  // TODO: Implement schedule meeting functionality
};

const createReport = () => {
  console.log('Create report clicked');
  // TODO: Implement create report functionality
};

// Access gate handlers
const handleAccessGranted = (userRole: UserRole) => {
  console.log('Access granted with role:', userRole.role);
  // Load project data once access is confirmed
  if (projectId) {
    loadProjectData();
  }
};

const handleAccessDenied = () => {
  console.log('Access denied to project:', projectId);
  // Redirect to projects list or dashboard
  router.push('/projects');
};

onMounted(() => {
  // Don't load project data here - wait for access gate to confirm access
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

.workspace-header {
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom: 1px solid #e2e8f0;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
}

.back-btn {
  margin-right: 16px;
}

.project-info {
  display: flex;
  align-items: baseline;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-right: 12px;
}

.project-meta {
  display: flex;
  align-items: baseline;
}

.project-type {
  font-size: 0.875rem;
  color: #64748b;
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-stack {
  display: flex;
  align-items: center;
}

.member-avatar {
  margin-right: -8px;
}

.more-members {
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-btn {
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 600;
  text-transform: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workspace-content {
  padding-top: 120px; /* Adjust for fixed header */
  padding-bottom: 24px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 24px;
  padding: 0 24px;
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-card,
.actions-card,
.progress-card {
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.project-description {
  font-size: 0.875rem;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.action-btn {
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 600;
  text-transform: none;
}

.progress-card {
  margin-top: 24px;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.progress-circle {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-stats {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.progress-stat {
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  display: block;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: #64748b;
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.tasks-actions {
  display: flex;
  gap: 12px;
}

.task-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-section {
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-info {
  display: flex;
  align-items: center;
}

.section-icon {
  margin-right: 12px;
}

.section-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.section-tasks {
  padding: 16px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 12px;
  background: #ffffff;
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

.task-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-checkbox {
  flex-shrink: 0;
}

.task-details {
  display: flex;
  align-items: center;
  gap: 12px;
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
  gap: 12px;
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

@media (max-width: 960px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .workspace-header {
    padding: 12px 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-left {
    width: 100%;
    justify-content: space-between;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .team-preview {
    width: 100%;
    justify-content: space-between;
  }

  .avatar-stack {
    flex-wrap: wrap;
    gap: 8px;
  }

  .member-avatar {
    margin-right: 0;
  }

  .more-members {
    order: 1;
  }

  .invite-btn {
    order: 2;
  }

  .header-actions {
    order: 3;
    width: 100%;
    justify-content: space-between;
  }

  .workspace-content {
    padding-top: 100px; /* Adjust for fixed header */
  }

  .project-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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

