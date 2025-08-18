<script setup lang="ts">
// Import new ERP components
import QuickActions from './components/QuickActions.vue';
import ProjectOverview from './components/ProjectOverview.vue';
import ProjectCard from './components/ProjectCard.vue';
import RecentActivity from './components/RecentActivity.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useUser } from '@clerk/vue';

// Import components
import StatsSkeleton from './components/StatsSkeleton.vue';
import ProjectCardSkeleton from './components/ProjectCardSkeleton.vue';
import ActivitySkeleton from './components/ActivitySkeleton.vue';

// Get Clerk user
const { user } = useUser();

// Reactive data with individual loading states
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

// Individual loading states for progressive loading
const statsLoading = ref(true);
const projectsLoading = ref(true);
const activitiesLoading = ref(true);
const weeklyProgressLoading = ref(true);
const deadlinesLoading = ref(true);

// API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Computed properties
const userDisplayName = computed(() => {
  if (user.value) {
    return user.value.firstName || user.value.emailAddresses[0]?.emailAddress || 'User';
  }
  return 'Guest';
});

const hasProjects = computed(() => projects.value.length > 0);

// Individual fetch functions with their own loading states
const fetchDashboardStats = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/stats?userId=${user.value.id}`);
    if (response.ok) {
      const data = await response.json();
      projectStats.value = {
        totalProjects: data.totalProjects || 0,
        activeProjects: data.activeProjects || 0,
        completedProjects: (data.totalProjects || 0) - (data.activeProjects || 0),
        totalTasks: data.totalTasks || 0,
        completedTasks: data.completedTasks || 0,
        pendingTasks: (data.totalTasks || 0) - (data.completedTasks || 0),
        teamMembers: data.totalTeamMembers || 0,
        totalDepartments: data.totalProjects || 0
      };
    }
  } catch (err) {
    console.warn('Dashboard stats API error:', err);
  } finally {
    statsLoading.value = false;
  }
};

const fetchUserProjects = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/user/projects?userId=${user.value.id}`);
    if (response.ok) {
      const data = await response.json();
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
    }
  } catch (err) {
    console.warn('User projects API error:', err);
  } finally {
    projectsLoading.value = false;
  }
};

const fetchRecentActivities = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/user/activities?userId=${user.value.id}&limit=10`);
    if (response.ok) {
      const data = await response.json();
      recentActivities.value = data.map((activity: any) => ({
        id: activity.id,
        type: activity.type === 'task_updated' ? 'task_completed' : activity.type,
        title: activity.type === 'task_updated' ? 'Task Updated' : 'Payment Released',
        description: activity.description,
        projectName: activity.projectName,
        timestamp: new Date(activity.timestamp),
        user: activity.userName
      }));
    }
  } catch (err) {
    console.warn('Recent activities API error:', err);
  } finally {
    activitiesLoading.value = false;
  }
};

const fetchWeeklyProgress = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/dashboard/weekly-progress?userId=${user.value.id}`);
    if (response.ok) {
      const data = await response.json();
      weeklyProgress.value = {
        tasksCompletedThisWeek: data.tasksCompletedThisWeek || 0,
        activeProjects: data.activeProjects || 0
      };
    }
  } catch (err) {
    console.warn('Weekly progress API error:', err);
  } finally {
    weeklyProgressLoading.value = false;
  }
};

