<script setup lang="ts">
import { PlusIcon, FolderIcon, UsersIcon, CalendarIcon, ChartBarIcon } from 'vue-tabler-icons';
import { useRouter } from 'vue-router';

const router = useRouter();

const quickActions = [
  { 
    title: 'Create Project', 
    description: 'Start a new project',
    icon: PlusIcon, 
    color: 'primary', 
    action: () => router.push('/projects/create')
  },
  { 
    title: 'My Projects', 
    description: 'View all your projects',
    icon: FolderIcon, 
    color: 'success', 
    action: () => router.push('/projects')
  },
  { 
    title: 'Team Members', 
    description: 'Manage team and roles',
    icon: UsersIcon, 
    color: 'info', 
    action: () => console.log('Team Members clicked') 
  },
  { 
    title: 'Task Calendar', 
    description: 'View task timeline',
    icon: CalendarIcon, 
    color: 'warning', 
    action: () => console.log('Task Calendar clicked') 
  },
  { 
    title: 'Analytics', 
    description: 'Project performance',
    icon: ChartBarIcon, 
    color: 'secondary', 
    action: () => console.log('Analytics clicked') 
  }
];
</script>

<template>
  <v-card elevation="0" class="bg-primary overflow-hidden">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h3 class="text-h4 font-weight-medium text-white mb-2">Quick Actions</h3>
          <p class="text-body-1 text-white text-opacity-80">Access your most used features</p>
        </div>
        <v-avatar size="60" color="white" class="text-primary">
          <PlusIcon size="30" />
        </v-avatar>
      </div>

      <v-row>
        <v-col 
          v-for="(action, index) in quickActions" 
          :key="index" 
          cols="12" 
          sm="6" 
          lg="4"
        >
          <v-card 
            elevation="0" 
            class="action-card h-100 cursor-pointer transition-all duration-300"
            @click="action.action"
          >
            <v-card-text class="pa-4 text-center">
              <v-avatar 
                size="50" 
                :color="action.color" 
                class="mb-3"
              >
                <component :is="action.icon" size="24" color="white" />
              </v-avatar>
              
              <h6 class="text-h6 font-weight-medium mb-2">{{ action.title }}</h6>
              <p class="text-body-2 text-medium-emphasis">{{ action.description }}</p>
              
              <v-btn 
                size="small" 
                variant="text" 
                :color="action.color"
                class="mt-3"
              >
                Open
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.action-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: white;
}

.cursor-pointer {
  cursor: pointer;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
