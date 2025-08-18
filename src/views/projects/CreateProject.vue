<template>
  <div class="kanban-project-creator">
    <v-container fluid class="pa-0">
      <!-- Header with Progress Steps -->
      <v-app-bar elevation="0" color="primary" class="px-6">
        <v-btn icon @click="$router.push('/dashboard/default')" class="mr-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold text-white">Create New Project</h1>
          <p class="text-white text-opacity-80 mb-0">Build your project step by step</p>
        </div>
        
        <!-- Progress Steps -->
        <div class="d-flex align-center">
          <div 
            v-for="(step, index) in creationSteps" 
            :key="step.id"
            class="d-flex align-center"
          >
            <div 
              class="step-indicator d-flex align-center justify-center"
              :class="{
                'completed': step.completed,
                'current': step.id === currentStep,
                'pending': !step.completed && step.id !== currentStep
              }"
            >
              <v-icon v-if="step.completed" size="20">mdi-check</v-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span 
              class="step-label ml-2 text-white"
              :class="{ 'text-opacity-80': !step.completed && step.id !== currentStep }"
            >
              {{ step.label }}
            </span>
            <v-divider v-if="index < creationSteps.length - 1" vertical class="mx-4" color="white" opacity="0.3" />
          </div>
        </div>
      </v-app-bar>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Step 1: Project Foundation -->
        <div v-if="currentStep === 'foundation'" class="step-content">
          <v-row>
            <v-col cols="12" lg="8">
              <v-card elevation="0" class="pa-6 mb-6">
                <div class="d-flex align-center mb-6">
                  <v-avatar size="60" color="primary" class="mr-4">
                    <v-icon size="30" color="white">mdi-rocket-launch</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h4 font-weight-bold mb-2">Project Foundation</h2>
                    <p class="text-body-1 text-medium-emphasis">Let's start with the basics</p>
                  </div>
                </div>

                <v-row>
                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="projectData.name"
                      label="Project Name"
                      placeholder="Enter a catchy project name"
                      variant="outlined"
                      :rules="[v => !!v || 'Project name is required']"
                      required
                      class="mb-4"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-select
                      v-model="projectData.type"
                      label="Project Type"
                      :items="projectTypes"
                      variant="outlined"
                      :rules="[v => !!v || 'Project type is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="projectData.description"
                      label="Project Description"
                      placeholder="Describe your vision and goals"
                      variant="outlined"
                      rows="4"
                      :rules="[v => !!v || 'Project description is required']"
                      required
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card elevation="0" class="pa-4 mb-6">
                <h3 class="text-h6 font-weight-medium mb-4">Project Type Guide</h3>
                <div class="space-y-3">
                  <div class="d-flex align-start">
                    <v-icon color="success" class="mr-3 mt-1">mdi-arrow-right</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Progressive</h6>
                      <p class="text-caption text-medium-emphasis">Sequential phases, each building on the previous</p>
                    </div>
                  </div>
                  <div class="d-flex align-start">
                    <v-icon color="info" class="mr-3 mt-1">mdi-arrow-right</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Parallel</h6>
                      <p class="text-caption text-medium-emphasis">Multiple simultaneous workstreams</p>
                    </div>
                  </div>
                </div>
              </v-card>

              <v-card elevation="0" class="pa-4">
                <h3 class="text-h6 font-weight-medium mb-4">Quick Tips</h3>
                <div class="space-y-3">
                  <div class="d-flex align-start">
                    <v-icon color="warning" class="mr-3 mt-1">mdi-lightbulb</v-icon>
                    <p class="text-caption text-medium-emphasis">Choose a memorable name that reflects your project's purpose</p>
                  </div>
                  <div class="d-flex align-start">
                    <v-icon color="warning" class="mr-3 mt-1">mdi-lightbulb</v-icon>
                    <p class="text-caption text-medium-emphasis">Be specific about your goals and expected outcomes</p>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 2: Department Structure -->
        <div v-if="currentStep === 'departments'" class="step-content">
          <v-row>
            <v-col cols="12" lg="8">
              <v-card elevation="0" class="pa-6 mb-6">
                <div class="d-flex align-center mb-6">
                  <v-avatar size="60" color="success" class="mr-4">
                    <v-icon size="30" color="white">mdi-domain</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h4 font-weight-bold mb-2">Department Structure</h2>
                    <p class="text-body-1 text-medium-emphasis">Organize your project into logical departments</p>
                  </div>
                </div>

                <!-- Department Builder -->
                <div class="department-builder">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-h6 font-weight-medium">Departments</h3>
                    <v-btn 
                      color="primary" 
                      variant="flat" 
                      prepend-icon="mdi-plus"
                      @click="addDepartment"
                    >
                      Add Department
                    </v-btn>
                  </div>

                  <!-- Department Cards -->
                  <div class="departments-grid">
                    <div 
                      v-for="(dept, index) in projectData.departments" 
                      :key="index"
                      class="department-card"
                      draggable="true"
                      @dragstart="dragStart(index)"
                      @dragover.prevent
                      @drop="drop(index)"
                    >
                      <v-card elevation="2" class="h-100">
                        <v-card-text class="pa-4">
                          <div class="d-flex align-center justify-space-between mb-3">
                            <v-text-field
                              v-model="dept.name"
                              label="Department Name"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="mr-3"
                            />
                            <v-select
                              v-model="dept.type"
                              :items="departmentTypes"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="dept-type-select"
                            />
                          </div>
                          
                          <v-textarea
                            v-model="dept.description"
                            label="Description"
                            variant="outlined"
                            rows="2"
                            density="compact"
                            hide-details
                            class="mb-3"
                          />

                          <div class="d-flex align-center justify-space-between">
                            <v-chip 
                              :color="dept.type === 'MAJOR' ? 'primary' : 'secondary'"
                              size="small"
                            >
                              {{ dept.type }}
                            </v-chip>
                            <v-btn 
                              icon 
                              size="small" 
                              color="error" 
                              variant="text"
                              @click="removeDepartment(index)"
                            >
                              <v-icon>mdi-delete</v-icon>
                            </v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card elevation="0" class="pa-4 mb-6">
                <h3 class="text-h6 font-weight-medium mb-4">Department Types</h3>
                <div class="space-y-3">
                  <div class="d-flex align-start">
                    <v-icon color="primary" class="mr-3 mt-1">mdi-star</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Major</h6>
                      <p class="text-caption text-medium-emphasis">Core departments with significant impact</p>
                    </div>
                  </div>
                  <div class="d-flex align-start">
                    <v-icon color="secondary" class="mr-3 mt-1">mdi-star-outline</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Minor</h6>
                      <p class="text-caption text-medium-emphasis">Supporting departments</p>
                    </div>
                  </div>
                </div>
              </v-card>

              <v-card elevation="0" class="pa-4">
                <h3 class="text-h6 font-weight-medium mb-4">Drag & Drop</h3>
                <p class="text-caption text-medium-emphasis mb-3">
                  Reorder departments by dragging them around. The order will determine the workflow sequence.
                </p>
                <v-icon color="info" size="24">mdi-drag</v-icon>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 3: Team & Roles -->
        <div v-if="currentStep === 'team'" class="step-content">
          <v-row>
            <v-col cols="12" lg="8">
              <v-card elevation="0" class="pa-6 mb-6">
                <div class="d-flex align-center mb-6">
                  <v-avatar size="60" color="info" class="mr-4">
                    <v-icon size="30" color="white">mdi-account-group</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h4 font-weight-bold mb-2">Team & Roles</h2>
                    <p class="text-body-1 text-medium-emphasis">Assign roles and responsibilities</p>
                  </div>
                </div>

                <!-- Role Assignment -->
                <div class="role-assignment">
                  <div class="d-flex align-center justify-space-between mb-4">
                    <h3 class="text-h6 font-weight-medium">Project Roles</h3>
                    <v-btn 
                      color="primary" 
                      variant="flat" 
                      prepend-icon="mdi-plus"
                      @click="addRole"
                    >
                      Add Role
                    </v-btn>
                  </div>

                  <div class="roles-list">
                    <div 
                      v-for="(role, index) in projectData.roles" 
                      :key="index"
                      class="role-item mb-3"
                    >
                      <v-card elevation="1" class="pa-4">
                        <div class="d-flex align-center justify-space-between">
                          <div class="d-flex align-center flex-grow-1">
                            <v-avatar size="40" color="grey-lighten-3" class="mr-3">
                              <v-icon>mdi-account</v-icon>
                            </v-avatar>
                            <div class="flex-grow-1 mr-4">
                              <v-text-field
                                v-model="role.userEmail"
                                label="User Email"
                                variant="outlined"
                                density="compact"
                                hide-details
                                placeholder="Enter user email"
                              />
                            </div>
                            <v-select
                              v-model="role.role"
                              :items="roleTypes"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="role-select"
                            />
                          </div>
                          <v-btn 
                            icon 
                            size="small" 
                            color="error" 
                            variant="text"
                            @click="removeRole(index)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </v-card>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card elevation="0" class="pa-4 mb-6">
                <h3 class="text-h6 font-weight-medium mb-4">Role Types</h3>
                <div class="space-y-3">
                  <div class="d-flex align-start">
                    <v-icon color="error" class="mr-3 mt-1">mdi-crown</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Project Owner</h6>
                      <p class="text-caption text-medium-emphasis">Full control and decision making</p>
                    </div>
                  </div>
                  <div class="d-flex align-start">
                    <v-icon color="warning" class="mr-3 mt-1">mdi-account-tie</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Project Manager</h6>
                      <p class="text-caption text-medium-emphasis">Oversees execution and coordination</p>
                    </div>
                  </div>
                  <div class="d-flex align-start">
                    <v-icon color="info" class="mr-3 mt-1">mdi-account</v-icon>
                    <div>
                      <h6 class="text-subtitle-2 font-weight-medium">Employee</h6>
                      <p class="text-caption text-medium-emphasis">Contributes to specific tasks</p>
                    </div>
                  </div>
                </div>
              </v-card>

              <v-card elevation="0" class="pa-4">
                <h3 class="text-h6 font-weight-medium mb-4">Invite Team</h3>
                <p class="text-caption text-medium-emphasis">
                  Team members will receive email invitations to join the project once it's created.
                </p>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 4: Project Settings -->
        <div v-if="currentStep === 'settings'" class="step-content">
          <v-row>
            <v-col cols="12" lg="8">
              <v-card elevation="0" class="pa-6 mb-6">
                <div class="d-flex align-center mb-6">
                  <v-avatar size="60" color="warning" class="mr-4">
                    <v-icon size="30" color="white">mdi-cog</v-icon>
                  </v-avatar>
                  <div>
                    <h2 class="text-h4 font-weight-bold mb-2">Project Settings</h2>
                    <p class="text-body-1 text-medium-emphasis">Configure project preferences and metadata</p>
                  </div>
                </div>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="projectData.startDate"
                      label="Start Date"
                      type="date"
                      variant="outlined"
                      :rules="[v => !!v || 'Start date is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="projectData.endDate"
                      label="End Date"
                      type="date"
                      variant="outlined"
                      :rules="[v => !!v || 'End date is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="projectData.priority"
                      label="Priority Level"
                      :items="priorityLevels"
                      variant="outlined"
                      :rules="[v => !!v || 'Priority level is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="projectData.budgetRange"
                      label="Budget Range"
                      :items="budgetRanges"
                      variant="outlined"
                      :rules="[v => !!v || 'Budget range is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-combobox
                      v-model="projectData.tags"
                      label="Project Tags"
                      placeholder="Add tags to categorize your project"
                      variant="outlined"
                      multiple
                      chips
                      closable-chips
                    />
                  </v-col>
                </v-row>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card elevation="0" class="pa-4 mb-6">
                <h3 class="text-h6 font-weight-medium mb-4">Project Preview</h3>
                <div class="project-preview">
                  <v-card elevation="2" class="pa-4">
                    <h4 class="text-h6 font-weight-medium mb-3">{{ projectData.name || 'Project Name' }}</h4>
                    <p class="text-body-2 text-medium-emphasis mb-3">
                      {{ projectData.description || 'Project description will appear here' }}
                    </p>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                      <v-chip 
                        v-if="projectData.type" 
                        size="small" 
                        color="primary"
                      >
                        {{ projectData.type }}
                      </v-chip>
                      <v-chip 
                        v-if="projectData.priority" 
                        size="small" 
                        :color="getPriorityColor(projectData.priority)"
                      >
                        {{ projectData.priority }}
                      </v-chip>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      <div class="d-flex justify-space-between">
                        <span>Departments:</span>
                        <span>{{ projectData.departments.length }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Team Members:</span>
                        <span>{{ projectData.roles.length }}</span>
                      </div>
                    </div>
                  </v-card>
                </div>
              </v-card>

              <v-card elevation="0" class="pa-4">
                <h3 class="text-h6 font-weight-medium mb-4">Ready to Create?</h3>
                <p class="text-caption text-medium-emphasis mb-3">
                  Review your project details and click "Create Project" when ready.
                </p>
                <v-btn 
                  color="success" 
                  variant="flat" 
                  block
                  :loading="submitting"
                  :disabled="!canCreateProject"
                  @click="createProject"
                >
                  Create Project
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Navigation Footer -->
      <v-footer elevation="0" color="grey-lighten-5" class="px-6 py-4">
        <div class="d-flex align-center justify-space-between w-100">
          <v-btn 
            v-if="currentStep !== 'foundation'"
            variant="outlined" 
            @click="previousStep"
          >
            <v-icon class="mr-2">mdi-arrow-left</v-icon>
            Previous
          </v-btn>
          <div v-else></div>

          <v-btn 
            v-if="currentStep !== 'settings'"
            color="primary" 
            variant="flat"
            :disabled="!canProceedToNext"
            @click="nextStep"
          >
            Next
            <v-icon class="ml-2">mdi-arrow-right</v-icon>
          </v-btn>
          <div v-else></div>
        </div>
      </v-footer>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Type definitions for better TypeScript support
interface Department {
  name: string;
  type: string;
  description: string;
}

interface Role {
  userEmail: string;
  role: string;
}

// Project creation steps
const creationSteps = ref([
  { id: 'foundation', label: 'Foundation', completed: false },
  { id: 'departments', label: 'Departments', completed: false },
  { id: 'team', label: 'Team & Roles', completed: false },
  { id: 'settings', label: 'Settings', completed: false }
]);

const currentStep = ref('foundation');

// Project data structure based on schema
const projectData = reactive({
  name: '',
  description: '',
  type: '',
  startDate: '',
  endDate: '',
  priority: '',
  budgetRange: '',
  tags: [] as string[],
  departments: [] as Department[],
  roles: [] as Role[]
});

// Form options
const projectTypes = [
  { title: 'Progressive', value: 'PROGRESSIVE' },
  { title: 'Parallel', value: 'PARALLEL' }
];

const departmentTypes = [
  { title: 'Major', value: 'MAJOR' },
  { title: 'Minor', value: 'MINOR' }
];

const roleTypes = [
  { title: 'Project Owner', value: 'PROJECT_OWNER' },
  { title: 'Project Manager', value: 'PROJECT_MANAGER' },
  { title: 'Employee', value: 'EMPLOYEE' }
];

const priorityLevels = [
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Critical', value: 'CRITICAL' }
];

const budgetRanges = [
  { title: 'Under $1K', value: 'UNDER_1K' },
  { title: '$1K - $5K', value: '1K_TO_5K' },
  { title: '$5K - $10K', value: '5K_TO_10K' },
  { title: '$10K - $25K', value: '10K_TO_25K' },
  { title: '$25K - $50K', value: '25K_TO_50K' },
  { title: 'Over $50K', value: 'OVER_50K' }
];

// Form state
const submitting = ref(false);

// Computed properties
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 'foundation':
      return projectData.name && projectData.type && projectData.description;
    case 'departments':
      return projectData.departments.length > 0;
    case 'team':
      return projectData.roles.length > 0;
    default:
      return true;
  }
});

