<template>
  <div class="kanban-project-creator">
    <v-container fluid class="pa-0">
      <!-- Header -->
      <v-app-bar elevation="0" color="white" class="px-6 border-b">
        <v-btn icon @click="$router.push('/dashboard/default')" class="mr-4">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div class="flex-grow-1">
          <h1 class="text-h4 font-weight-bold text-grey-darken-3">New Kanban Board</h1>
        </div>
      </v-app-bar>

      <!-- Progress Steps Bar -->
      <div class="progress-container">
        <div class="progress-line"></div>
        <div class="progress-steps">
          <div 
            v-for="(step, index) in creationSteps" 
            :key="step.id"
            class="progress-step"
            :class="{
              'completed': step.completed,
              'current': step.id === currentStep,
              'pending': !step.completed && step.id !== currentStep
            }"
          >
            <div class="step-number">
              <v-icon v-if="step.completed" size="20" color="white">mdi-check</v-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-connector" v-if="index < creationSteps.length - 1"></div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <v-container fluid class="fill-height">
          <v-row align="center" justify="center">
            <v-col cols="12" class="text-center">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-h6">Loading project configuration...</p>
            </v-col>
          </v-row>
        </v-container>
      </div>

      <!-- Error/Success Messages -->
      <v-snackbar :model-value="!!error" color="error" timeout="5000" @update:model-value="error = ''">
        {{ error }}
        <template v-slot:actions>
          <v-btn variant="text" @click="error = ''">Close</v-btn>
        </template>
      </v-snackbar>

      <v-snackbar :model-value="!!success" color="success" timeout="3000" @update:model-value="success = ''">
        {{ success }}
        <template v-slot:actions>
          <v-btn variant="text" @click="success = ''">Close</v-btn>
        </template>
      </v-snackbar>

      <!-- Main Content Area -->
      <div v-if="!loading" class="main-content">
        <!-- Templates Section -->
        <v-row v-if="projectTemplates.length > 0" class="mb-6">
          <v-col cols="12">
            <v-card elevation="0" class="pa-4 border rounded-lg">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium">Project Templates</h3>
                <v-btn 
                  v-if="selectedTemplate"
                  variant="text" 
                  color="secondary"
                  @click="selectedTemplate = null"
                >
                  Clear Template
                </v-btn>
              </div>
              <div class="d-flex flex-wrap gap-3">
                <v-chip
                  v-for="template in projectTemplates"
                  :key="template.id"
                  :color="selectedTemplate?.id === template.id ? 'primary' : 'default'"
                  variant="outlined"
                  class="cursor-pointer"
                  @click="applyTemplate(template)"
                >
                  {{ template.name }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Draft Management -->
        <v-row v-if="hasDraft" class="mb-6">
          <v-col cols="12">
            <v-card elevation="0" color="blue-lighten-5" class="pa-4 border rounded-lg">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon color="blue" class="mr-3">mdi-content-save</v-icon>
                  <div>
                    <h4 class="text-subtitle-1 font-weight-medium mb-1">Draft Found</h4>
                    <p class="text-caption text-medium-emphasis mb-0">You have an unsaved draft from {{ formatDate(draft?.updatedAt) }}</p>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <v-btn variant="outlined" size="small" @click="loadDraft">Load Draft</v-btn>
                  <v-btn variant="text" size="small" @click="clearDraft">Clear Draft</v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Step Content -->
        <div class="step-content-container">
          <!-- Foundation Step -->
          <div v-if="currentStep === 'foundation'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Basic Information</h2>
            </div>
            
            <v-form ref="foundationForm" v-model="foundationValid">
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="projectData.name"
                    label="Name of board"
                    placeholder="Name of board"
                    variant="outlined"
                    :rules="[v => !!v || 'Project name is required']"
                    class="mb-4"
                  />
                  
                  <v-select
                    v-model="projectData.type"
                    label="Board Type"
                    placeholder="Board Type"
                    :items="projectTypes"
                    variant="outlined"
                    :rules="[v => !!v || 'Project type is required']"
                    class="mb-4"
                  />
                  
                  <v-textarea
                    v-model="projectData.description"
                    label="Description (Optional)"
                    placeholder="Description (Optional)"
                    variant="outlined"
                    rows="4"
                    class="mb-4"
                  />
                  
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.startDate"
                        label="Start Date"
                        type="date"
                        variant="outlined"
                        :rules="[v => !!v || 'Start date is required']"
                        class="mb-4"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.endDate"
                        label="End Date"
                        type="date"
                        variant="outlined"
                        :rules="[v => !!v || 'End date is required']"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>
                </v-col>
                
                <v-col cols="12" md="4">
                  <v-card elevation="0" class="pa-4 border rounded-lg">
                    <h4 class="text-subtitle-1 font-weight-medium mb-3">Board Visibility</h4>
                    <v-radio-group v-model="projectData.isPublic" class="mb-4">
                      <v-radio value="false" label="Private" color="primary" />
                      <v-radio value="true" label="Public" color="primary" />
                    </v-radio-group>
                    
                    <v-checkbox
                      v-model="projectData.allowGuests"
                      label="Allow Guest"
                      color="primary"
                    />
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </div>

          <!-- Departments Step -->
          <div v-if="currentStep === 'departments'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Column/Stages</h2>
              <p class="text-body-2 text-medium-emphasis">Define the workflow stages for your project</p>
            </div>
            
            <div class="departments-container">
              <div class="departments-grid">
                <div 
                  v-for="(dept, index) in projectData.departments" 
                  :key="index"
                  class="department-card"
                  :class="{ 'dragging': draggedDept === index }"
                  draggable="true"
                  @dragstart="startDrag(index)"
                  @dragover.prevent
                  @drop="onDrop(index)"
                >
                  <div class="department-header">
                    <v-text-field
                      v-model="dept.name"
                      label="Stage Name"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-select
                      v-model="dept.type"
                      label="Type"
                      :items="departmentTypes"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    <v-textarea
                      v-model="dept.description"
                      label="Description"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      class="mb-3"
                    />
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-text-field
                        v-model.number="dept.order"
                        label="Order"
                        type="number"
                        variant="outlined"
                        density="compact"
                        class="mr-2"
                        style="max-width: 100px"
                      />
                      <v-switch
                        v-model="dept.isVisible"
                        label="Visible"
                        color="primary"
                        density="compact"
                        hide-details
                      />
                    </div>
                    <v-btn 
                      color="error" 
                      variant="text" 
                      size="small"
                      @click="removeDepartment(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      Remove
                    </v-btn>
                  </div>
                </div>
              </div>
              
              <v-btn 
                color="primary" 
                variant="outlined" 
                class="mt-4"
                @click="addDepartment"
              >
                <v-icon class="mr-2">mdi-plus</v-icon>
                Add Stage
              </v-btn>
            </div>
          </div>

          <!-- Team & Roles Step -->
          <div v-if="currentStep === 'team'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Team & Roles</h2>
              <p class="text-body-2 text-medium-emphasis">Assign team members and their roles</p>
            </div>
            
            <div class="roles-container">
              <div class="roles-grid">
                <div 
                  v-for="(role, index) in projectData.roles" 
                  :key="index"
                  class="role-card"
                >
                  <div class="role-header">
                    <v-text-field
                      v-model="role.userEmail"
                      label="User Email"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                      @input="searchUsers(role.userEmail)"
                    />
                    
                    <v-select
                      v-model="role.role"
                      label="Role"
                      :items="roleTypes"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                    />
                    
                    <v-select
                      v-model="role.departmentId"
                      label="Department"
                      :items="projectData.departments"
                      item-title="name"
                      item-value="order"
                      variant="outlined"
                      density="compact"
                      class="mb-3"
                      :rules="[v => !!v || 'Department is required']"
                    />
                    
                    <v-btn 
                      color="error" 
                      variant="text" 
                      size="small"
                      @click="removeRole(index)"
                    >
                      <v-icon>mdi-delete</v-icon>
                      Remove
                    </v-btn>
                  </div>
                </div>
              </div>
              
              <v-btn 
                color="primary" 
                variant="outlined" 
                class="mt-4"
                @click="addRole"
              >
                <v-icon class="mr-2">mdi-plus</v-icon>
                Add Team Member
              </v-btn>
            </div>
          </div>

          <!-- Settings Step -->
          <div v-if="currentStep === 'settings'" class="step-content">
            <div class="step-header">
              <h2 class="text-h5 font-weight-medium mb-4">Project Settings</h2>
              <p class="text-body-2 text-medium-emphasis">Configure additional project settings</p>
            </div>
            
            <v-row>
              <v-col cols="12" md="8">
                <v-form ref="settingsForm" v-model="settingsValid">
                  <v-text-field
                    v-model="projectData.budgetRange"
                    label="Budget"
                    placeholder="Enter budget amount"
                    variant="outlined"
                    class="mb-4"
                    type="number"
                    prefix="$"
                  />
                  
                  <v-select
                    v-model="projectData.priority"
                    label="Priority Level"
                    :items="priorityLevels"
                    variant="outlined"
                    class="mb-4"
                  />
                  
                  <v-text-field
                    v-model="projectData.tags"
                    label="Tags"
                    placeholder="Enter tags separated by commas"
                    variant="outlined"
                    class="mb-4"
                  />
                  
                  <v-textarea
                    v-model="projectData.notes"
                    label="Additional Notes"
                    placeholder="Any additional notes or requirements"
                    variant="outlined"
                    rows="4"
                    class="mb-6"
                  />
                </v-form>
              </v-col>
              
              <v-col cols="12" md="4">
                <v-card elevation="0" class="pa-4 border rounded-lg">
                  <h4 class="text-subtitle-1 font-weight-medium mb-3">Project Preview</h4>
                  <div class="project-preview">
                    <h5 class="text-subtitle-2 font-weight-medium mb-2">{{ projectData.name || 'Project Name' }}</h5>
                    <p class="text-caption text-medium-emphasis mb-3">{{ projectData.description || 'No description' }}</p>
                    
                    <div class="preview-stats">
                      <div class="stat-item">
                        <span class="stat-label">Stages:</span>
                        <span class="stat-value">{{ projectData.departments.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Team:</span>
                        <span class="stat-value">{{ projectData.roles.length }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Type:</span>
                        <span class="stat-value">{{ projectData.type || 'Not set' }}</span>
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Navigation Footer -->
        <div class="navigation-footer">
          <div class="d-flex justify-space-between align-center">
            <v-btn 
              v-if="currentStep !== 'foundation'"
              variant="text" 
              @click="previousStep"
              :disabled="saving"
            >
              <v-icon class="mr-2">mdi-arrow-left</v-icon>
              Back
            </v-btn>
            <div v-else></div>
            
            <div class="d-flex gap-3">
              <v-btn 
                v-if="currentStep !== 'settings'"
                variant="text" 
                @click="nextStep"
                :disabled="!canProceedToNext || saving"
              >
                Skip
              </v-btn>
              
              <v-btn 
                v-if="currentStep !== 'settings'"
                color="primary" 
                @click="nextStep"
                :disabled="!canProceedToNext || saving"
                :loading="saving"
              >
                Save & Continue
              </v-btn>
              
              <v-btn 
                v-if="currentStep === 'settings'"
                color="primary" 
                @click="createProject"
                :disabled="!canCreateProject || saving"
                :loading="saving"
                size="large"
              >
                Create Project
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@clerk/vue';
import { connectedWallet } from '@/stores/walletStore';
import { projectApi } from '@/services/projectApi';

const router = useRouter();
const { user } = useUser();

// Type definitions for better TypeScript support
interface Department {
  name: string;
  type: string;
  description: string;
  order: number;
  isVisible: boolean;
}

interface Role {
  userEmail: string;
  role: string;
  userId?: string;
  departmentId: number | null;
}

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    departments: Department[];
    roles: Role[];
    tags: string[];
  };
}

interface ProjectDraft {
  id: string;
  data: any;
  updatedAt: string;
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
  type: '' as 'PROGRESSIVE' | 'PARALLEL',
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  budgetRange: '',
  startDate: '',
  endDate: '',
  isPublic: false,
  allowGuests: false,
  tags: '',
  notes: '',
  departments: [] as Department[],
  roles: [] as Role[]
});

// Form validation
const foundationValid = ref(false);
const settingsValid = ref(false);

// Department select options for roles
const departmentOptions = computed(() =>
  projectData.departments.map((dept, index) => ({ title: dept.name || `Department ${index + 1}`, value: index }))
);

// API state
const loading = ref(false);
const saving = ref(false);
const submitting = ref(false);
const error = ref('');
const success = ref('');

// Data from APIs
const configData = ref<any>(null);
const projectTemplates = ref<ProjectTemplate[]>([]);
const selectedTemplate = ref<ProjectTemplate | null>(null);
const currentDraft = ref<ProjectDraft | null>(null);
const userPermissions = ref<any>(null);

// Form options (will be populated from API)
const projectTypes = ref<Array<{title: string, value: string}>>([]);
const departmentTypes = ref<Array<{title: string, value: string}>>([]);
const roleTypes = ref<Array<{title: string, value: string}>>([]);
const priorityLevels = ref<Array<{title: string, value: string}>>([]);
const budgetRanges = ref<Array<{title: string, value: string}>>([]);

// API base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Computed properties
const canProceedToNext = computed(() => {
  switch (currentStep.value) {
    case 'foundation':
      return projectData.name && projectData.type && projectData.description && projectData.startDate && projectData.endDate;
    case 'departments':
      return projectData.departments.length > 0;
    case 'team':
      return projectData.roles.length > 0 && projectData.roles.every(r => r.role === 'PROJECT_OWNER' ? true : r.departmentId !== null);
    default:
      return true;
  }
});

const canCreateProject = computed(() => {
  return projectData.name && 
         projectData.type && 
         projectData.description &&
         projectData.startDate &&
         projectData.endDate &&
         projectData.departments.length > 0 &&
         projectData.roles.length > 0 &&
         projectData.roles.every(r => r.role === 'PROJECT_OWNER' ? true : r.departmentId !== null) &&
         projectData.budgetRange &&
         projectData.priority &&
         projectData.tags &&
         projectData.notes;
});

const hasDraft = computed(() => !!currentDraft.value);
const draft = computed(() => currentDraft.value?.data);

// API Functions
const fetchConfigData = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/config/enums`);
    if (response.ok) {
      const data = await response.json();
      configData.value = data;
      
      // Populate form options
      projectTypes.value = data.projectTypes?.map((type: any) => ({
        title: type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: type
      })) || [];
      
      departmentTypes.value = data.departmentTypes?.map((type: any) => ({
        title: type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: type
      })) || [];
      
      roleTypes.value = data.roles?.map((role: any) => ({
        title: role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: role
      })) || [];
      
      priorityLevels.value = data.priorities?.map((priority: any) => ({
        title: priority.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        value: priority
      })) || [];
    }
  } catch (err) {
    console.error('Failed to fetch config data:', err);
  }
};

const fetchBudgetRanges = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/config/budget-ranges`);
    if (response.ok) {
      const data = await response.json();
      budgetRanges.value = data.ranges?.map((range: string) => ({
        title: range,
        value: range
      })) || [];
    }
  } catch (err) {
    console.error('Failed to fetch budget ranges:', err);
  }
};

