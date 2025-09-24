<template>
  <div class="analytics-page">
    <!-- Header -->
    <div class="analytics-header">
      <div class="header-content">
        <h1 class="page-title">
          <v-icon class="mr-3" color="primary" size="32">mdi-chart-line</v-icon>
          Analytics & Reports
        </h1>
        <p class="page-subtitle">Comprehensive insights into your project performance and team productivity</p>
      </div>
      
      <div class="header-actions">
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-download"
          @click="exportReport"
        >
          Export Report
        </v-btn>
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-share"
          @click="shareDashboard"
        >
          Share Dashboard
        </v-btn>
      </div>
    </div>

    <!-- Quick Stats Overview -->
    <div class="quick-stats-section">
      <AnalyticsOverview 
        v-if="!loading.overview"
        :data="overviewData"
        @refresh="loadOverview"
      />
      <AnalyticsSkeleton v-else type="overview" />
    </div>

    <!-- Main Analytics Grid -->
    <div class="analytics-grid">
      <!-- Project Performance -->
      <div class="analytics-widget">
        <ProjectPerformance 
          v-if="!loading.performance"
          :data="performanceData"
          @refresh="loadPerformance"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Team Analytics -->
      <div class="analytics-widget">
        <TeamAnalytics 
          v-if="!loading.team"
          :data="teamData"
          @refresh="loadTeam"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Financial Overview -->
      <div class="analytics-widget">
        <FinancialOverview 
          v-if="!loading.financial"
          :data="financialData"
          @refresh="loadFinancial"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Timeline Analysis -->
      <div class="analytics-widget">
        <TimelineAnalysis 
          v-if="!loading.timeline"
          :data="timelineData"
          @refresh="loadTimeline"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Department Efficiency -->
      <div class="analytics-widget">
        <DepartmentEfficiency 
          v-if="!loading.departments"
          :data="departmentData"
          @refresh="loadDepartments"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Resource Utilization -->
      <div class="analytics-widget">
        <ResourceUtilization 
          v-if="!loading.resources"
          :data="resourceData"
          @refresh="loadResources"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Trends & Predictions -->
      <div class="analytics-widget">
        <TrendsAnalysis 
          v-if="!loading.trends"
          :data="trendsData"
          @refresh="loadTrends"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Live Dashboard -->
      <div class="analytics-widget">
        <LiveDashboard 
          v-if="!loading.live"
          :data="liveData"
          @refresh="loadLive"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>
    </div>

    <!-- Activity Feed -->
    <div class="activity-section">
      <ActivityFeed 
        v-if="!loading.activity"
        :data="activityData"
        @refresh="loadActivity"
      />
      <AnalyticsSkeleton v-else type="activity" />
    </div>

    <!-- Alerts Section -->
    <div class="alerts-section">
      <AlertsPanel 
        v-if="!loading.alerts"
        :data="alertsData"
        @refresh="loadAlerts"
      />
      <AnalyticsSkeleton v-else type="alerts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUser } from '@clerk/vue';

// Components
import AnalyticsOverview from './components/AnalyticsOverview.vue';
import ProjectPerformance from './components/ProjectPerformance.vue';
import TeamAnalytics from './components/TeamAnalytics.vue';
import FinancialOverview from './components/FinancialOverview.vue';
import TimelineAnalysis from './components/TimelineAnalysis.vue';
import DepartmentEfficiency from './components/DepartmentEfficiency.vue';
import ResourceUtilization from './components/ResourceUtilization.vue';
import TrendsAnalysis from './components/TrendsAnalysis.vue';
import LiveDashboard from './components/LiveDashboard.vue';
import ActivityFeed from './components/ActivityFeed.vue';
import AlertsPanel from './components/AlertsPanel.vue';
import AnalyticsSkeleton from './components/AnalyticsSkeleton.vue';

// Services
import { analyticsApi } from './services/analyticsApi';

const { user } = useUser();

// Data state
const overviewData = ref<any>(null);
const performanceData = ref<any>(null);
const teamData = ref<any>(null);
const financialData = ref<any>(null);
const timelineData = ref<any>(null);
const departmentData = ref<any>(null);
const resourceData = ref<any>(null);
const trendsData = ref<any>(null);
const liveData = ref<any>(null);
const activityData = ref<any>(null);
const alertsData = ref<any>(null);

// User's projects for project-specific analytics
const userProjects = ref<any[]>([]);

// Loading state
const loading = ref({
  overview: true,
  performance: true,
  team: true,
  financial: true,
  timeline: true,
  departments: true,
  resources: true,
  trends: true,
  live: true,
  activity: true,
  alerts: true
});

// Error state
const error = ref<string | null>(null);

// Computed
const hasData = computed(() => {
  return overviewData.value || performanceData.value || teamData.value;
});

// Methods
const loadUserProjects = async () => {
  if (!user.value?.id) return;
  
  try {
    // Get user's projects - this should come from your existing project API
    // For now, we'll use a placeholder or get from overview data
    console.log('Loading user projects for analytics...');
    // TODO: Replace with actual project API call
    userProjects.value = []; // Will be populated from overview data
  } catch (err: any) {
    console.error('Failed to load user projects:', err);
  }
};

