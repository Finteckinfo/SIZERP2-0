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
          @click="handleExportReport({ reportType: 'comprehensive', format: 'PDF' })"
        >
          Export Report
        </v-btn>
        <v-btn
          color="secondary"
          variant="outlined"
          prepend-icon="mdi-share"
          @click="handleShareDashboard({ dashboardId: 'main', shareType: 'link' })"
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

      <!-- Workload Distribution -->
      <div class="analytics-widget">
        <WorkloadDistribution 
          v-if="!loading.workload"
          :data="workloadData"
          @refresh="loadWorkload"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Trends Analysis -->
      <div class="analytics-widget">
        <TrendsAnalysis 
          v-if="!loading.trends"
          :data="trendsData"
          @refresh="loadTrends"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Predictions Forecast -->
      <div class="analytics-widget">
        <PredictionsForecast 
          v-if="!loading.predictions"
          :data="predictionsData"
          @refresh="loadPredictions"
        />
        <AnalyticsSkeleton v-else type="widget" />
      </div>

      <!-- Benchmarks Comparison -->
      <div class="analytics-widget">
        <BenchmarksComparison 
          v-if="!loading.benchmarks"
          :data="benchmarksData"
          @refresh="loadBenchmarks"
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

    <!-- User Performance Section -->
    <div class="user-performance-section">
      <UserPerformance 
        v-if="!loading.userPerformance"
        :data="userPerformanceData"
        @refresh="loadUserPerformance"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- User Dashboard Section -->
    <div class="user-dashboard-section">
      <UserDashboard 
        v-if="!loading.userDashboard"
        :data="userDashboardData"
        @refresh="loadUserDashboard"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Bottlenecks Analysis Section -->
    <div class="bottlenecks-section">
      <BottlenecksAnalysis 
        v-if="!loading.bottlenecks"
        :data="bottlenecksData"
        @refresh="loadBottlenecks"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Quality Metrics Section -->
    <div class="quality-section">
      <QualityMetrics 
        v-if="!loading.quality"
        :data="qualityData"
        @refresh="loadQuality"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Collaboration Metrics Section -->
    <div class="collaboration-section">
      <CollaborationMetrics 
        v-if="!loading.collaboration"
        :data="collaborationData"
        @refresh="loadCollaboration"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Custom Reports Section -->
    <div class="custom-reports-section">
      <CustomReports 
        v-if="!loading.customReport"
        :data="customReportData"
        :loading="loading.exportReport"
        @refresh="loadCustomReport"
        @export="handleExportReport"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Analytics Settings Section -->
    <div class="analytics-settings-section">
      <AnalyticsSettings 
        v-if="!loading.configSettings"
        :data="configSettingsData"
        @refresh="loadConfigSettings"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Widget Configuration Section -->
    <div class="widget-configuration-section">
      <WidgetConfiguration 
        v-if="!loading.widgetConfig"
        :data="widgetConfigData"
        @refresh="loadWidgetConfig"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Cache Status Section -->
    <div class="cache-status-section">
      <CacheStatus 
        v-if="!loading.cacheStatus"
        :data="cacheStatusData"
        @refresh="loadCacheStatus"
      />
      <AnalyticsSkeleton v-else type="widget" />
    </div>

    <!-- Data Freshness Section -->
    <div class="data-freshness-section">
      <DataFreshness 
        v-if="!loading.dataFreshness"
        :data="dataFreshnessData"
        @refresh="loadDataFreshness"
      />
      <AnalyticsSkeleton v-else type="widget" />
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
import WorkloadDistribution from './components/WorkloadDistribution.vue';
import TrendsAnalysis from './components/TrendsAnalysis.vue';
import PredictionsForecast from './components/PredictionsForecast.vue';
import BenchmarksComparison from './components/BenchmarksComparison.vue';
import LiveDashboard from './components/LiveDashboard.vue';
import ActivityFeed from './components/ActivityFeed.vue';
import AlertsPanel from './components/AlertsPanel.vue';
import UserPerformance from './components/UserPerformance.vue';
import UserDashboard from './components/UserDashboard.vue';
import BottlenecksAnalysis from './components/BottlenecksAnalysis.vue';
import QualityMetrics from './components/QualityMetrics.vue';
import CollaborationMetrics from './components/CollaborationMetrics.vue';
import CustomReports from './components/CustomReports.vue';
import AnalyticsSettings from './components/AnalyticsSettings.vue';
import WidgetConfiguration from './components/WidgetConfiguration.vue';
import CacheStatus from './components/CacheStatus.vue';
import DataFreshness from './components/DataFreshness.vue';
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
const workloadData = ref<any>(null);
const trendsData = ref<any>(null);
const predictionsData = ref<any>(null);
const benchmarksData = ref<any>(null);
const liveData = ref<any>(null);
const activityData = ref<any>(null);
const alertsData = ref<any>(null);
const userPerformanceData = ref<any>(null);
const userDashboardData = ref<any>(null);
const bottlenecksData = ref<any>(null);
const qualityData = ref<any>(null);
const collaborationData = ref<any>(null);
const customReportData = ref<any>(null);
const exportReportData = ref<any>(null);
const shareDashboardData = ref<any>(null);
const configSettingsData = ref<any>(null);
const widgetConfigData = ref<any>(null);
const cacheStatusData = ref<any>(null);
const dataFreshnessData = ref<any>(null);

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
  workload: true,
  trends: true,
  predictions: true,
  benchmarks: true,
  live: true,
  activity: true,
  alerts: true,
  userPerformance: true,
  userDashboard: true,
  bottlenecks: true,
  quality: true,
  collaboration: true,
  customReport: true,
  exportReport: true,
  shareDashboard: true,
  configSettings: true,
  widgetConfig: true,
  cacheStatus: true,
  dataFreshness: true
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
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for department analysis');
      return;
    }
    
    const data = await analyticsApi.getDepartmentEfficiency({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
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
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for resource analysis');
      return;
    }
    
    const data = await analyticsApi.getResourceUtilization({
      projectId: firstProject.id,
      resourceType: 'human' // Backend default
    });
    resourceData.value = data;
  } catch (err: any) {
    console.error('Failed to load resource data:', err);
  } finally {
    loading.value.resources = false;
  }
};