const fetchProjectTemplates = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/project-templates`);
    if (response.ok) {
      const data = await response.json();
      projectTemplates.value = data;
    }
  } catch (err) {
    console.error('Failed to fetch project templates:', err);
  }
};

const fetchUserPermissions = async () => {
  if (!user.value?.id) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/permissions?resource=project&action=create`);
    if (response.ok) {
      const data = await response.json();
      userPermissions.value = data;
    }
  } catch (err) {
    console.error('Failed to fetch user permissions:', err);
  }
};

const validateProjectName = async (name: string) => {
  if (!name) return { available: true };
  
  try {
    const response = await fetch(`${API_BASE}/api/projects/validate-name?name=${encodeURIComponent(name)}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.error('Failed to validate project name:', err);
  }
  return { available: true };
};

const searchTags = async (query: string) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/tags/suggest?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.suggestions || [];
    }
  } catch (err) {
    console.error('Failed to search tags:', err);
  }
  return [];
};

const searchUsers = async (query: string) => {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/users/search?query=${encodeURIComponent(query)}`);
    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
  } catch (err) {
    console.error('Failed to search users:', err);
  }
  return [];
};

const resolveUserEmails = async (emails: string[]) => {
  if (emails.length === 0) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/users/resolve-by-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails })
    });
    if (response.ok) {
      const data = await response.json();
      return data.resolutions || [];
    }
  } catch (err) {
    console.error('Failed to resolve user emails:', err);
  }
  return [];
};