const canCreateProject = computed(() => {
  return projectData.name && 
         projectData.type && 
         projectData.description &&
         projectData.departments.length > 0 &&
         projectData.roles.length > 0 &&
         projectData.startDate &&
         projectData.endDate &&
         projectData.priority &&
         projectData.budgetRange;
});

// Navigation functions
const nextStep = () => {
  const currentIndex = creationSteps.value.findIndex(step => step.id === currentStep.value);
  if (currentIndex < creationSteps.value.length - 1) {
    creationSteps.value[currentIndex].completed = true;
    currentStep.value = creationSteps.value[currentIndex + 1].id;
  }
};

const previousStep = () => {
  const currentIndex = creationSteps.value.findIndex(step => step.id === currentStep.value);
  if (currentIndex > 0) {
    currentStep.value = creationSteps.value[currentIndex - 1].id;
  }
};

// Department management
const addDepartment = () => {
  projectData.departments.push({
    name: '',
    type: 'MAJOR',
    description: ''
  });
};

const removeDepartment = (index: number) => {
  projectData.departments.splice(index, 1);
};

// Role management
const addRole = () => {
  projectData.roles.push({
    userEmail: '',
    role: 'EMPLOYEE'
  });
};

const removeRole = (index: number) => {
  projectData.roles.splice(index, 1);
};