const loadWorkload = async () => {
  try {
    loading.value.workload = true;
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for workload analysis');
      return;
    }
    
    const data = await analyticsApi.getWorkloadDistribution({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    workloadData.value = data;
  } catch (err: any) {
    console.error('Failed to load workload data:', err);
  } finally {
    loading.value.workload = false;
  }
};

const loadTrends = async () => {
  try {
    loading.value.trends = true;
    // Get project IDs from user's projects
    const projectIds = userProjects.value.map(p => p.id);
    
    const data = await analyticsApi.getTrendsAnalysis({
      metricType: 'throughput', // Backend required parameter
      dateRange: '90d', // Backend default
      granularity: 'weekly' // Backend default
    });
    trendsData.value = data;
  } catch (err: any) {
    console.error('Failed to load trends data:', err);
  } finally {
    loading.value.trends = false;
  }
};

const loadPredictions = async () => {
  try {
    loading.value.predictions = true;
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for predictions analysis');
      return;
    }
    
    const data = await analyticsApi.getPredictionsForecast({
      projectId: firstProject.id,
      predictionType: 'completion', // Backend default
      horizon: '90d' // Backend default
    });
    predictionsData.value = data;
  } catch (err: any) {
    console.error('Failed to load predictions data:', err);
  } finally {
    loading.value.predictions = false;
  }
};

const loadBenchmarks = async () => {
  try {
    loading.value.benchmarks = true;
    // Use first project for now - in future we can let user select
    const firstProject = userProjects.value[0];
    if (!firstProject) {
      console.log('No projects available for benchmarks analysis');
      return;
    }
    
    const data = await analyticsApi.getBenchmarksComparison({
      projectId: firstProject.id,
      benchmarkType: 'historical' // Backend default
    });
    benchmarksData.value = data;
  } catch (err: any) {
    console.error('Failed to load benchmarks data:', err);
  } finally {
    loading.value.benchmarks = false;
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
  try {
    loading.value.activity = true;
    const data = await analyticsApi.getActivityFeed({
      limit: 20 // Backend default
    });
    activityData.value = data;
  } catch (err: any) {
    console.error('Failed to load activity data:', err);
  } finally {
    loading.value.activity = false;
  }
};

const loadAlerts = async () => {
  try {
    loading.value.alerts = true;
    const data = await analyticsApi.getActiveAlerts({});
    alertsData.value = data;
  } catch (err: any) {
    console.error('Failed to load alerts data:', err);
  } finally {
    loading.value.alerts = false;
  }
};

const loadUserPerformance = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value.userPerformance = true;
    const data = await analyticsApi.getUserPerformance(user.value.id, {
      dateRange: '30d' // Backend default
    });
    userPerformanceData.value = data;
  } catch (err: any) {
    console.error('Failed to load user performance data:', err);
  } finally {
    loading.value.userPerformance = false;
  }
};