// Draft Management
const saveDraft = async () => {
  if (!user.value?.id) return;
  
  try {
    saving.value = true;
    const draftData = {
      userId: user.value.id,
      data: projectData,
      step: currentStep.value
    };
    
    if (currentDraft.value) {
      // Update existing draft
      const response = await fetch(`${API_BASE}/api/project-drafts/${currentDraft.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });
      if (response.ok) {
        success.value = 'Draft saved successfully!';
        setTimeout(() => success.value = '', 3000);
      }
    } else {
      // Create new draft
      const response = await fetch(`${API_BASE}/api/project-drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftData)
      });
      if (response.ok) {
        const data = await response.json();
        currentDraft.value = data.draft;
        success.value = 'Draft created successfully!';
        setTimeout(() => success.value = '', 3000);
      }
    }
  } catch (err) {
    console.error('Failed to save draft:', err);
    error.value = 'Failed to save draft';
    setTimeout(() => error.value = '', 5000);
  } finally {
    saving.value = false;
  }
};

const loadDraft = async () => {
  if (!currentDraft.value) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/project-drafts/${currentDraft.value.id}`);
    if (response.ok) {
      const data = await response.json();
      Object.assign(projectData, data.draft.data);
      currentStep.value = data.draft.step || 'foundation';
      currentDraft.value = data.draft;
      success.value = 'Draft loaded successfully!';
      setTimeout(() => success.value = '', 3000);
    }
  } catch (err) {
    console.error('Failed to load draft:', err);
    error.value = 'Failed to load draft';
    setTimeout(() => error.value = '', 5000);
  }
};

const clearDraft = () => {
  if (currentDraft.value) {
    if (confirm('Are you sure you want to clear this draft? This action cannot be undone.')) {
      fetch(`${API_BASE}/api/project-drafts/${currentDraft.value.id}`, {
        method: 'DELETE'
      })
      .then(response => {
        if (response.ok) {
          currentDraft.value = null;
          success.value = 'Draft cleared successfully!';
          setTimeout(() => success.value = '', 3000);
        } else {
          throw new Error('Failed to clear draft');
        }
      })
      .catch(err => {
        console.error('Failed to clear draft:', err);
        error.value = 'Failed to clear draft';
        setTimeout(() => error.value = '', 5000);
      });
    }
  }
};

// Template Management
const applyTemplate = async (template: ProjectTemplate) => {
  try {
    const response = await fetch(`${API_BASE}/api/project-templates/${template.id}`);
    if (response.ok) {
      const data = await response.json();
      const structure = data.template.structure;
      
      // Apply template data
      if (structure.departments) {
        projectData.departments = structure.departments.map((dept: any, index: number) => ({
          ...dept,
          order: index,
          isVisible: true // Ensure visibility is true for template departments
        }));
      }
      
      if (structure.roles) {
        projectData.roles = structure.roles;
      }
      
      if (structure.tags) {
        projectData.tags = structure.tags.join(', ');
      }
      
      selectedTemplate.value = template;
      success.value = `Template "${template.name}" applied successfully!`;
      setTimeout(() => success.value = '', 3000);
    }
  } catch (err) {
    console.error('Failed to apply template:', err);
    error.value = 'Failed to apply template';
    setTimeout(() => error.value = '', 5000);
  }
};

// Project Validation
const validateProject = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/projects/precheck`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.valid) {
        return { valid: true, warnings: data.warnings || [] };
      } else {
        return { valid: false, errors: data.errors || [] };
      }
    }
  } catch (err) {
    console.error('Failed to validate project:', err);
  }
  return { valid: false, errors: ['Validation failed'] };
};