const loadOverview = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value.overview = true;
    const data = await analyticsApi.getDashboardOverview({
      userId: user.value.id,
      dateRange: '30d' // Backend default
    });
    overviewData.value = data;
  } catch (err: any) {
    console.error('Failed to load overview:', err);
    error.value = err.message;
  } finally {
    loading.value.overview = false;
  }
};

const loadPerformance = async () => {
  try {
    loading.value.performance = true;
    // Use all-projects endpoint for cross-project analytics
    const data = await analyticsApi.getAllProjectsPerformance({
      dateRange: '30d', // Backend default
      granularity: 'weekly' // Backend default
    });
    performanceData.value = data;
  } catch (err: any) {
    console.error('Failed to load performance:', err);
  } finally {
    loading.value.performance = false;
  }
};

const loadTeam = async () => {
  try {
    loading.value.team = true;
    // Use all-projects endpoint for cross-project team analytics
    const data = await analyticsApi.getAllProjectsTeamPerformance({
      dateRange: '30d' // Backend default
    });
    teamData.value = data;
  } catch (err: any) {
    console.error('Failed to load team data:', err);
  } finally {
    loading.value.team = false;
  }
};

const loadFinancial = async () => {
  try {
    loading.value.financial = true;
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for financial analysis');
      return;
    }
    
    const data = await analyticsApi.getFinancialOverview({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    financialData.value = data;
  } catch (err: any) {
    console.error('Failed to load financial data:', err);
  } finally {
    loading.value.financial = false;
  }
};

const loadTimeline = async () => {
  try {
    loading.value.timeline = true;
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for timeline analysis');
      return;
    }
    
    const data = await analyticsApi.getTimelineAnalysis({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    timelineData.value = data;
  } catch (err: any) {
    console.error('Failed to load timeline data:', err);
  } finally {
    loading.value.timeline = false;
  }
};

const loadDepartments = async () => {
  try {
    loading.value.departments = true;
    const data = await analyticsApi.getDepartmentEfficiency({
      dateRange: '30d'
    });
    departmentData.value = data;
  } catch (err: any) {
    console.error('Failed to load department data:', err);
  } finally {
    loading.value.departments = false;
  }
};

const loadResources = async () => {
  try {
    loading.value.resources = true;
    const data = await analyticsApi.getResourceUtilization({
      resourceType: 'human'
    });
    resourceData.value = data;
  } catch (err: any) {
    console.error('Failed to load resource data:', err);
  } finally {
    loading.value.resources = false;
  }
};

const loadTrends = async () => {
  try {
    loading.value.trends = true;
    const data = await analyticsApi.getTrendsAnalysis({
      metricType: 'productivity',
      dateRange: '90d',
      granularity: 'weekly'
    });
    trendsData.value = data;
  } catch (err: any) {
    console.error('Failed to load trends data:', err);
  } finally {
    loading.value.trends = false;
  }
};

const loadLive = async () => {
  try {
    loading.value.live = true;
    // Get project IDs from user's projects
    const projectIds = userProjects.value.map(p => p.id);
    
    const data = await analyticsApi.getLiveDashboard({
      projectIds: projectIds
    });
    liveData.value = data;
  } catch (err: any) {
    console.error('Failed to load live data:', err);
  } finally {
    loading.value.live = false;
  }
};

const loadActivity = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value.activity = true;
    const data = await analyticsApi.getActivityFeed({
      userId: user.value.id,
      limit: 20
    });
    activityData.value = data;
  } catch (err: any) {
    console.error('Failed to load activity data:', err);
  } finally {
    loading.value.activity = false;
  }
};

const loadAlerts = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value.alerts = true;
    const data = await analyticsApi.getActiveAlerts({
      userId: user.value.id
    });
    alertsData.value = data;
  } catch (err: any) {
    console.error('Failed to load alerts data:', err);
  } finally {
    loading.value.alerts = false;
  }
};

const loadAllData = async () => {
  // First load user projects, then load analytics data
  await loadUserProjects();
  
  const promises = [
    loadOverview(),
    loadPerformance(),
    loadTeam(),
    loadFinancial(),
    loadTimeline(),
    loadDepartments(),
    loadResources(),
    loadTrends(),
    loadLive(),
    loadActivity(),
    loadAlerts()
  ];
  
  await Promise.allSettled(promises);
};

const exportReport = async () => {
  try {
    const response = await analyticsApi.exportReport({
      reportType: 'comprehensive',
      format: 'PDF',
      filters: {
        dateRange: '30d'
      }
    });
    
    // Handle download
    console.log('Export started:', response);
  } catch (err: any) {
    console.error('Failed to export report:', err);
  }
};

const shareDashboard = async () => {
  try {
    const response = await analyticsApi.shareDashboard({
      dashboardId: 'main',
      shareType: 'link',
      permissions: ['read']
    });
    
    console.log('Share link created:', response);
  } catch (err: any) {
    console.error('Failed to share dashboard:', err);
  }
};

// Lifecycle
onMounted(() => {
  if (user.value?.id) {
    loadAllData();
  }
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 2rem;
}

.analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #64748b;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.quick-stats-section {
  margin-bottom: 2rem;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.analytics-widget {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.activity-section,
.alerts-section {
  margin-bottom: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }
  
  .analytics-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (min-width: 1440px) {
  .analytics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1920px) {
  .analytics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
