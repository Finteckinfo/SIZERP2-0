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
            <v-card elevation="0" class="pa-4">
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
        <v-row v-if="currentDraft" class="mb-6">
          <v-col cols="12">
            <v-card elevation="0" color="info" class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon color="white" class="mr-3">mdi-content-save</v-icon>
                  <span class="text-white">Draft saved - {{ new Date(currentDraft.updatedAt).toLocaleString() }}</span>
                </div>
                <v-btn 
                  variant="text" 
                  color="white"
                  @click="currentDraft = null"
                >
                  Clear Draft
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Step 1: Project Foundation -->
        <div v-if="currentStep === 'foundation'" class="step-content">
          <v-row>
            <v-col cols="12" md="8">
              <v-card elevation="0" class="pa-6">
                <h3 class="text-h5 font-weight-bold mb-6">Project Foundation</h3>
                
                <v-form @submit.prevent="nextStep">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.name"
                        label="Project Name"
                        variant="outlined"
                        required
                        :rules="[v => !!v || 'Project name is required']"
                        @blur="validateProjectName(projectData.name)"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="projectData.type"
                        label="Project Type"
                        variant="outlined"
                        required
                        :items="projectTypes"
                        item-title="title"
                        item-value="value"
                        :rules="[v => !!v || 'Project type is required']"
                      />
                    </v-col>
                    
                    <v-col cols="12">
                      <v-textarea
                        v-model="projectData.description"
                        label="Project Description"
                        variant="outlined"
                        required
                        rows="4"
                        :rules="[v => !!v || 'Project description is required']"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card elevation="0" class="pa-4" color="grey-lighten-5">
                <h4 class="text-h6 font-weight-medium mb-4">Quick Tips</h4>
                <ul class="text-body-2">
                  <li class="mb-2">Choose a clear, descriptive name</li>
                  <li class="mb-2">Select the appropriate project type</li>
                  <li class="mb-2">Write a comprehensive description</li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 2: Department Structure -->
        <div v-if="currentStep === 'departments'" class="step-content">
          <v-row>
            <v-col cols="12" md="8">
              <v-card elevation="0" class="pa-6">
                <div class="d-flex align-center justify-space-between mb-6">
                  <h3 class="text-h5 font-weight-bold">Department Structure</h3>
                  <v-btn 
                    color="primary" 
                    variant="flat"
                    @click="addDepartment"
                    :disabled="projectData.departments.length >= 10"
                  >
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    Add Department
                  </v-btn>
                </div>
                
                <div v-if="projectData.departments.length === 0" class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-domain</v-icon>
                  <p class="text-h6 text-grey mt-4">No departments added yet</p>
                  <p class="text-body-2 text-grey">Start building your project structure by adding departments</p>
                </div>
                
                <div v-else class="departments-grid">
                  <v-card
                    v-for="(dept, index) in projectData.departments"
                    :key="index"
                    elevation="2"
                    class="department-card pa-4"
                    draggable="true"
                    @dragstart="dragStart(index)"
                    @drop="drop(index)"
                    @dragover.prevent
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
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
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                    
                    <v-text-field
                      v-model="dept.name"
                      label="Department Name"
                      variant="outlined"
                      density="compact"
                      required
                      :rules="[v => !!v || 'Department name is required']"
                    />
                    
                    <v-select
                      v-model="dept.type"
                      label="Type"
                      variant="outlined"
                      density="compact"
                      required
                      :items="departmentTypes"
                      item-title="title"
                      item-value="value"
                      class="mt-3"
                    />
                    
                    <v-textarea
                      v-model="dept.description"
                      label="Description"
                      variant="outlined"
                      density="compact"
                      rows="2"
                      class="mt-3"
                    />
                  </v-card>
                </div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card elevation="0" class="pa-4" color="grey-lighten-5">
                <h4 class="text-h6 font-weight-medium mb-4">Department Tips</h4>
                <ul class="text-body-2">
                  <li class="mb-2">Major departments handle core functions</li>
                  <li class="mb-2">Minor departments support major ones</li>
                  <li class="mb-2">Drag and drop to reorder</li>
                  <li class="mb-2">Keep descriptions concise</li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 3: Team & Roles -->
        <div v-if="currentStep === 'team'" class="step-content">
          <v-row>
            <v-col cols="12" md="8">
              <v-card elevation="0" class="pa-6">
                <div class="d-flex align-center justify-space-between mb-6">
                  <h3 class="text-h5 font-weight-bold">Team & Roles</h3>
                  <v-btn 
                    color="primary" 
                    variant="flat"
                    @click="addRole"
                    :disabled="projectData.roles.length >= 20"
                  >
                    <v-icon class="mr-2">mdi-plus</v-icon>
                    Add Team Member
                  </v-btn>
                </div>
                
                <div v-if="projectData.roles.length === 0" class="text-center py-8">
                  <v-icon size="64" color="grey-lighten-1">mdi-account-group</v-icon>
                  <p class="text-h6 text-grey mt-4">No team members added yet</p>
                  <p class="text-body-2 text-grey">Start building your team by adding members and roles</p>
                </div>
                
                <div v-else class="roles-grid">
                  <v-card
                    v-for="(role, index) in projectData.roles"
                    :key="index"
                    elevation="2"
                    class="role-card pa-4"
                  >
                    <div class="d-flex align-center justify-space-between mb-3">
                      <v-chip 
                        :color="role.role === 'PROJECT_OWNER' ? 'error' : role.role === 'PROJECT_MANAGER' ? 'warning' : 'success'"
                        size="small"
                      >
                        {{ role.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                      </v-chip>
                      <v-btn 
                        icon 
                        size="small" 
                        color="error"
                        variant="text"
                        @click="removeRole(index)"
                      >
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </div>
                    
                    <v-text-field
                      v-model="role.userEmail"
                      label="Email Address"
                      variant="outlined"
                      density="compact"
                      required
                      type="email"
                      :rules="[
                        v => !!v || 'Email is required',
                        v => /.+@.+\..+/.test(v) || 'Valid email required'
                      ]"
                    />
                    
                    <v-select
                      v-model="role.role"
                      label="Role"
                      variant="outlined"
                      density="compact"
                      required
                      :items="roleTypes"
                      item-title="title"
                      item-value="value"
                      class="mt-3"
                    />
                  </v-card>
                </div>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card elevation="0" class="pa-4" color="grey-lighten-5">
                <h4 class="text-h6 font-weight-medium mb-4">Team Tips</h4>
                <ul class="text-body-2">
                  <li class="mb-2">Project Owner has full control</li>
                  <li class="mb-2">Project Manager oversees execution</li>
                  <li class="mb-2">Employees contribute to tasks</li>
                  <li class="mb-2">Use valid email addresses</li>
                </ul>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Step 4: Project Settings -->
        <div v-if="currentStep === 'settings'" class="step-content">
          <v-row>
            <v-col cols="12" md="8">
              <v-card elevation="0" class="pa-6">
                <h3 class="text-h5 font-weight-bold mb-6">Project Settings</h3>
                
                <v-form @submit.prevent="createProject">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.startDate"
                        label="Start Date"
                        variant="outlined"
                        required
                        type="date"
                        :rules="[v => !!v || 'Start date is required']"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="projectData.endDate"
                        label="End Date"
                        variant="outlined"
                        required
                        type="date"
                        :rules="[
                          v => !!v || 'End date is required',
                          v => !projectData.startDate || v >= projectData.startDate || 'End date must be after start date'
                        ]"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="projectData.priority"
                        label="Priority Level"
                        variant="outlined"
                        required
                        :items="priorityLevels"
                        item-title="title"
                        item-value="value"
                        :rules="[v => !!v || 'Priority is required']"
                      />
                    </v-col>
                    
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="projectData.budgetRange"
                        label="Budget Range"
                        variant="outlined"
                        required
                        :items="budgetRanges"
                        item-title="title"
                        item-value="value"
                        :rules="[v => !!v || 'Budget range is required']"
                      />
                    </v-col>
                    
                    <v-col cols="12">
                      <v-combobox
                        v-model="projectData.tags"
                        label="Project Tags"
                        variant="outlined"
                        multiple
                        chips
                        closable-chips
                        :search-input.sync="searchTags"
                        :items="[]"
                        placeholder="Type to add tags..."
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="4">
              <v-card elevation="0" class="pa-4" color="grey-lighten-5">
                <h4 class="text-h6 font-weight-medium mb-4">Settings Tips</h4>
                <ul class="text-body-2">
                  <li class="mb-2">Set realistic timelines</li>
                  <li class="mb-2">Choose appropriate priority</li>
                  <li class="mb-2">Estimate budget accurately</li>
                  <li class="mb-2">Add relevant tags for organization</li>
                </ul>
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
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUser } from '@clerk/vue';