const loadUserDashboard = async () => {
  if (!user.value?.id) return;
  
  try {
    loading.value.userDashboard = true;
    const data = await analyticsApi.getUserDashboard(user.value.id, {
      viewType: 'personal' // Backend default
    });
    userDashboardData.value = data;
  } catch (err: any) {
    console.error('Failed to load user dashboard data:', err);
  } finally {
    loading.value.userDashboard = false;
  }
};

const loadBottlenecks = async () => {
  const firstProject = userProjects.value[0];
  if (!firstProject?.id) return;
  
  try {
    loading.value.bottlenecks = true;
    const data = await analyticsApi.getBottlenecksAnalysis({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    bottlenecksData.value = data;
  } catch (err: any) {
    console.error('Failed to load bottlenecks data:', err);
  } finally {
    loading.value.bottlenecks = false;
  }
};

const loadQuality = async () => {
  const firstProject = userProjects.value[0];
  if (!firstProject?.id) return;
  
  try {
    loading.value.quality = true;
    const data = await analyticsApi.getQualityMetrics({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    qualityData.value = data;
  } catch (err: any) {
    console.error('Failed to load quality data:', err);
  } finally {
    loading.value.quality = false;
  }
};

const loadCollaboration = async () => {
  const firstProject = userProjects.value[0];
  if (!firstProject?.id) return;
  
  try {
    loading.value.collaboration = true;
    const data = await analyticsApi.getCollaborationMetrics({
      projectId: firstProject.id,
      dateRange: '30d' // Backend default
    });
    collaborationData.value = data;
  } catch (err: any) {
    console.error('Failed to load collaboration data:', err);
  } finally {
    loading.value.collaboration = false;
  }
};

const loadCustomReport = async () => {
  try {
    loading.value.customReport = true;
    const data = await analyticsApi.getCustomReport({
      reportId: 'default', // Placeholder report ID
      dateRange: '30d' // Backend default
    });
    customReportData.value = data;
  } catch (err: any) {
    console.error('Failed to load custom report data:', err);
  } finally {
    loading.value.customReport = false;
  }
};

const handleExportReport = async (reportData: any) => {
  try {
    loading.value.exportReport = true;
    const data = await analyticsApi.exportReport(reportData);
    exportReportData.value = data;
    return data;
  } catch (err: any) {
    console.error('Failed to export report:', err);
    throw err;
  } finally {
    loading.value.exportReport = false;
  }
};

const handleShareDashboard = async (shareData: any) => {
  try {
    loading.value.shareDashboard = true;
    const data = await analyticsApi.shareDashboard(shareData);
    shareDashboardData.value = data;
    return data;
  } catch (err: any) {
    console.error('Failed to share dashboard:', err);
    throw err;
  } finally {
    loading.value.shareDashboard = false;
  }
};

const loadConfigSettings = async () => {
  try {
    loading.value.configSettings = true;
    const data = await analyticsApi.getConfigSettings({});
    configSettingsData.value = data;
  } catch (err: any) {
    console.error('Failed to load config settings:', err);
  } finally {
    loading.value.configSettings = false;
  }
};

const loadWidgetConfig = async () => {
  try {
    loading.value.widgetConfig = true;
    const data = await analyticsApi.getWidgetConfig({
      dashboardId: 'main' // Default dashboard ID
    });
    widgetConfigData.value = data;
  } catch (err: any) {
    console.error('Failed to load widget config:', err);
  } finally {
    loading.value.widgetConfig = false;
  }
};

const loadCacheStatus = async () => {
  try {
    loading.value.cacheStatus = true;
    const data = await analyticsApi.getCacheStatus({
      cacheType: 'memory' // Backend default
    });
    cacheStatusData.value = data;
  } catch (err: any) {
    console.error('Failed to load cache status:', err);
  } finally {
    loading.value.cacheStatus = false;
  }
};

const loadDataFreshness = async () => {
  try {
    loading.value.dataFreshness = true;
    const data = await analyticsApi.getDataFreshness({
      dataType: 'tasks' // Backend default
    });
    dataFreshnessData.value = data;
  } catch (err: any) {
    console.error('Failed to load data freshness:', err);
  } finally {
    loading.value.dataFreshness = false;
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
    loadWorkload(),
    loadTrends(),
    loadPredictions(),
    loadBenchmarks(),
    loadLive(),
    loadActivity(),
    loadAlerts(),
    loadUserPerformance(),
    loadUserDashboard(),
    loadBottlenecks(),
    loadQuality(),
    loadCollaboration(),
    loadCustomReport(),
    loadConfigSettings(),
    loadWidgetConfig(),
    loadCacheStatus(),
    loadDataFreshness()
  ];
  
  await Promise.allSettled(promises);
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