// Navigation functions
const nextStep = async () => {
  const currentIndex = creationSteps.value.findIndex(step => step.id === currentStep.value);
  if (currentIndex < creationSteps.value.length - 1) {
    // Save draft before proceeding
    await saveDraft();
    
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
    description: '',
    order: projectData.departments.length,
    isVisible: true
  });
};

const removeDepartment = (index: number) => {
  projectData.departments.splice(index, 1);
  // Reorder remaining departments
  projectData.departments.forEach((dept, idx) => {
    dept.order = idx;
  });
};

// Role management
const addRole = () => {
  projectData.roles.push({
    userEmail: '',
    role: 'EMPLOYEE',
    departmentId: projectData.departments.length > 0 ? 0 : null
  });
};

const removeRole = (index: number) => {
  projectData.roles.splice(index, 1);
};

// Ensure creator is PROJECT_OWNER
const ensureOwnerRole = () => {
  const ownerExists = projectData.roles.some(r => r.role === 'PROJECT_OWNER');
  if (!ownerExists && user.value?.id) {
    const creatorEmail = user.value.emailAddresses?.[0]?.emailAddress || '';
    projectData.roles.unshift({
      userEmail: creatorEmail,
      userId: user.value.id,
      role: 'PROJECT_OWNER',
      departmentId: null // Project owner has access to ALL departments automatically
    });
  }
};