const router = useRouter();
const { user } = useUser();

// Type definitions for better TypeScript support
interface Department {
  name: string;
  type: string;
  description: string;
  order: number;
}

interface Role {
  userEmail: string;
  role: string;
  userId?: string;
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
  type: '',
  startDate: '',
  endDate: '',
  priority: '',
  budgetRange: '',
  tags: [] as string[],
  departments: [] as Department[],
  roles: [] as Role[]
});

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

const loadDraft = async (draftId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/project-drafts/${draftId}`);
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
          order: index
        }));
      }
      
      if (structure.roles) {
        projectData.roles = structure.roles;
      }
      
      if (structure.tags) {
        projectData.tags = structure.tags;
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
    order: projectData.departments.length
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
  if (!user.value?.id) {
    error.value = 'User not authenticated';
    return;
  }
  
  // Validate project first
  const validation = await validateProject();
  if (!validation.valid) {
    error.value = `Validation failed: ${validation.errors.join(', ')}`;
    setTimeout(() => error.value = '', 5000);
    return;
  }
  
  submitting.value = true;
  error.value = '';
  
  try {
    // Prepare project data
    const projectPayload = {
      ...projectData,
      departments: projectData.departments.map((dept, index) => ({
        name: dept.name,
        type: dept.type,
        description: dept.description,
        order: index
      })),
      roles: projectData.roles.map(role => ({
        userEmail: role.userEmail,
        role: role.role
      }))
    };
    
    const response = await fetch(`${API_BASE}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectPayload)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Project created:', data);
      
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
        router.push('/dashboard/default');
      }, 2000);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create project');
    }
  } catch (err) {
    console.error('Error creating project:', err);
    error.value = err instanceof Error ? err.message : 'Failed to create project';
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
  margin-top: 16px;
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.department-card,
.role-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.department-card:hover,
.role-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.department-card {
  border-left: 4px solid var(--v-primary-base);
}

.role-card {
  border-left: 4px solid var(--v-info-base);
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
