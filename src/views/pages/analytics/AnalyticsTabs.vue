<template>
  <div class="analytics-tabs">
    <!-- Global Filters -->
    <div class="global-filters">
      <v-card class="filter-card" elevation="0">
        <v-card-text class="pa-4">
          <div class="filters-row">
            <div class="filter-group">
              <v-select
                v-model="globalFilters.dateRange"
                :items="dateRangeOptions"
                label="Date Range"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 120px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-group">
              <v-select
                v-model="globalFilters.granularity"
                :items="granularityOptions"
                label="Granularity"
                density="compact"
                variant="outlined"
                hide-details
                style="min-width: 120px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-group">
              <v-select
                v-model="globalFilters.projectId"
                :items="projectOptions"
                label="Project"
                density="compact"
                variant="outlined"
                hide-details
                clearable
                style="min-width: 150px"
                @update:model-value="onFiltersChange"
              />
            </div>
            
            <div class="filter-actions">
              <v-btn
                color="primary"
                variant="text"
                size="small"
                @click="refreshCurrentTab"
                :loading="isRefreshing"
              >
                <v-icon size="16" class="me-1">mdi-refresh</v-icon>
                Refresh
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Tab Navigation -->
    <v-card class="tabs-card" elevation="0">
      <v-tabs
        v-model="activeTab"
        color="primary"
        align-tabs="start"
        class="analytics-tabs-nav"
        @update:model-value="(value: unknown) => onTabChange(String(value))"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          class="tab-item"
        >
          <v-icon :icon="tab.icon" size="20" class="me-2" />
          {{ tab.label }}
          <v-chip
            v-if="tab.badge"
            :color="tab.badgeColor"
            size="x-small"
            class="ms-2"
          >
            {{ tab.badge }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-card-text class="tab-content pa-0">
        <v-window v-model="activeTab" class="analytics-window">
          <!-- Overview Tab -->
          <v-window-item value="overview">
            <AnalyticsTab
              :sections="overviewSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Projects Tab -->
          <v-window-item value="projects">
            <AnalyticsTab
              :sections="projectsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Teams Tab -->
          <v-window-item value="teams">
            <AnalyticsTab
              :sections="teamsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Departments Tab -->
          <v-window-item value="departments">
            <AnalyticsTab
              :sections="departmentsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Trends Tab -->
          <v-window-item value="trends">
            <AnalyticsTab
              :sections="trendsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Quality Tab -->
          <v-window-item value="quality">
            <AnalyticsTab
              :sections="qualitySections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- User Tab -->
          <v-window-item value="user">
            <AnalyticsTab
              :sections="userSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Reports Tab -->
          <v-window-item value="reports">
            <AnalyticsTab
              :sections="reportsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>

          <!-- Settings Tab -->
          <v-window-item value="settings">
            <AnalyticsTab
              :sections="settingsSections"
              :global-filters="globalFilters"
              @section-toggle="onSectionToggle"
              @refresh-section="onRefreshSection"
            />
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUser } from '@clerk/vue';
import AnalyticsTab from './AnalyticsTab.vue';

const { user } = useUser();

// Global filters
const globalFilters = ref({
  dateRange: '30d',
  granularity: 'weekly',
  projectId: null as any
});

// Filter options
const dateRangeOptions = [
  { title: 'Last 7 days', value: '7d' },
  { title: 'Last 30 days', value: '30d' },
  { title: 'Last 90 days', value: '90d' },
  { title: 'Last year', value: '1y' }
];

const granularityOptions = [
  { title: 'Daily', value: 'daily' },
  { title: 'Weekly', value: 'weekly' },
  { title: 'Monthly', value: 'monthly' }
];

const projectOptions = ref([
  // Will be populated from user projects
]);

