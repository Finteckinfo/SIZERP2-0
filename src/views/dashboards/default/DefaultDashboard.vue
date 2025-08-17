<script setup lang="ts">
// Import new ERP components
import QuickActions from './components/QuickActions.vue';
import ProjectOverview from './components/ProjectOverview.vue';
import ProjectCard from './components/ProjectCard.vue';
import RecentActivity from './components/RecentActivity.vue';
import { ref, onMounted, computed } from 'vue';
import { useUser } from '@clerk/vue';

// Get Clerk user
const { user } = useUser();

// Reactive data
const projects = ref<any[]>([]);
const projectStats = ref({
  totalProjects: 0,
  activeProjects: 0,
  completedProjects: 0,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  teamMembers: 0,
  totalDepartments: 0
});
const recentActivities = ref<any[]>([]);
const weeklyProgress = ref({
  tasksCompletedThisWeek: 0,
  activeProjects: 0
});
const deadlines = ref<any[]>([]);
const loading = ref(true);
const error = ref('');

// API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Fetch dashboard stats
const fetchDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats?userId=${user.value?.id}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    const data = await response.json();
    
    // Transform API response to match our interface
    projectStats.value = {
      totalProjects: data.totalProjects,
      activeProjects: data.activeProjects,
      completedProjects: data.totalProjects - data.activeProjects,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      pendingTasks: data.totalTasks - data.completedTasks,
      teamMembers: data.totalTeamMembers,
      totalDepartments: data.totalProjects // Using projects as proxy for departments
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    error.value = 'Failed to load dashboard statistics';
  }
};

// Fetch user projects
const fetchUserProjects = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/user/projects?userId=${user.value?.id}`);
    if (!response.ok) throw new Error('Failed to fetch user projects');
    const data = await response.json();
    
    // Transform API response to match our Project interface
    projects.value = data.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      userRole: project.userRole,
      createdAt: new Date(project.createdAt),
      departmentCount: project.departmentCount,
      taskCount: project.totalTasks,
      completedTasks: project.completedTasks
    }));
  } catch (err) {
    console.error('Error fetching user projects:', err);
    error.value = 'Failed to load projects';
  }
};

// Fetch recent activities
const fetchRecentActivities = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/user/activities?userId=${user.value?.id}&limit=10`);
    if (!response.ok) throw new Error('Failed to fetch recent activities');
    const data = await response.json();
    
    // Transform API response to match our Activity interface
    recentActivities.value = data.map((activity: any) => ({
      id: activity.id,
      type: activity.type === 'task_updated' ? 'task_completed' : activity.type,
      title: activity.type === 'task_updated' ? 'Task Updated' : 'Payment Released',
      description: activity.description,
      projectName: activity.projectName,
      timestamp: new Date(activity.timestamp),
      user: activity.userName
    }));
  } catch (err) {
    console.error('Error fetching recent activities:', err);
    error.value = 'Failed to load recent activities';
  }
};

// Fetch weekly progress
const fetchWeeklyProgress = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/weekly-progress?userId=${user.value?.id}`);
    if (!response.ok) throw new Error('Failed to fetch weekly progress');
    const data = await response.json();
    
    weeklyProgress.value = {
      tasksCompletedThisWeek: data.tasksCompletedThisWeek,
      activeProjects: data.activeProjects
    };
  } catch (err) {
    console.error('Error fetching weekly progress:', err);
    error.value = 'Failed to load weekly progress';
  }
};

// Fetch deadlines
const fetchDeadlines = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/user/deadlines?userId=${user.value?.id}`);
    if (!response.ok) throw new Error('Failed to fetch deadlines');
    const data = await response.json();
    
    deadlines.value = data.map((deadline: any) => ({
      id: deadline.id,
      title: deadline.title,
      projectName: deadline.projectName,
      priority: deadline.priority,
      assignedTo: deadline.assignedTo,
      createdAt: new Date(deadline.createdAt)
    }));
  } catch (err) {
    console.error('Error fetching deadlines:', err);
    error.value = 'Failed to load deadlines';
  }
};

