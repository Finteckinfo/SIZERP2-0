<script setup lang="ts">
import { computed } from 'vue';
import { FolderIcon, UsersIcon, CheckIcon, ClockIcon } from 'vue-tabler-icons';

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  teamMembers: number;
  totalDepartments: number;
}

interface Props {
  stats: ProjectStats;
}

const props = defineProps<Props>();

const completionRate = computed(() => {
  if (props.stats.totalTasks === 0) return 0;
  return Math.round((props.stats.completedTasks / props.stats.totalTasks) * 100);
});

const activeRate = computed(() => {
  if (props.stats.totalProjects === 0) return 0;
  return Math.round((props.stats.activeProjects / props.stats.totalProjects) * 100);
});
</script>

<template>
  <v-card elevation="0" class="bg-lightprimary">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-6">
        <h3 class="text-h4 font-weight-medium">Project Overview</h3>
        <v-avatar size="50" color="primary" class="text-white">
          <FolderIcon size="24" />
        </v-avatar>
      </div>

      <v-row>
        <!-- Total Projects -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 bg-white rounded-lg">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" color="primary" class="text-white">
                <FolderIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold text-primary mb-1">{{ stats.totalProjects }}</h4>
            <p class="text-body-2 text-medium-emphasis">Total Projects</p>
            <v-chip 
              size="small" 
              color="success" 
              variant="tonal"
              class="mt-2"
            >
              {{ activeRate }}% Active
            </v-chip>
          </div>
        </v-col>

        <!-- Active Projects -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 bg-white rounded-lg">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" color="success" class="text-white">
                <CheckIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold text-success mb-1">{{ stats.activeProjects }}</h4>
            <p class="text-body-2 text-medium-emphasis">Active Projects</p>
            <v-chip 
              size="small" 
              color="info" 
              variant="tonal"
              class="mt-2"
            >
              {{ stats.completedProjects }} Completed
            </v-chip>
          </div>
        </v-col>

        <!-- Total Tasks -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 bg-white rounded-lg">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" color="warning" class="text-white">
                <ClockIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold text-warning mb-1">{{ stats.totalTasks }}</h4>
            <p class="text-body-2 text-medium-emphasis">Total Tasks</p>
            <v-chip 
              size="small" 
              color="success" 
              variant="tonal"
              class="mt-2"
            >
              {{ completionRate }}% Done
            </v-chip>
          </div>
        </v-col>

        <!-- Team Members -->
        <v-col cols="12" sm="6" lg="3">
          <div class="text-center pa-4 bg-white rounded-lg">
            <div class="d-flex align-center justify-center mb-3">
              <v-avatar size="40" color="info" class="text-white">
                <UsersIcon size="20" />
              </v-avatar>
            </div>
            <h4 class="text-h3 font-weight-bold text-info mb-1">{{ stats.teamMembers }}</h4>
            <p class="text-body-2 text-medium-emphasis">Team Members</p>
            <v-chip 
              size="small" 
              color="secondary" 
              variant="tonal"
              class="mt-2"
            >
              {{ stats.totalDepartments }} Depts
            </v-chip>
          </div>
        </v-col>
      </v-row>

      <!-- Progress Summary -->
      <div class="mt-6 pa-4 bg-white rounded-lg">
        <h6 class="text-h6 font-weight-medium mb-3">Overall Progress</h6>
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-body-2">Task Completion</span>
          <span class="text-body-2 font-weight-medium">{{ completionRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="completionRate"
          color="success"
          height="8"
          rounded
          class="mb-3"
        ></v-progress-linear>
        
        <div class="d-flex align-center justify-space-between">
          <span class="text-body-2">Project Activity</span>
          <span class="text-body-2 font-weight-medium">{{ activeRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="activeRate"
          color="primary"
          height="8"
          rounded
        ></v-progress-linear>
      </div>
    </v-card-text>
  </v-card>
</template>