// Drag and drop functionality
const draggedDept = ref<number | null>(null);

const startDrag = (index: number) => {
  draggedDept.value = index;
};

const onDrop = (index: number) => {
  if (draggedDept.value === null) return;

  const draggedDepartment = projectData.departments[draggedDept.value];
  const targetDepartment = projectData.departments[index];

  // Swap orders
  const tempOrder = draggedDepartment.order;
  draggedDepartment.order = targetDepartment.order;
  targetDepartment.order = tempOrder;

  // Re-order departments based on new order
  projectData.departments.forEach((dept, idx) => {
    dept.order = idx;
  });

  draggedDept.value = null;
};

// Utility functions
const formatDate = (timestamp: string) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch (e) {
    return timestamp;
  }
};

// Project creation
const createProject = async () => {
  if (!user.value?.id) {
    error.value = 'User not authenticated';
    return;
  }

  if (!connectedWallet.value) {
    error.value = 'Wallet address is required. Please connect your wallet.';
    setTimeout(() => error.value = '', 5000);
    return;
  }
  
  // Validate project first
  const validation = await validateProject();
  if (!validation.valid) {
    error.value = `Validation failed: ${validation.errors.join(', ')}`;
    setTimeout(() => error.value = '', 5000);
    return;
  }

  // Ensure owner role
  ensureOwnerRole();
  
  submitting.value = true;
  error.value = '';
  
  try {
    // Prepare project data for API - FIXED to match backend requirements
    const projectPayload = {
      name: projectData.name,
      description: projectData.description,
      type: projectData.type,
      priority: projectData.priority,
      budgetRange: projectData.budgetRange,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      ownerId: user.value.id, // Required by backend
      userId: user.value.id, // Required by backend
      walletAddress: connectedWallet.value, // Required by backend
      departments: projectData.departments.map((dept, index) => ({
        name: dept.name,
        type: dept.type as 'MAJOR' | 'MINOR',
        description: dept.description,
        order: dept.order,
        isVisible: dept.isVisible
      })),
      roles: projectData.roles.map(role => ({
        userEmail: role.userEmail,
        role: role.role as 'PROJECT_OWNER' | 'PROJECT_MANAGER' | 'EMPLOYEE',
        departmentId: role.departmentId // null for PROJECT_OWNER means access to all
      })),
      tags: projectData.tags ? projectData.tags.split(',').map(tag => tag.trim()) : []
    };
    
    // Log key fields to ensure userId and wallet are present at send-time
    console.log('[CreateProject] Sending project payload meta:', {
      userId: projectPayload.userId,
      walletAddress: projectPayload.walletAddress,
      name: projectPayload.name,
      departmentsCount: projectPayload.departments.length,
      rolesCount: projectPayload.roles.length
    });
    // Optional: log first role and first department shapes for debugging
    if (projectPayload.roles[0]) {
      console.log('[CreateProject] first role:', {
        userEmail: projectPayload.roles[0].userEmail,
        role: projectPayload.roles[0].role,
        departmentId: projectPayload.roles[0].departmentId
      });
    }
    if (projectPayload.departments[0]) {
      console.log('[CreateProject] first department:', projectPayload.departments[0]);
    }
    
    // Fix departmentId type conversion - convert number to string
    const fixedPayload = {
      ...projectPayload,
      roles: projectPayload.roles.map(role => ({
        ...role,
        departmentId: role.departmentId !== null ? String(role.departmentId) : null
      }))
    };
    
    console.log('[CreateProject] fixedPayload meta:', {
      rolesCount: fixedPayload.roles.length,
      firstRoleDeptIdType: typeof fixedPayload.roles[0]?.departmentId
    });
    const response = await projectApi.createProject(fixedPayload);
    
    if (response) {
      console.log('Project created:', response);
      // Clear draft if exists
      if (currentDraft.value) {
        try {
          await fetch(`${API_BASE}/api/project-drafts/${currentDraft.value.id}`, {
            method: 'DELETE'
          });
        } catch (err) {
          console.warn('Failed to delete draft:', err);
        }
      }
      
      success.value = 'Project created successfully!';
      setTimeout(() => {
        router.push('/projects');
      }, 1500);
    } else {
      throw new Error('Failed to create project');
    }
  } catch (err) {
    console.error('[CreateProject] Error creating project:', err);
    // If we have server details, surface them
    const serverMsg = (err as any)?.response?.data?.error || (err as any)?.response?.data?.message;
    error.value = serverMsg || (err instanceof Error ? err.message : 'Failed to create project');
    setTimeout(() => error.value = '', 5000);
  } finally {
    submitting.value = false;
  }
};

