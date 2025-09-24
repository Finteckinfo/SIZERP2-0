<template>
  <v-card class="analytics-overview" elevation="0">
    <v-card-text class="pa-6">
      <!-- Header -->
      <div class="overview-header mb-6">
        <div class="d-flex align-center justify-space-between">
          <h3 class="text-h4 font-weight-medium">Analytics Overview</h3>
          <div class="header-actions">
            <v-btn-toggle
              v-model="selectedTimeRange"
              variant="outlined"
              density="compact"
              mandatory
              @update:model-value="handleTimeRangeChange"
            >
              <v-btn value="7d" size="small">7d</v-btn>
              <v-btn value="30d" size="small">30d</v-btn>
              <v-btn value="90d" size="small">90d</v-btn>
              <v-btn value="1y" size="small">1y</v-btn>
            </v-btn-toggle>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="$emit('refresh')"
            >
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Totals Grid -->
      <v-row class="mb-6">
        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="primary" class="text-white">
                <v-icon>mdi-folder-multiple</v-icon>
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.totalProjects || 0 }}</div>
              <div class="stat-label">Total Projects</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success">mdi-trending-up</v-icon>
                <span>+12%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="success" class="text-white">
                <v-icon>mdi-play-circle</v-icon>
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.activeProjects || 0 }}</div>
              <div class="stat-label">Active Projects</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success">mdi-trending-up</v-icon>
                <span>+8%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="info" class="text-white">
                <v-icon>mdi-check-circle</v-icon>
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.completedTasks || 0 }}</div>
              <div class="stat-label">Completed Tasks</div>
              <div class="stat-change positive">
                <v-icon size="16" color="success">mdi-trending-up</v-icon>
                <span>+15%</span>
              </div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" sm="6" lg="3">
          <div class="stat-card">
            <div class="stat-icon">
              <v-avatar size="48" color="warning" class="text-white">
                <v-icon>mdi-account-group</v-icon>
              </v-avatar>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ data?.totals?.teamMembers || 0 }}</div>
              <div class="stat-label">Team Members</div>
              <div class="stat-change neutral">
                <v-icon size="16" color="grey">mdi-minus</v-icon>
                <span>0%</span>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Performance Scores -->
      <div class="performance-scores">
        <h4 class="text-h6 font-weight-medium mb-4">Performance Scores</h4>
        <v-row>
          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="primary" class="mr-2">mdi-speedometer</v-icon>
                <span class="score-title">Productivity</span>
              </div>
              <div class="score-value">{{ data?.scores?.productivity || 0 }}%</div>
              <v-progress-linear
                :model-value="data?.scores?.productivity || 0"
                color="primary"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                Team productivity score based on task completion and efficiency
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="success" class="mr-2">mdi-cash</v-icon>
                <span class="score-title">Budget Utilization</span>
              </div>
              <div class="score-value">{{ data?.scores?.budgetUtilization || 0 }}%</div>
              <v-progress-linear
                :model-value="data?.scores?.budgetUtilization || 0"
                :color="getBudgetColor(data?.scores?.budgetUtilization || 0)"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                Budget efficiency and cost management performance
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="score-card">
              <div class="score-header">
                <v-icon color="info" class="mr-2">mdi-clock</v-icon>
                <span class="score-title">Timeline Adherence</span>
              </div>
              <div class="score-value">{{ data?.scores?.timelineAdherence || 0 }}%</div>
              <v-progress-linear
                :model-value="data?.scores?.timelineAdherence || 0"
                :color="getTimelineColor(data?.scores?.timelineAdherence || 0)"
                height="8"
                rounded
                class="mt-2"
              />
              <div class="score-description">
                On-time delivery and deadline adherence rate
              </div>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Quick Insights -->
      <div class="quick-insights mt-6">
        <h4 class="text-h6 font-weight-medium mb-4">Quick Insights</h4>
        <v-row>
          <v-col cols="12" md="6">
            <v-alert
              type="success"
              variant="tonal"
              density="compact"
              class="insight-card"
            >
              <template #prepend>
                <v-icon>mdi-trending-up</v-icon>
              </template>
              <div class="insight-content">
                <div class="insight-title">Productivity Up</div>
                <div class="insight-description">
                  Team productivity increased by 12% compared to last period
                </div>
              </div>
            </v-alert>
          </v-col>

          <v-col cols="12" md="6">
            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="insight-card"
            >
              <template #prepend>
                <v-icon>mdi-clock-fast</v-icon>
              </template>
              <div class="insight-content">
                <div class="insight-title">Faster Delivery</div>
                <div class="insight-description">
                  Average project completion time reduced by 8 days
                </div>
              </div>
            </v-alert>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
  (e: 'timeRangeChange', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const selectedTimeRange = ref('30d');

const handleTimeRangeChange = (value: string) => {
  selectedTimeRange.value = value;
  emit('timeRangeChange', value);
};

const getBudgetColor = (value: number) => {
  if (value <= 60) return 'success';
  if (value <= 80) return 'warning';
  return 'error';
};

const getTimelineColor = (value: number) => {
  if (value >= 90) return 'success';
  if (value >= 70) return 'warning';
  return 'error';
};
</script>

<style scoped>
.analytics-overview {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.overview-header {
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding-bottom: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.stat-change.positive {
  color: #059669;
}

.stat-change.negative {
  color: #dc2626;
}

.stat-change.neutral {
  color: #6b7280;
}

.performance-scores {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
}

.score-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(226, 232, 240, 0.5);
  height: 100%;
}

.score-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.score-title {
  font-weight: 600;
  color: #374151;
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.score-description {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 0.75rem;
  line-height: 1.4;
}

.quick-insights {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 12px;
  padding: 1.5rem;
}

.insight-card {
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.insight-content {
  margin-left: 0.5rem;
}

.insight-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.insight-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 768px) {
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.75rem;
  }
  
  .score-value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .analytics-overview {
    margin: 0 -0.5rem;
  }
  
  .overview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