// Load all data
const loadDashboardData = async () => {
  if (!user.value?.id) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await Promise.all([
      fetchDashboardStats(),
      fetchUserProjects(),
      fetchRecentActivities(),
      fetchWeeklyProgress(),
      fetchDeadlines()
    ]);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    error.value = 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

// Watch for user changes and load data
onMounted(() => {
  if (user.value?.id) {
    loadDashboardData();
  }
});

// Computed properties for better UX
const hasData = computed(() => !loading.value && !error.value);
const hasProjects = computed(() => projects.value.length > 0);
const hasActivities = computed(() => recentActivities.value.length > 0);
</script>

<template>
  <div class="erp-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="mt-4 text-h6">Loading dashboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center pa-8">
      <v-icon color="error" size="48" class="mb-4">mdi-alert-circle</v-icon>
      <p class="text-h6 text-error mb-4">{{ error }}</p>
      <v-btn color="primary" @click="loadDashboardData" variant="flat">
        Retry
      </v-btn>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="hasData">
      <!-- Welcome Header -->
      <v-card elevation="0" class="bg-gradient-primary mb-6">
        <v-card-text class="pa-6 text-white">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h2 class="text-h3 font-weight-bold mb-2">Welcome back! 👋</h2>
              <p class="text-h6 text-white text-opacity-90">
                Here's what's happening with your projects today
              </p>
            </div>
            <v-avatar size="80" color="white" class="text-primary">
              <span class="text-h4">🚀</span>
            </v-avatar>
          </div>
        </v-card-text>
      </v-card>

      <!-- Quick Actions Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <QuickActions />
        </v-col>
      </v-row>

      <!-- Project Overview Stats -->
      <v-row class="mb-6">
        <v-col cols="12">
          <ProjectOverview :stats="projectStats" />
        </v-col>
      </v-row>

      <!-- Projects Grid -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h4 font-weight-medium">My Projects</h3>
            <v-btn 
              color="primary" 
              variant="flat"
              prepend-icon="mdi-plus"
            >
              Create New Project
            </v-btn>
          </div>
          
          <!-- No Projects State -->
          <div v-if="!hasProjects" class="text-center pa-8">
            <v-avatar size="80" color="grey-lighten-3" class="mb-4">
              <span class="text-h4">📁</span>
            </v-avatar>
            <h5 class="text-h5 text-medium-emphasis mb-2">No Projects Yet</h5>
            <p class="text-body-1 text-medium-emphasis mb-4">
              Start by creating your first project or joining an existing one
            </p>
            <v-btn color="primary" variant="flat">
              Create Your First Project
            </v-btn>
          </div>
          
          <!-- Projects Grid -->
          <v-row v-else>
            <v-col 
              v-for="project in projects" 
              :key="project.id" 
              cols="12" 
              sm="6" 
              lg="6"
            >
              <ProjectCard :project="project" />
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Recent Activity and Quick Stats -->
      <v-row>
        <v-col cols="12" lg="8">
          <RecentActivity :activities="recentActivities" />
        </v-col>
        
        <v-col cols="12" lg="4">
          <!-- Weekly Progress Card -->
          <v-card elevation="0" class="mb-4">
            <v-card-text class="pa-4">
              <div class="text-center">
                <v-avatar size="50" color="success" class="mb-3">
                  <span class="text-h4 text-white">📈</span>
                </v-avatar>
                <h5 class="text-h5 font-weight-medium mb-2">This Week's Progress</h5>
                <div class="d-flex justify-space-around">
                  <div class="text-center">
                    <h6 class="text-h4 font-weight-bold text-success">{{ weeklyProgress.tasksCompletedThisWeek }}</h6>
                    <p class="text-caption text-medium-emphasis">Tasks Done</p>
                  </div>
                  <div class="text-center">
                    <h6 class="text-h4 font-weight-bold text-primary">{{ weeklyProgress.activeProjects }}</h6>
                    <p class="text-caption text-medium-emphasis">Projects Active</p>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Deadlines Card -->
          <v-card elevation="0">
            <v-card-text class="pa-4">
              <div class="text-center">
                <v-avatar size="50" color="warning" class="mb-3">
                  <span class="text-h4 text-white">⏰</span>
                </v-avatar>
                <h5 class="text-h5 font-weight-medium mb-2">Upcoming Deadlines</h5>
                <div class="text-left">
                  <div v-if="deadlines.length === 0" class="text-center pa-4">
                    <p class="text-body-2 text-medium-emphasis">No urgent deadlines</p>
                  </div>
                  <div v-else>
                    <div 
                      v-for="deadline in deadlines.slice(0, 3)" 
                      :key="deadline.id"
                      class="d-flex align-center mb-3"
                    >
                      <v-chip 
                        size="small" 
                        :color="deadline.priority === 'urgent' ? 'error' : 'warning'" 
                        class="mr-2"
                      >
                        {{ deadline.priority === 'urgent' ? 'Urgent' : 'Due Soon' }}
                      </v-chip>
                      <span class="text-body-2">{{ deadline.projectName }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.erp-dashboard {
  padding: 0;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.v-card {
  border-radius: 12px;
}
</style>