// Auto-save draft when data changes
watch(projectData, () => {
  if (Object.keys(projectData).some(key => projectData[key as keyof typeof projectData])) {
    // Debounce auto-save
    setTimeout(saveDraft, 2000);
  }
}, { deep: true });

// Watch for step changes to ensure owner role and default department
watch(currentStep, async (newStep) => {
  if (newStep === 'team') {
    await ensureOwnerRole();
    // Ensure default department for new roles if no departments exist
    if (projectData.departments.length === 0) {
      addDepartment();
    }
  }
});

// Watch for department changes to ensure default department for new roles
watch(projectData.departments, async (newDepartments) => {
  if (currentStep.value === 'team') {
    // Ensure default department for new roles if no departments exist
    if (newDepartments.length === 0) {
      addDepartment();
    }
  }
});

// Initialize data
onMounted(async () => {
  loading.value = true;
  
  try {
    // Fetch all configuration data in parallel
    await Promise.all([
      fetchConfigData(),
      fetchBudgetRanges(),
      fetchProjectTemplates(),
      fetchUserPermissions()
    ]);
    
    // Add sample data for testing
    addDepartment();
    addRole();
    
  } catch (err) {
    console.error('Failed to initialize:', err);
    error.value = 'Failed to load configuration data';
  } finally {
    loading.value = false;
  }
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

.step-content-container {
  margin-top: 24px;
}

.step-content {
  animation: fadeIn 0.3s ease-in-out;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.step-header {
  margin-bottom: 24px;
}

.step-header h2 {
  color: rgb(var(--v-theme-on-surface));
}

.step-header p {
  color: rgb(var(--v-theme-on-surface-variant));
}

/* Progress Steps */
.progress-container {
  background: white;
  padding: 24px 32px;
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
  position: relative;
}

.progress-line {
  position: absolute;
  left: 32px;
  top: 50%;
  width: calc(100% - 64px);
  height: 2px;
  background: rgb(var(--v-theme-outline-variant));
  transform: translateY(-50%);
  z-index: 1;
}

.progress-steps {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 0 auto;
}

.progress-step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  transition: all 0.3s ease;
  background: white;
  color: rgb(var(--v-theme-on-surface-variant));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgb(var(--v-theme-outline-variant));
  margin-bottom: 8px;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100px;
  height: 2px;
  background: rgb(var(--v-theme-outline-variant));
  transform: translateX(-50%);
}

.step-number.completed {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-color: rgb(var(--v-theme-primary));
}

.step-number.current {
  background: rgb(var(--v-theme-primary));
  color: white;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2);
}

.step-number.pending {
  background: white;
  color: rgb(var(--v-theme-on-surface-variant));
  border-color: rgb(var(--v-theme-outline-variant));
}

.step-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  text-align: center;
  white-space: nowrap;
}

