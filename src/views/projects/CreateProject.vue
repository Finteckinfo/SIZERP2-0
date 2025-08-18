<template>
  <div class="create-project-page">
    <v-container fluid>
      <!-- Page Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h3 font-weight-bold mb-2">Create New Project</h1>
              <p class="text-body-1 text-medium-emphasis">
                Start a new project and invite team members to collaborate
              </p>
            </div>
            <v-btn
              color="secondary"
              variant="outlined"
              prepend-icon="mdi-arrow-left"
              @click="$router.push('/dashboard/default')"
            >
              Back to Dashboard
            </v-btn>
          </div>
        </v-col>
      </v-row>

      <!-- Project Creation Form -->
      <v-row>
        <v-col cols="12" lg="8">
          <v-card elevation="0" class="pa-6">
            <v-card-title class="text-h5 font-weight-medium mb-4">
              Project Details
            </v-card-title>
            
            <v-form @submit.prevent="handleSubmit">
              <v-row>
                <!-- Project Name -->
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="formData.name"
                    label="Project Name"
                    placeholder="Enter project name"
                    variant="outlined"
                    :rules="[v => !!v || 'Project name is required']"
                    required
                  />
                </v-col>

                <!-- Project Type -->
                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.type"
                    label="Project Type"
                    :items="projectTypes"
                    variant="outlined"
                    :rules="[v => !!v || 'Project type is required']"
                    required
                  />
                </v-col>

                <!-- Description -->
                <v-col cols="12">
                  <v-textarea
                    v-model="formData.description"
                    label="Project Description"
                    placeholder="Describe your project goals and objectives"
                    variant="outlined"
                    rows="4"
                    :rules="[v => !!v || 'Project description is required']"
                    required
                  />
                </v-col>

                <!-- Department Count -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.departmentCount"
                    label="Number of Departments"
                    type="number"
                    variant="outlined"
                    min="1"
                    max="10"
                    :rules="[
                      v => !!v || 'Department count is required',
                      v => v >= 1 || 'Must have at least 1 department',
                      v => v <= 10 || 'Maximum 10 departments allowed'
                    ]"
                    required
                  />
                </v-col>

                <!-- Estimated Duration -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="formData.estimatedDuration"
                    label="Estimated Duration (weeks)"
                    type="number"
                    variant="outlined"
                    min="1"
                    max="52"
                    :rules="[
                      v => !!v || 'Duration is required',
                      v => v >= 1 || 'Must be at least 1 week',
                      v => v <= 52 || 'Maximum 52 weeks allowed'
                    ]"
                    required
                  />
                </v-col>

                <!-- Budget Range -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.budgetRange"
                    label="Budget Range"
                    :items="budgetRanges"
                    variant="outlined"
                    :rules="[v => !!v || 'Budget range is required']"
                    required
                  />
                </v-col>

                <!-- Priority Level -->
                <v-col cols="12" md="6">
                  <v-select
                    v-model="formData.priority"
                    label="Priority Level"
                    :items="priorityLevels"
                    variant="outlined"
                    :rules="[v => !!v || 'Priority level is required']"
                    required
                  />
                </v-col>

                <!-- Start Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.startDate"
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    :rules="[v => !!v || 'Start date is required']"
                    required
                  />
                </v-col>

                <!-- End Date -->
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="formData.endDate"
                    label="End Date"
                    type="date"
                    variant="outlined"
                    :rules="[v => !!v || 'End date is required']"
                    required
                  />
                </v-col>

                <!-- Tags -->
                <v-col cols="12">
                  <v-combobox
                    v-model="formData.tags"
                    label="Project Tags"
                    placeholder="Add tags to categorize your project"
                    variant="outlined"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>

                <!-- Submit Button -->
                <v-col cols="12" class="pt-6">
                  <div class="d-flex gap-4">
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                      :loading="submitting"
                      :disabled="submitting"
                    >
                      Create Project
                    </v-btn>
                    <v-btn
                      color="secondary"
                      variant="outlined"
                      size="large"
                      @click="resetForm"
                    >
                      Reset Form
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-form>
          </v-card>
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" lg="4">
          <v-card elevation="0" class="pa-4">
            <v-card-title class="text-h6 font-weight-medium mb-4">
              Project Guidelines
            </v-card-title>
            
            <div class="space-y-4">
              <div class="d-flex align-start">
                <v-icon color="info" class="mr-3 mt-1">mdi-information</v-icon>
                <div>
                  <h6 class="text-subtitle-2 font-weight-medium mb-1">Project Name</h6>
                  <p class="text-caption text-medium-emphasis">
                    Choose a clear, descriptive name that reflects the project's purpose
                  </p>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon color="info" class="mr-3 mt-1">mdi-information</v-icon>
                <div>
                  <h6 class="text-subtitle-2 font-weight-medium mb-1">Project Type</h6>
                  <p class="text-caption text-medium-emphasis">
                    Progressive: Sequential phases | Parallel: Multiple simultaneous tasks
                  </p>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon color="info" class="mr-3 mt-1">mdi-information</v-icon>
                <div>
                  <h6 class="text-subtitle-2 font-weight-medium mb-1">Departments</h6>
                  <p class="text-caption text-medium-emphasis">
                    Plan your organizational structure before creating the project
                  </p>
                </div>
              </div>

              <div class="d-flex align-start">
                <v-icon color="info" class="mr-3 mt-1">mdi-information</v-icon>
                <div>
                  <h6 class="text-subtitle-2 font-weight-medium mb-1">Timeline</h6>
                  <p class="text-caption text-medium-emphasis">
                    Set realistic start and end dates for better project planning
                  </p>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Form data
const formData = reactive({
  name: '',
  type: '',
  description: '',
  departmentCount: 1,
  estimatedDuration: 4,
  budgetRange: '',
  priority: '',
  startDate: '',
  endDate: '',
  tags: []
});

// Form options
const projectTypes = [
  { title: 'Progressive', value: 'PROGRESSIVE' },
  { title: 'Parallel', value: 'PARALLEL' }
];

const budgetRanges = [
  { title: 'Under $1K', value: 'UNDER_1K' },
  { title: '$1K - $5K', value: '1K_TO_5K' },
  { title: '$5K - $10K', value: '5K_TO_10K' },
  { title: '$10K - $25K', value: '10K_TO_25K' },
  { title: '$25K - $50K', value: '25K_TO_50K' },
  { title: 'Over $50K', value: 'OVER_50K' }
];

const priorityLevels = [
  { title: 'Low', value: 'LOW' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'High', value: 'HIGH' },
  { title: 'Critical', value: 'CRITICAL' }
];

// Form state
const submitting = ref(false);

// Form submission
const handleSubmit = async () => {
  submitting.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    console.log('Project created:', formData);
    
    // Redirect to dashboard
    router.push('/dashboard/default');
  } catch (error) {
    console.error('Error creating project:', error);
  } finally {
    submitting.value = false;
  }
};

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    name: '',
    type: '',
    description: '',
    departmentCount: 1,
    estimatedDuration: 4,
    budgetRange: '',
    priority: '',
    startDate: '',
    endDate: '',
    tags: []
  });
};
</script>

<style scoped>
.create-project-page {
  padding: 24px 0;
}

.space-y-4 > * + * {
  margin-top: 16px;
}
</style>
