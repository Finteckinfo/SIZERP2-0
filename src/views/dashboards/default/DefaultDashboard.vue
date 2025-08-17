<script setup lang="ts">
// Import new ERP components
import QuickActions from './components/QuickActions.vue';
import ProjectOverview from './components/ProjectOverview.vue';
import ProjectCard from './components/ProjectCard.vue';
import RecentActivity from './components/RecentActivity.vue';

// Dummy data for projects
const projects = [
  {
    id: '1',
    name: 'E-commerce Platform Redesign',
    description: 'Complete redesign of the company e-commerce platform with modern UI/UX and improved performance',
    type: 'PROGRESSIVE' as const,
    userRole: 'PROJECT_OWNER' as const,
    createdAt: new Date('2024-01-15'),
    departmentCount: 4,
    taskCount: 24,
    completedTasks: 18
  },
  {
    id: '2',
    name: 'Mobile App Development',
    description: 'Cross-platform mobile application for iOS and Android with real-time synchronization',
    type: 'PARALLEL' as const,
    userRole: 'PROJECT_MANAGER' as const,
    createdAt: new Date('2024-02-01'),
    departmentCount: 3,
    taskCount: 32,
    completedTasks: 22
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Comprehensive analytics dashboard for business intelligence and reporting',
    type: 'PROGRESSIVE' as const,
    userRole: 'EMPLOYEE' as const,
    createdAt: new Date('2024-01-28'),
    departmentCount: 2,
    taskCount: 18,
    completedTasks: 12
  },
  {
    id: '4',
    name: 'API Gateway Implementation',
    description: 'Centralized API gateway for microservices architecture with authentication and rate limiting',
    type: 'PARALLEL' as const,
    userRole: 'PROJECT_MANAGER' as const,
    createdAt: new Date('2024-02-10'),
    departmentCount: 3,
    taskCount: 28,
    completedTasks: 15
  }
];

// Dummy data for project statistics
const projectStats = {
  totalProjects: 12,
  activeProjects: 8,
  completedProjects: 4,
  totalTasks: 156,
  completedTasks: 98,
  pendingTasks: 58,
  teamMembers: 24,
  totalDepartments: 18
};

// Dummy data for recent activities
const recentActivities = [
  {
    id: '1',
    type: 'task_completed' as const,
    title: 'Task Completed',
    description: 'Frontend authentication module has been completed and tested',
    projectName: 'E-commerce Platform',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    user: 'John Smith'
  },
  {
    id: '2',
    type: 'project_created' as const,
    title: 'New Project Created',
    description: 'New project "AI Chatbot Integration" has been created',
    projectName: 'AI Chatbot Integration',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    user: 'Sarah Johnson'
  },
  {
    id: '3',
    type: 'member_added' as const,
    title: 'Team Member Added',
    description: 'Alex Chen has been added to the Mobile App Development team',
    projectName: 'Mobile App Development',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    user: 'Mike Wilson'
  },
  {
    id: '4',
    type: 'payment_released' as const,
    title: 'Payment Released',
    description: 'Payment of $2,500 has been released for completed tasks',
    projectName: 'Data Analytics Dashboard',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    user: 'Finance Team'
  },
  {
    id: '5',
    type: 'deadline_approaching' as const,
    title: 'Deadline Approaching',
    description: 'Phase 1 deadline is approaching in 2 days',
    projectName: 'API Gateway Implementation',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    user: 'System Alert'
  }
];
</script>

<template>
  <div class="erp-dashboard">
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
        
        <v-row>
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
        <!-- Quick Stats Cards -->
        <v-card elevation="0" class="mb-4">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="success" class="mb-3">
                <span class="text-h4 text-white">📈</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">This Week's Progress</h5>
              <div class="d-flex justify-space-around">
                <div class="text-center">
                  <h6 class="text-h4 font-weight-bold text-success">12</h6>
                  <p class="text-caption text-medium-emphasis">Tasks Done</p>
                </div>
                <div class="text-center">
                  <h6 class="text-h4 font-weight-bold text-primary">3</h6>
                  <p class="text-caption text-medium-emphasis">Projects Active</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card elevation="0">
          <v-card-text class="pa-4">
            <div class="text-center">
              <v-avatar size="50" color="warning" class="mb-3">
                <span class="text-h4 text-white">⏰</span>
              </v-avatar>
              <h5 class="text-h5 font-weight-medium mb-2">Upcoming Deadlines</h5>
              <div class="text-left">
                <div class="d-flex align-center mb-3">
                  <v-chip size="small" color="error" class="mr-2">Urgent</v-chip>
                  <span class="text-body-2">API Gateway Phase 1</span>
                </div>
                <div class="d-flex align-center mb-3">
                  <v-chip size="small" color="warning" class="mr-2">Due Soon</v-chip>
                  <span class="text-body-2">Mobile App Testing</span>
                </div>
                <div class="d-flex align-center">
                  <v-chip size="small" color="info" class="mr-2">This Week</v-chip>
                  <span class="text-body-2">E-commerce Launch</span>
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
  padding: 0;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.v-card {
  border-radius: 12px;
}
</style>