// Drag and drop functionality
const dragStart = (index: number) => {
  // Implementation for drag and drop reordering
};

const drop = (index: number) => {
  // Implementation for drop reordering
};

// Utility functions
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    case 'CRITICAL': return 'error';
    default: return 'grey';
  }
};

// Project creation
const createProject = async () => {
  submitting.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Project created:', projectData);
    
    // Redirect to dashboard
    router.push('/dashboard/default');
  } catch (error) {
    console.error('Error creating project:', error);
  } finally {
    submitting.value = false;
  }
};

// Initialize with some sample data for testing
onMounted(() => {
  // Add a sample department and role for testing
  addDepartment();
  addRole();
});
</script>

<style scoped>
.kanban-project-creator {
  min-height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.main-content {
  padding: 32px;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  transition: all 0.3s ease;
}

.step-indicator.completed {
  background: rgb(var(--v-theme-success));
  color: white;
}

.step-indicator.current {
  background: rgb(var(--v-theme-primary));
  color: white;
}

.step-indicator.pending {
  background: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
}

.step-label {
  font-weight: 500;
  white-space: nowrap;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.department-card {
  cursor: move;
  transition: transform 0.2s ease;
}

.department-card:hover {
  transform: translateY(-2px);
}

.dept-type-select {
  min-width: 100px;
}

.role-select {
  min-width: 150px;
}

.roles-list {
  max-height: 400px;
  overflow-y: auto;
}

.role-item {
  transition: all 0.2s ease;
}

.role-item:hover {
  transform: translateX(4px);
}

.project-preview {
  transition: all 0.3s ease;
}

.space-y-3 > * + * {
  margin-top: 12px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .main-content {
    padding: 16px;
  }
  
  .departments-grid {
    grid-template-columns: 1fr;
  }
  
  .step-label {
    display: none;
  }
}
</style>
