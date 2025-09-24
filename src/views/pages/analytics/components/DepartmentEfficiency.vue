<template>
  <v-card class="department-efficiency" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Department Efficiency</h3>
        <v-btn icon variant="text" size="small" @click="$emit('refresh')">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      
      <div class="widget-content">
        <div class="departments-list">
          <div 
            v-for="dept in data?.departmentComparison?.slice(0, 5)" 
            :key="dept.departmentId"
            class="department-item"
          >
            <div class="department-info">
              <div class="department-name">{{ dept.departmentName }}</div>
              <div class="department-efficiency">{{ dept.efficiency }}%</div>
            </div>
            <v-progress-linear
              :model-value="dept.efficiency"
              :color="getEfficiencyColor(dept.efficiency)"
              height="8"
              rounded
            />
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

const props = defineProps<Props>();
defineEmits<Emits>();

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency >= 80) return 'success';
  if (efficiency >= 60) return 'warning';
  return 'error';
};
</script>

<style scoped>
.department-efficiency {
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

.departments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.department-item {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.department-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.department-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.department-efficiency {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}
</style>
