<template>
  <v-card class="project-performance" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Project Performance</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="performance-metrics">
          <div class="metric-item">
            <div class="metric-label">Health Score</div>
            <div class="metric-value">{{ data?.metrics?.healthScore || 0 }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Completion Rate</div>
            <div class="metric-value">{{ data?.metrics?.completionRate || 0 }}%</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Timeline Progress</div>
            <div class="metric-value">{{ data?.metrics?.timelineProgress || 0 }}%</div>
          </div>
        </div>
        
        <div class="budget-section">
          <h4 class="section-title">Budget vs Actual</h4>
          <div class="budget-comparison">
            <div class="budget-item">
              <span class="budget-label">Budget</span>
              <span class="budget-value">${{ data?.metrics?.budgetVsActual?.budget || 0 }}</span>
            </div>
            <div class="budget-item">
              <span class="budget-label">Actual</span>
              <span class="budget-value">${{ data?.metrics?.budgetVsActual?.actual || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  data: any;
}

interface Emits {
  (e: 'refresh'): void;
}

defineProps<Props>();
defineEmits<Emits>();
</script>

<style scoped>
.project-performance {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  height: 100%;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.performance-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.metric-item {
  text-align: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
}

.budget-section {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.budget-comparison {
  display: flex;
  justify-content: space-between;
}

.budget-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.budget-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.budget-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
