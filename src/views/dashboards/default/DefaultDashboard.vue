<script setup lang="ts">
// Import new ERP components
import QuickActions from './components/QuickActions.vue';
import ProjectOverview from './components/ProjectOverview.vue';
import ProjectCard from './components/ProjectCard.vue';
import RecentActivity from './components/RecentActivity.vue';
import { ref, onMounted, computed, watch } from 'vue';
import { useUser } from '@clerk/vue';
import { useRouter } from 'vue-router';

// Import components
import StatsSkeleton from './components/StatsSkeleton.vue';
import ProjectCardSkeleton from './components/ProjectCardSkeleton.vue';
import ActivitySkeleton from './components/ActivitySkeleton.vue';
import OnboardingModal from '@/components/OnboardingModal.vue';

// Import centralized API services
import { projectApi, taskApi, userRoleApi, projectInviteApi, type Project, type Task, type UserRole } from '@/services/projectApi';

// Get Clerk user and router
const { user } = useUser();
const router = useRouter();

// Reactive data with individual loading states
const projects = ref<Project[]>([]);
const tasks = ref<Task[]>([]);
const teamMembers = ref<UserRole[]>([]);
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

// Error states
const projectsError = ref<string | null>(null);
const tasksError = ref<string | null>(null);
const teamError = ref<string | null>(null);

// Onboarding state
const showOnboardingModal = ref(false);
const hasCheckedInvites = ref(false);

// Invites state
const pendingInvites = ref<any[]>([]);
const invitesLoading = ref(false);

// Computed properties
const userDisplayName = computed(() => {
  if (user.value) {
    return user.value.firstName || user.value.emailAddresses[0]?.emailAddress || 'User';
  }
  return 'Guest';
});

// No more frontend filtering needed - backend handles it
const hasProjects = computed(() => projects.value.length > 0);

// Helper functions for project status and progress calculation
const getProjectStatus = (project: Project) => {
  const now = new Date();
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  
  if (now < start) return 'PENDING';
  if (now >= start && now <= end) return 'ACTIVE';
  return 'COMPLETED';
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

const getUserRoleInProject = (projectId: string) => {
  if (!user.value?.id) return 'CLIENT';
  
  const userRole = teamMembers.value.find(member => 
    member.projectId === projectId && member.userId === user.value.id
  );
  return userRole?.role || 'CLIENT';
};

// Helper functions for invites
const getRoleColor = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'primary';
    case 'PROJECT_MANAGER': return 'success';
    case 'EMPLOYEE': return 'info';
    default: return 'grey';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'PROJECT_OWNER': return 'Owner';
    case 'PROJECT_MANAGER': return 'Manager';
    case 'EMPLOYEE': return 'Employee';
    default: return role;
  }
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

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'Low';
    case 'MEDIUM': return 'Medium';
    case 'HIGH': return 'High';
    case 'CRITICAL': return 'Critical';
    default: return priority;
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Navigation functions
const navigateToProject = (projectId: string) => {
  router.push(`/projects/${projectId}`);
};

const navigateToProjectWorkspace = (projectId: string) => {
  router.push(`/projects/${projectId}/workspace`);
};

const navigateToProjectsList = () => {
  router.push('/projects');
};

const navigateToCreateProject = () => {
  router.push('/projects/create');
};

// Individual fetch functions using centralized API services
const fetchDashboardStats = async () => {
  if (!user.value?.id) return;
  
  try {
    // Calculate stats from loaded data
    const total = projects.value.length;
    const active = projects.value.filter(p => getProjectStatus(p) === 'ACTIVE').length;
    const completed = projects.value.filter(p => getProjectStatus(p) === 'COMPLETED').length;
    const pending = projects.value.filter(p => getProjectStatus(p) === 'PENDING').length;
    
    const totalTasks = tasks.value.length;
    const completedTasks = tasks.value.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED').length;
    const pendingTasks = totalTasks - completedTasks;
    
    const projectIds = new Set(projects.value.map(p => p.id));
    const teamMembersCount = teamMembers.value.filter(m => projectIds.has(m.projectId)).length;
    const totalDepartments = projects.value.length; // Simplified for now
    
    projectStats.value = {
      totalProjects: total,
      activeProjects: active,
      completedProjects: completed,
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      pendingTasks: pendingTasks,
      teamMembers: teamMembersCount,
      totalDepartments: totalDepartments
    };
  } catch (err) {
    console.warn('Dashboard stats calculation error:', err);
  } finally {
    statsLoading.value = false;
  }
};

