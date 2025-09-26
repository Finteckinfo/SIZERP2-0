<template>
  <v-card class="financial-overview" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Financial Overview</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon icon="mdi-refresh" />
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="financial-metrics">
          <div class="metric-item">
            <div class="metric-label">Budget Utilization</div>
            <div class="metric-value">{{ data?.budgetUtilization || 'N/A' }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Cost per Task</div>
            <div class="metric-value">{{ data?.costPerTask || 'N/A' }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">ROI</div>
            <div class="metric-value">{{ data?.roi || 'N/A' }}</div>
          </div>
          <div class="metric-item">
            <div class="metric-label">Profit Margins</div>
            <div class="metric-value">{{ data?.profitMargins || 'N/A' }}</div>
          </div>
        </div>
        
        <div class="projections-section" v-if="data?.projections?.length">
          <h4 class="section-title">Projections</h4>
          <div class="projections-list">
            <div 
              v-for="projection in data.projections" 
              :key="projection.metric"
              class="projection-item"
            >
              <div class="projection-metric">{{ projection.metric }}</div>
              <div class="projection-value">{{ projection.value }} {{ projection.currency }}</div>
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
.financial-overview {
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

.financial-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
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

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.projections-section {
  margin-top: 1.5rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.projections-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.projection-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
}

.projection-metric {
  font-size: 0.875rem;
  color: #64748b;
}

.projection-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
}
</style>
