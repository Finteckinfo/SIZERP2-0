<template>
  <v-card class="resource-utilization" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Resource Utilization</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="utilization-overview">
          <div class="overview-item">
            <div class="overview-label">Allocation Efficiency</div>
            <div class="overview-value">{{ data?.allocationEfficiency || 0 }}%</div>
          </div>
        </div>
        
        <div class="utilization-chart">
          <h4 class="section-title">Resource Types</h4>
          <div class="resource-types">
            <div class="resource-type">
              <div class="type-label">Human Resources</div>
              <div class="type-utilization">85%</div>
            </div>
            <div class="resource-type">
              <div class="type-label">Equipment</div>
              <div class="type-utilization">72%</div>
            </div>
            <div class="resource-type">
              <div class="type-label">Budget</div>
              <div class="type-utilization">68%</div>
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
.resource-utilization {
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

.utilization-overview {
  margin-bottom: 2rem;
}

.overview-item {
  text-align: center;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.overview-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.overview-value {
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

.resource-types {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.resource-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
}

.type-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.type-utilization {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
}
</style>