const fetchDeadlines = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/user/deadlines?userId=${user.value.id}`);
    if (response.ok) {
      const data = await response.json();
      deadlines.value = data.map((deadline: any) => ({
        id: deadline.id,
        title: deadline.title,
        projectName: deadline.projectName,
        priority: deadline.priority,
        assignedTo: deadline.assignedTo,
        createdAt: new Date(deadline.createdAt)
      }));
    }
  } catch (err) {
    console.warn('Deadlines API error:', err);
  } finally {
    deadlinesLoading.value = false;
  }
};

// Load all data independently for progressive loading
const loadAllData = () => {
  if (!user.value?.id) return;
  
  // Start all API calls simultaneously
  fetchDashboardStats();
  fetchUserProjects();
  fetchRecentActivities();
  fetchWeeklyProgress();
  fetchDeadlines();
};

// Watch for user availability
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadAllData();
  }
}, { immediate: true });

// Load data when component mounts
onMounted(() => {
  if (user.value?.id) {
    loadAllData();
  }
});
</script>

<template>
  <div class="erp-dashboard">
    <!-- Welcome Header - Always visible -->
    <div class="welcome-header mb-6">
      <h1 class="text-h3 font-weight-bold mb-2">
        Welcome back, {{ userDisplayName }}! 👋
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        Here's what's happening with your projects today
      </p>
    </div>

    <!-- Quick Actions Section - Always visible (static content) -->
    <v-row class="mb-6">
      <v-col cols="12">
        <QuickActions />
      </v-col>
    </v-row>

    <!-- Project Overview Stats - Progressive loading -->
    <v-row class="mb-6">
      <v-col cols="12">
        <StatsSkeleton v-if="statsLoading" />
        <ProjectOverview v-else :stats="projectStats" />
      </v-col>
    </v-row>

    <!-- Projects Grid - Progressive loading -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h3 class="text-h4 font-weight-medium">My Projects</h3>
          <div class="d-flex gap-3">
            <v-btn 
              color="secondary" 
              variant="outlined" 
              prepend-icon="mdi-view-column" 
              @click="$router.push('/projects')"
            >
              View All Projects
            </v-btn>
            <v-btn 
              color="primary" 
              variant="flat" 
              prepend-icon="mdi-plus" 
              @click="$router.push('/projects/create')"
            >
              Create New Project
            </v-btn>
          </div>
        </div>

        <!-- Loading skeleton for projects -->
        <v-row v-if="projectsLoading">
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="6">
            <ProjectCardSkeleton />
    </v-col>
        </v-row>

        <!-- No Projects State -->
        <div v-else-if="!hasProjects" class="text-center pa-8">
          <v-avatar size="80" color="grey-lighten-3" class="mb-4">
            <span class="text-h4">📁</span>
          </v-avatar>
          <h5 class="text-h5 text-medium-emphasis mb-2">No Projects Yet</h5>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Start by creating your first project or joining an existing one
          </p>
          <v-btn color="primary" variant="flat" @click="$router.push('/projects/create')">
            Create Your First Project
          </v-btn>
        </div>

        <!-- Projects Grid -->
        <v-row v-else>
          <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" lg="6">
            <ProjectCard :project="project" />
    </v-col>
        </v-row>
    </v-col>
    </v-row>

    <!-- Recent Activity and Quick Stats - Progressive loading -->
    <v-row>
    <v-col cols="12" lg="8">
        <ActivitySkeleton v-if="activitiesLoading" />
        <RecentActivity v-else :activities="recentActivities" />
    </v-col>

    <v-col cols="12" lg="4">
        <!-- Weekly Progress Card - Progressive loading -->
        <v-card elevation="0" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="success" class="mb-3">
                <span class="text-h4 text-white">📈</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">This Week's Progress</h5>
              
              <!-- Loading skeleton for weekly progress -->
              <div v-if="weeklyProgressLoading" class="d-flex justify-space-around">
                <div class="text-center">
                  <div class="skeleton-text mb-1" style="width: 40px; height: 32px; border-radius: 4px; margin: 0 auto;"></div>
                  <p class="text-caption text-medium-emphasis">Tasks Done</p>
                </div>
                <div class="text-center">
                  <div class="skeleton-text mb-1" style="width: 40px; height: 32px; border-radius: 4px; margin: 0 auto;"></div>
                  <p class="text-caption text-medium-emphasis">Projects Active</p>
                </div>
              </div>
              
              <!-- Weekly progress data -->
              <div v-else class="d-flex justify-space-around">
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

        <!-- Deadlines Card - Progressive loading -->
        <v-card elevation="0">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="warning" class="mb-3">
                <span class="text-h4 text-white">⏰</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">Upcoming Deadlines</h5>
              <div class="text-left">
                <!-- Loading skeleton for deadlines -->
                <div v-if="deadlinesLoading" class="text-center pa-4">
                  <div v-for="i in 3" :key="i" class="d-flex align-center mb-3">
                    <div class="skeleton-chip mr-2" style="width: 60px; height: 20px; border-radius: 10px;"></div>
                    <div class="skeleton-text" style="width: 120px; height: 16px; border-radius: 4px;"></div>
                  </div>
                </div>
                
                <!-- No deadlines -->
                <div v-else-if="deadlines.length === 0" class="text-center pa-4">
                  <p class="text-body-2 text-medium-emphasis">No urgent deadlines</p>
                </div>
                
                <!-- Deadlines list -->
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
</template>

<style scoped>
.erp-dashboard {
  padding: 24px;
}

.welcome-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  margin-bottom: 32px;
}

.skeleton-text,
.skeleton-chip {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
