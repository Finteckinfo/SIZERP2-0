<template>
  <v-card class="trends-analysis" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Trends Analysis</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="trends-overview">
          <div class="trend-item">
            <div class="trend-label">Productivity Trend</div>
            <div class="trend-value positive">
              <v-icon size="16" color="success">mdi-trending-up</v-icon>
              <span>+12%</span>
            </div>
          </div>
          <div class="trend-item">
            <div class="trend-label">Completion Rate</div>
            <div class="trend-value positive">
              <v-icon size="16" color="success">mdi-trending-up</v-icon>
              <span>+8%</span>
            </div>
          </div>
        </div>
        
        <div class="trend-chart">
          <div class="chart-placeholder">
            <v-icon size="48" color="grey">mdi-chart-line</v-icon>
            <p class="chart-text">Trend chart will be displayed here</p>
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
.trends-analysis {
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

.trends-overview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.trend-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.trend-value {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 0.875rem;
}

.trend-value.positive {
  color: #059669;
}

.trend-value.negative {
  color: #dc2626;
}

.trend-chart {
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.chart-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}
</style>
