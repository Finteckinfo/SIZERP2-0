<template>
  <v-card class="live-dashboard" elevation="0">
    <v-card-text class="pa-6">
      <div class="widget-header">
        <h3 class="text-h5 font-weight-medium">Live Dashboard</h3>
        <div class="live-indicator">
          <v-icon size="12" color="success">mdi-circle</v-icon>
          <span class="live-text">LIVE</span>
        </div>
      </div>
      
      <div class="widget-content">
        <div class="live-stats">
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon color="primary">mdi-account-group</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.teamOnline?.length || 0 }}</div>
              <div class="stat-label">Online</div>
            </div>
          </div>
          
          <div class="stat-item">
            <div class="stat-icon">
              <v-icon color="success">mdi-check-circle</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ data?.activeTasks?.length || 0 }}</div>
              <div class="stat-label">Active Tasks</div>
            </div>
          </div>
        </div>
        
        <div class="system-health">
          <h4 class="section-title">System Health</h4>
          <div class="health-items">
            <div class="health-item">
              <v-icon color="success">mdi-check-circle</v-icon>
              <span>API Status</span>
            </div>
            <div class="health-item">
              <v-icon color="success">mdi-check-circle</v-icon>
              <span>Database</span>
            </div>
            <div class="health-item">
              <v-icon color="warning">mdi-alert-circle</v-icon>
              <span>Cache</span>
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
.live-dashboard {
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

.live-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
}

.live-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
}

.stat-icon {
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.health-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.health-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(248, 250, 252, 0.5);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #374151;
}
</style>