.departments-container {
  margin-top: 24px;
}

.departments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.department-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  overflow: hidden;
}

.department-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.department-card.dragging {
  opacity: 0.5;
  transform: scale(0.98);
}

.department-header {
  padding: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.department-header .v-field {
  margin-bottom: 12px;
}

.department-header .v-field:last-child {
  margin-bottom: 0;
}

.roles-container {
  margin-top: 24px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.role-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  overflow: hidden;
}

.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.role-header {
  padding: 16px;
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.role-header .v-field {
  margin-bottom: 12px;
}

.role-header .v-field:last-child {
  margin-bottom: 0;
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

.project-preview h5 {
  color: rgb(var(--v-theme-on-surface));
}

.project-preview p {
  color: rgb(var(--v-theme-on-surface-variant));
}

.preview-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.875rem;
}

.stat-value {
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
  font-size: 1rem;
}

.navigation-footer {
  background: white;
  padding: 24px 32px;
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
  margin-top: 32px;
}

.border {
  border: 1px solid rgb(var(--v-theme-outline-variant));
}

.border-b {
  border-bottom: 1px solid rgb(var(--v-theme-outline-variant));
}

.border-t {
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
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
  
  .roles-grid {
    grid-template-columns: 1fr;
  }
  
  .step-label {
    display: none;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  z-index: 1000;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