// Tab configuration
const tabs = [
  { value: 'overview', label: 'Overview', icon: 'mdi-view-dashboard', badge: null, badgeColor: 'primary' },
  { value: 'projects', label: 'Projects', icon: 'mdi-folder-multiple', badge: null, badgeColor: 'success' },
  { value: 'teams', label: 'Teams', icon: 'mdi-account-group', badge: null, badgeColor: 'info' },
  { value: 'departments', label: 'Departments', icon: 'mdi-domain', badge: null, badgeColor: 'warning' },
  { value: 'trends', label: 'Trends', icon: 'mdi-trending-up', badge: null, badgeColor: 'primary' },
  { value: 'quality', label: 'Quality', icon: 'mdi-check-circle', badge: null, badgeColor: 'success' },
  { value: 'user', label: 'User', icon: 'mdi-account', badge: null, badgeColor: 'info' },
  { value: 'reports', label: 'Reports', icon: 'mdi-file-document', badge: null, badgeColor: 'secondary' },
  { value: 'settings', label: 'Settings', icon: 'mdi-cog', badge: null, badgeColor: 'grey' }
];

// Active tab
const activeTab = ref('overview');
const isRefreshing = ref(false);

// Section configurations for each tab
const overviewSections = [
  {
    id: 'dashboard-overview',
    title: 'Dashboard Overview',
    description: 'Key performance indicators and summary metrics',
    component: 'AnalyticsOverview',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'all-projects-performance',
    title: 'All Projects Performance',
    description: 'Aggregated performance metrics across all projects',
    component: 'ProjectPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'live-snapshot',
    title: 'Live Snapshot',
    description: 'Real-time project status and active tasks',
    component: 'LiveDashboard',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const projectsSections = [
  {
    id: 'project-performance',
    title: 'Project Performance',
    description: 'Detailed performance metrics for individual projects',
    component: 'ProjectPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'timeline-analysis',
    title: 'Timeline Analysis',
    description: 'Project timeline tracking and deadline adherence',
    component: 'TimelineAnalysis',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'benchmarks',
    title: 'Benchmarks Comparison',
    description: 'Compare project performance against industry standards',
    component: 'BenchmarksComparison',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const teamsSections = [
  {
    id: 'team-performance',
    title: 'Team Performance',
    description: 'Team productivity and collaboration metrics',
    component: 'TeamAnalytics',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'workload-distribution',
    title: 'Workload Distribution',
    description: 'Task distribution and capacity planning',
    component: 'WorkloadDistribution',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'collaboration-metrics',
    title: 'Collaboration Metrics',
    description: 'Team communication and knowledge sharing',
    component: 'CollaborationMetrics',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const departmentsSections = [
  {
    id: 'department-efficiency',
    title: 'Department Efficiency',
    description: 'Department productivity and resource utilization',
    component: 'DepartmentEfficiency',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'resource-utilization',
    title: 'Resource Utilization',
    description: 'Resource allocation and optimization insights',
    component: 'ResourceUtilization',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const trendsSections = [
  {
    id: 'trends-analysis',
    title: 'Trends Analysis',
    description: 'Historical trends and pattern analysis',
    component: 'TrendsAnalysis',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'predictions-forecast',
    title: 'Predictions & Forecast',
    description: 'AI-powered predictions and forecasting',
    component: 'PredictionsForecast',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  }
];

const qualitySections = [
  {
    id: 'quality-metrics',
    title: 'Quality Metrics',
    description: 'Quality tracking, defects, and approval metrics',
    component: 'QualityMetrics',
    defaultOpen: true,
    priority: 'high' as 'high'
  }
];

const userSections = [
  {
    id: 'my-performance',
    title: 'My Performance',
    description: 'Personal productivity and performance metrics',
    component: 'UserPerformance',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'my-dashboard',
    title: 'My Dashboard',
    description: 'Personalized dashboard with quick actions',
    component: 'UserDashboard',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'activity-feed',
    title: 'Activity Feed',
    description: 'Recent activities and project updates',
    component: 'ActivityFeed',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'active-alerts',
    title: 'Active Alerts',
    description: 'System alerts and notifications',
    component: 'AlertsPanel',
    defaultOpen: false,
    priority: 'low' as 'low'
  }
];

const reportsSections = [
  {
    id: 'custom-reports',
    title: 'Custom Reports',
    description: 'Generate and view custom analytics reports',
    component: 'CustomReports',
    defaultOpen: true,
    priority: 'high' as 'high'
  }
];

const settingsSections = [
  {
    id: 'analytics-settings',
    title: 'Analytics Settings',
    description: 'User preferences and configuration settings',
    component: 'AnalyticsSettings',
    defaultOpen: true,
    priority: 'high' as 'high'
  },
  {
    id: 'widget-configuration',
    title: 'Widget Configuration',
    description: 'Dashboard widget settings and layouts',
    component: 'WidgetConfiguration',
    defaultOpen: false,
    priority: 'medium' as 'medium'
  },
  {
    id: 'cache-status',
    title: 'Cache Status',
    description: 'System cache performance and optimization',
    component: 'CacheStatus',
    defaultOpen: false,
    priority: 'low' as 'low'
  },
  {
    id: 'data-freshness',
    title: 'Data Freshness',
    description: 'Data synchronization and freshness monitoring',
    component: 'DataFreshness',
    defaultOpen: false,
    priority: 'low' as 'low'
  }
];

// Methods
const onTabChange = (newTab: string) => {
  activeTab.value = newTab;
  saveTabState();
  // Lazy load data for the new tab
  loadTabData(newTab);
};

const onFiltersChange = () => {
  saveFiltersState();
  // Refresh current tab data with new filters
  refreshCurrentTab();
};

const onSectionToggle = (sectionId: string, isOpen: boolean) => {
  saveSectionState(activeTab.value, sectionId, isOpen);
};

const onRefreshSection = (sectionId: string) => {
  // Trigger refresh for specific section
  console.log(`Refreshing section: ${sectionId}`);
};

const refreshCurrentTab = async () => {
  isRefreshing.value = true;
  try {
    // Refresh all open sections in current tab
    console.log(`Refreshing tab: ${activeTab.value}`);
    // Implementation will trigger refresh for all open sections
  } finally {
    isRefreshing.value = false;
  }
};

const loadTabData = (tab: string) => {
  // Lazy load data for the specified tab
  console.log(`Loading data for tab: ${tab}`);
  // Implementation will load data for visible sections only
};

// State persistence
const saveTabState = () => {
  localStorage.setItem('analytics-active-tab', activeTab.value);
};

const saveFiltersState = () => {
  localStorage.setItem('analytics-filters', JSON.stringify(globalFilters.value));
};

const saveSectionState = (tab: string, sectionId: string, isOpen: boolean) => {
  const key = `analytics-section-${tab}-${sectionId}`;
  localStorage.setItem(key, isOpen.toString());
};

const loadSavedState = () => {
  // Load saved tab
  const savedTab = localStorage.getItem('analytics-active-tab');
  if (savedTab && tabs.find(t => t.value === savedTab)) {
    activeTab.value = savedTab;
  }

  // Load saved filters
  const savedFilters = localStorage.getItem('analytics-filters');
  if (savedFilters) {
    try {
      const filters = JSON.parse(savedFilters);
      globalFilters.value = { ...globalFilters.value, ...filters };
    } catch (e) {
      console.warn('Failed to parse saved filters:', e);
    }
  }
};

// Lifecycle
onMounted(() => {
  loadSavedState();
  // Load initial data for the active tab
  loadTabData(activeTab.value);
});
</script>

<style scoped>
.analytics-tabs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.global-filters {
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  flex-shrink: 0;
}

.filter-actions {
  margin-left: auto;
}

.tabs-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.analytics-tabs-nav {
  background: rgba(248, 250, 252, 0.5);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.tab-item {
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
}

.tab-content {
  background: rgba(248, 250, 252, 0.3);
}

.analytics-window {
  background: transparent;
}

/* Responsive design */
@media (max-width: 768px) {
  .analytics-tabs {
    padding: 0.5rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-actions {
    margin-left: 0;
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .analytics-tabs-nav {
    overflow-x: auto;
  }
  
  .tab-item {
    min-width: 120px;
    flex-shrink: 0;
  }
}
</style>