const fetchUserProjects = async () => {
  if (!user.value?.id) return;
  
  try {
    // Load user's projects using new filtered backend endpoint
    const projectsResponse = await projectApi.getUserProjectsSimple();
    projects.value = projectsResponse.projects || projectsResponse || [];
    
    // If no projects from API, add sample data for demonstration
    if (projects.value.length === 0) {
      projects.value = [
        {
          id: 'sample-1',
          name: 'Website Redesign',
          description: 'Modernize the company website with improved UX and mobile responsiveness. This project will enhance user engagement and conversion rates.',
          type: 'PROGRESSIVE',
          priority: 'HIGH',
          startDate: '2024-01-15',
          endDate: '2024-06-30',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01'
        },
        {
          id: 'sample-2',
          name: 'Mobile App Development',
          description: 'Create a cross-platform mobile application for customer engagement and service delivery. Will support both iOS and Android platforms.',
          type: 'PARALLEL',
          priority: 'CRITICAL',
          startDate: '2024-02-01',
          endDate: '2024-08-31',
          ownerId: user.value?.id || 'sample-owner',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15'
        },
        {
          id: 'sample-3',
          name: 'Database Migration',
          description: 'Migrate legacy database systems to modern cloud infrastructure. This will improve performance, scalability, and maintainability.',
          type: 'PROGRESSIVE',
          priority: 'MEDIUM',
          startDate: '2024-03-01',
          endDate: '2024-05-31',
          ownerId: user.value?.id || 'sample-owner',
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
              priority: 'MEDIUM',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-2`,
              title: 'Development Phase',
              description: 'Core development and implementation',
              status: 'IN_PROGRESS',
              departmentId: project.id,
              priority: 'HIGH',
              createdAt: '2024-01-15',
              updatedAt: '2024-01-15'
            },
            {
              id: `task-${project.id}-3`,
              title: 'Testing & QA',
              description: 'Quality assurance and testing procedures',
              status: 'PENDING',
              departmentId: project.id,
              priority: 'MEDIUM',
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
        const teamResponse = await userRoleApi.getProjectUserRoles(project.id);
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
              managedDepartments: [],
              accessibleDepartments: [],
              assignedTasks: [],
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
    console.warn('User projects API error:', err);
    projectsError.value = 'Failed to load projects. Please try again.';
  } finally {
    projectsLoading.value = false;
  }
};

const fetchRecentActivities = async () => {
  if (!user.value?.id) return;
  
  try {
    // Generate recent activities from project and task data
    const activities: any[] = [];
    
    // Add project creation activities
    projects.value.slice(0, 3).forEach(project => {
      activities.push({
        id: `activity-${project.id}`,
        type: 'project_created',
        title: 'Project Created',
        description: `New project "${project.name}" has been created`,
        projectName: project.name,
        timestamp: new Date(project.createdAt),
        user: userDisplayName.value
      });
    });
    
    // Add task completion activities
    const completedTasks = tasks.value.filter(t => t.status === 'COMPLETED' || t.status === 'APPROVED');
    completedTasks.slice(0, 2).forEach(task => {
      const project = projects.value.find(p => p.id === task.departmentId);
      if (project) {
        activities.push({
          id: `activity-${task.id}`,
          type: 'task_completed',
          title: 'Task Completed',
          description: `Task "${task.title}" has been completed`,
          projectName: project.name,
          timestamp: new Date(task.updatedAt),
          user: userDisplayName.value
        });
      }
    });
    
    // Sort by timestamp and take latest 5
    recentActivities.value = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
      
  } catch (err) {
    console.warn('Recent activities generation error:', err);
  } finally {
    activitiesLoading.value = false;
  }
};

const fetchWeeklyProgress = async () => {
  if (!user.value?.id) return;
  
  try {
    // Calculate weekly progress from task data
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const tasksCompletedThisWeek = tasks.value.filter(task => {
      const updatedAt = new Date(task.updatedAt);
      return (task.status === 'COMPLETED' || task.status === 'APPROVED') && 
             updatedAt >= weekAgo && updatedAt <= now;
    }).length;
    
    const activeProjects = projects.value.filter(p => getProjectStatus(p) === 'ACTIVE').length;
    
    weeklyProgress.value = {
      tasksCompletedThisWeek,
      activeProjects
    };
  } catch (err) {
    console.warn('Weekly progress calculation error:', err);
  } finally {
    weeklyProgressLoading.value = false;
  }
};

const fetchDeadlines = async () => {
  if (!user.value?.id) return;
  
  try {
    // Generate deadlines from project end dates
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingDeadlines = projects.value
      .filter(project => {
        const endDate = new Date(project.endDate);
        return endDate > now && endDate <= thirtyDaysFromNow;
      })
      .map(project => ({
        id: `deadline-${project.id}`,
        title: `Complete ${project.name}`,
        projectName: project.name,
        priority: new Date(project.endDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) ? 'urgent' : 'due_soon',
        assignedTo: userDisplayName.value,
        createdAt: new Date(project.createdAt)
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    deadlines.value = upcomingDeadlines.slice(0, 5);
  } catch (err) {
    console.warn('Deadlines generation error:', err);
  } finally {
    deadlinesLoading.value = false;
  }
};

// Load all data independently for progressive loading
const loadAllData = () => {
  if (!user.value?.id) return;
  
  // Reset errors
  projectsError.value = null;
  tasksError.value = null;
  teamError.value = null;
  
  // Start all API calls simultaneously
  fetchUserProjects(); // Load projects first, then calculate other stats
  fetchRecentActivities();
  fetchWeeklyProgress();
  fetchDeadlines();
  
  // Check for pending invites
  checkUserInvites();
};

const checkUserInvites = async () => {
  if (!user.value?.id || hasCheckedInvites.value) return;
  
  try {
    const invites = await projectInviteApi.getUserInvites(user.value.id);
    const pendingInvites = invites.filter((invite: any) => invite.status === 'PENDING');
    
    if (pendingInvites.length > 0) {
      showOnboardingModal.value = true;
    }
    
    hasCheckedInvites.value = true;
  } catch (error) {
    console.error('Failed to check user invites:', error);
    // Don't block the dashboard if invite check fails
  }
};

const handleInviteResponse = (inviteId: string, status: 'ACCEPTED' | 'DECLINED') => {
  console.log(`Invite ${inviteId} ${status.toLowerCase()}`);
  
  if (status === 'ACCEPTED') {
    // Refresh data to show the newly accepted project
    refreshData();
  }
  
  // You could show a toast notification here
};

// Refresh function for manual data reload
const refreshData = () => {
  if (!user.value?.id) return;
  
  // Reset loading states
  statsLoading.value = true;
  projectsLoading.value = true;
  activitiesLoading.value = true;
  weeklyProgressLoading.value = true;
  deadlinesLoading.value = true;
  
  loadAllData();
};

// Invite management functions
const loadPendingInvites = async () => {
  if (!user.value?.id) return;
  
  invitesLoading.value = true;
  try {
    const invites = await projectInviteApi.getUserInvites(user.value.id);
    pendingInvites.value = invites.filter((invite: any) => invite.status === 'PENDING');
  } catch (error) {
    console.error('Failed to load invites:', error);
  } finally {
    invitesLoading.value = false;
  }
};

const refreshInvites = () => {
  loadPendingInvites();
};

const acceptInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    await projectInviteApi.respondToInvite(inviteId, 'ACCEPTED');
    // Remove from pending list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
    // Refresh project data
    refreshData();
  } catch (error) {
    console.error('Failed to accept invite:', error);
  } finally {
    invite.loading = false;
  }
};

const declineInvite = async (inviteId: string) => {
  const invite = pendingInvites.value.find(i => i.id === inviteId);
  if (!invite) return;
  
  invite.loading = true;
  try {
    await projectInviteApi.respondToInvite(inviteId, 'DECLINED');
    // Remove from pending list
    pendingInvites.value = pendingInvites.value.filter(i => i.id !== inviteId);
  } catch (error) {
    console.error('Failed to decline invite:', error);
  } finally {
    invite.loading = false;
  }
};

// Watch for user availability
watch(() => user.value?.id, (newUserId) => {
  if (newUserId) {
    loadAllData();
  }
}, { immediate: true });

// Watch for projects data to calculate stats
watch(projects, () => {
  if (projects.value.length > 0) {
    fetchDashboardStats();
  }
}, { immediate: true });

// Load data when component mounts
onMounted(() => {
  if (user.value?.id) {
    loadAllData();
    loadPendingInvites();
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
              prepend-icon="mdi-refresh" 
              :loading="projectsLoading"
              @click="refreshData"
            >
              Refresh
            </v-btn>
            <v-btn 
              color="secondary" 
              variant="outlined" 
              prepend-icon="mdi-view-column" 
              @click="navigateToProjectsList"
            >
              View All Projects
            </v-btn>
            <v-btn 
              color="primary" 
              variant="flat" 
              prepend-icon="mdi-plus" 
              @click="navigateToCreateProject"
            >
              Create New Project
            </v-btn>
          </div>
        </div>

        <!-- Error State for Projects -->
        <div v-if="projectsError" class="mb-4">
          <v-alert type="error" class="mb-4">
            {{ projectsError }}
            <template v-slot:append>
              <v-btn color="error" variant="text" @click="refreshData">
                Retry
              </v-btn>
            </template>
          </v-alert>
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
          <v-btn color="primary" variant="flat" @click="navigateToCreateProject">
            Create Your First Project
          </v-btn>
        </div>

        <!-- Sample Data Notice -->
        <div v-if="projects.some(p => p.id && p.id.startsWith('sample-'))" class="mb-4">
          <v-alert type="info" variant="tonal" class="mb-4">
            <template v-slot:prepend>
              <v-icon>mdi-information</v-icon>
            </template>
            <strong>Demo Mode:</strong> You're currently viewing sample project data. 
            <v-btn color="info" variant="text" @click="navigateToCreateProject" class="ml-2">
              Create your own project
            </v-btn>
            to get started with real data.
          </v-alert>
        </div>

        <!-- Projects Grid -->
        <v-row v-else>
          <v-col v-for="project in projects" :key="project.id" cols="12" sm="6" lg="6">
            <ProjectCard 
              :project="project" 
              :tasks="tasks" 
              :team-members="teamMembers" 
              :user-role="getUserRoleInProject(project.id)"
            />
          </v-col>
        </v-row>
    </v-col>
    </v-row>

    <!-- Project Invites Section -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card elevation="0" class="invites-section">
          <v-card-title class="d-flex align-center pa-4 pb-2">
            <v-icon class="mr-3" color="primary" size="24">mdi-email-outline</v-icon>
            <span class="text-h5 font-weight-medium">Project Invitations</span>
            <v-chip 
              v-if="pendingInvites.length > 0" 
              color="warning" 
              size="small" 
              class="ml-3"
            >
              {{ pendingInvites.length }} Pending
            </v-chip>
            <v-spacer></v-spacer>
            <v-btn 
              v-if="pendingInvites.length > 0"
              color="primary" 
              variant="tonal" 
              size="small"
              @click="refreshInvites"
              :loading="invitesLoading"
            >
              <v-icon>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-4 pt-0">
            <!-- Loading State -->
            <div v-if="invitesLoading" class="text-center pa-6">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
              <p class="text-body-2 text-medium-emphasis mt-3">Loading invitations...</p>
            </div>

            <!-- No Invites State -->
            <div v-else-if="pendingInvites.length === 0" class="text-center pa-6">
              <v-avatar size="60" color="grey-lighten-3" class="mb-3">
                <span class="text-h3">📧</span>
              </v-avatar>
              <h6 class="text-h6 text-medium-emphasis mb-2">No Pending Invitations</h6>
              <p class="text-body-2 text-medium-emphasis">
                You're all caught up! No project invitations waiting for your response.
              </p>
            </div>

            <!-- Invites List -->
            <div v-else class="invites-list">
              <div 
                v-for="invite in pendingInvites" 
                :key="invite.id"
                class="invite-card mb-4"
              >
                <v-card variant="outlined" class="invite-item">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start justify-space-between">
                      <div class="invite-info flex-grow-1">
                        <div class="d-flex align-center mb-3">
                          <v-chip 
                            :color="getRoleColor(invite.role)" 
                            size="small" 
                            class="mr-3"
                          >
                            {{ getRoleLabel(invite.role) }}
                          </v-chip>
                          <v-chip 
                            :color="getPriorityColor(invite.project?.priority || 'MEDIUM')" 
                            size="small" 
                            variant="tonal"
                          >
                            {{ getPriorityLabel(invite.project?.priority || 'MEDIUM') }}
                          </v-chip>
                        </div>
                        
                        <h6 class="text-h6 font-weight-medium mb-2">
                          {{ invite.project?.name || 'Project' }}
                        </h6>
                        
                        <p v-if="invite.project?.description" class="text-body-2 text-medium-emphasis mb-3">
                          {{ invite.project.description }}
                        </p>
                        
                        <div class="invite-details d-flex align-center text-caption text-medium-emphasis">
                          <v-icon size="16" class="mr-1">mdi-calendar</v-icon>
                          <span class="mr-4">
                            {{ formatDate(invite.project?.startDate) }} - {{ formatDate(invite.project?.endDate) }}
                          </span>
                          <v-icon size="16" class="mr-1">mdi-email</v-icon>
                          <span>{{ invite.email }}</span>
                        </div>
                      </div>
                      
                      <div class="invite-actions d-flex flex-column gap-2">
                        <v-btn 
                          color="success" 
                          variant="flat" 
                          size="small"
                          :loading="invite.loading"
                          @click="acceptInvite(invite.id)"
                        >
                          <v-icon size="16" class="mr-1">mdi-check</v-icon>
                          Accept
                        </v-btn>
                        <v-btn 
                          color="error" 
                          variant="outlined" 
                          size="small"
                          :loading="invite.loading"
                          @click="declineInvite(invite.id)"
                        >
                          <v-icon size="16" class="mr-1">mdi-close</v-icon>
                          Decline
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>
        </v-card>
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
  
  <!-- Onboarding Modal for Project Invitations -->
  <OnboardingModal
    v-model="showOnboardingModal"
    @invite-responded="handleInviteResponse"
  />
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

/* Invites Section Styles */
.invites-section {
  border: 1px solid rgb(var(--v-theme-outline));
  border-radius: 12px;
}

.invite-card {
  transition: all 0.3s ease;
}

.invite-item {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.invite-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.invite-info {
  min-width: 0;
}

.invite-details {
  opacity: 0.8;
}

.invite-actions {
  min-width: 120px;
}

.invites-list {
  max-height: 400px;
  overflow-y: auto;
}
</style>
