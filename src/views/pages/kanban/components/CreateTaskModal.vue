<template>
  <v-dialog v-model="localValue" max-width="600" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-3" color="primary">mdi-plus</v-icon>
        Create New Task
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <!-- Task Title -->
            <v-col cols="12">
              <v-text-field
                v-model="newTask.title"
                label="Task Title"
                variant="outlined"
                :rules="[rules.required]"
                hide-details="auto"
                autofocus
              />
            </v-col>

            <!-- Description -->
            <v-col cols="12">
              <v-textarea
                v-model="newTask.description"
                label="Description"
                variant="outlined"
                rows="3"
                hide-details="auto"
              />
            </v-col>

            <!-- Project -->
            <v-col cols="12" md="6">
              <v-select
                v-model="(newTask as any).projectId"
                :items="projectOptions"
                label="Project"
                variant="outlined"
                :rules="[rules.required]"
                hide-details="auto"
                clearable
                @update:model-value="loadProjectDepartments"
              />
            </v-col>

            <!-- Department -->
            <v-col cols="12" md="6">
              <v-select
                v-model="(newTask as any).departmentId"
                :items="departmentOptions"
                label="Department"
                variant="outlined"
                :rules="[rules.required]"
                hide-details="auto"
                :disabled="!newTask.projectId"
              />
            </v-col>

            <!-- Priority -->
            <v-col cols="12" md="6">
              <v-select
                v-model="newTask.priority"
                :items="priorityOptions"
                label="Priority"
                variant="outlined"
                :rules="[rules.required]"
                hide-details="auto"
              >
                <template #item="{ props: itemProps, item }">
                  <v-list-item v-bind="itemProps">
                    <template #prepend>
                      <v-icon :color="getPriorityColor(item.value)">
                        mdi-flag
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Assignee -->
            <v-col cols="12" md="6">
              <v-select
                v-model="newTask.assignedRoleId"
                :items="assigneeOptions"
                label="Assignee"
                variant="outlined"
                hide-details="auto"
                clearable
              />
            </v-col>

            <!-- Status -->
            <v-col cols="12" md="6">
              <v-select
                v-model="newTask.status"
                :items="statusOptions"
                label="Initial Status"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <!-- Due Date -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="newTask.dueDate"
                label="Due Date"
                type="date"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <!-- Estimated Hours -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="newTask.estimatedHours"
                label="Estimated Hours"
                type="number"
                :min="0"
                :step="0.5"
                variant="outlined"
                hide-details="auto"
              />
            </v-col>

            <!-- Progress -->
            <v-col cols="12">
              <div class="progress-section">
                <label class="progress-label">Initial Progress</label>
                <div class="progress-input">
                  <v-slider
                    v-model="newTask.progress"
                    :min="0"
                    :max="100"
                    :step="5"
                    thumb-label
                    hide-details="auto"
                  />
                  <v-text-field
                    v-model.number="newTask.progress"
                    type="number"
                    :min="0"
                    :max="100"
                    suffix="%"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    class="ml-4"
                    style="width: 100px;"
                  />
                </div>
              </div>
            </v-col>

            <!-- Time Tracking -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-clock-outline</v-icon>
                    Time Tracking (Optional)
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="newTask.startDate"
                          label="Start Date"
                          type="date"
                          variant="outlined"
                          hide-details="auto"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="newTask.endDate"
                          label="End Date"
                          type="date"
                          variant="outlined"
                          hide-details="auto"
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-switch
                          v-model="newTask.isAllDay"
                          label="All Day Task"
                          color="primary"
                          hide-details
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>

            <!-- Checklist -->
            <v-col cols="12">
              <v-expansion-panels variant="accordion">
                <v-expansion-panel>
                  <v-expansion-panel-title>
                    <v-icon class="mr-2">mdi-format-list-checks</v-icon>
                    Checklist (Optional)
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="newTask.checklistCount"
                          label="Total Checklist Items"
                          type="number"
                          :min="0"
                          variant="outlined"
                          hide-details="auto"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model.number="newTask.checklistCompleted"
                          label="Completed Items"
                          type="number"
                          :min="0"
                          :max="newTask.checklistCount || 0"
                          variant="outlined"
                          hide-details="auto"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-4">
        <v-btn
          variant="outlined"
          @click="cancel"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          :disabled="!formValid"
          :loading="creating"
          @click="createTask"
        >
          Create Task
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { taskApi } from '@/services/projectApi';
import type { CreateTaskData, KanbanTask } from '../types/kanban';

interface Props {
  modelValue: boolean;
  defaultStatus?: string;
  defaultProject?: string;
  defaultDepartment?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'task-created', task: KanbanTask): void;
}

const props = withDefaults(defineProps<Props>(), {
  defaultStatus: 'PENDING'
});

const emit = defineEmits<Emits>();

// Local state
const localValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formRef = ref();
const formValid = ref(false);
const creating = ref(false);

const newTask = ref({
  title: '',
  description: '',
  projectId: null as string | null,
  departmentId: null as string | null,
  assignedRoleId: undefined as string | undefined,
  priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  status: props.defaultStatus || 'PENDING',
  estimatedHours: undefined as number | undefined,
  dueDate: undefined as string | undefined,
  startDate: undefined as string | undefined,
  endDate: undefined as string | undefined,
  isAllDay: false,
  progress: 0,
  checklistCount: undefined as number | undefined,
  checklistCompleted: undefined as number | undefined
});

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required'
};

// Options
const statusOptions = [
  { title: 'To Do', value: 'PENDING' },
  { title: 'In Progress', value: 'IN_PROGRESS' },
  { title: 'Completed', value: 'COMPLETED' },
  { title: 'Approved', value: 'APPROVED' }
];

const priorityOptions = [
  { title: 'Critical', value: 'CRITICAL' },
  { title: 'High', value: 'HIGH' },
  { title: 'Medium', value: 'MEDIUM' },
  { title: 'Low', value: 'LOW' }
];

const projectOptions = ref([
  // Will be loaded from user's projects
]);

const departmentOptions = ref<Array<{title: string, value: string}>>([
  // Will be loaded based on selected project
]);

const assigneeOptions = ref([
  { title: 'Unassigned', value: null }
  // Will be loaded from project's team members
]);

// Load project departments when project is selected
const loadProjectDepartments = async (projectId: string) => {
  if (!projectId) {
    departmentOptions.value = [];
    return;
  }
  
  try {
    // Load departments for the selected project
    console.log('[CreateTaskModal] Loading departments for project:', projectId);
    // This would use your existing departmentApi.getProjectDepartments(projectId)
    
    // Mock data for now
    departmentOptions.value = [
      { title: 'Development', value: 'dept1' },
      { title: 'Design', value: 'dept2' },
      { title: 'Marketing', value: 'dept3' }
    ];
  } catch (error) {
    console.error('[CreateTaskModal] Failed to load departments:', error);
  }
};

// Methods
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'CRITICAL': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'success';
    default: return 'grey';
  }
};

const createTask = async () => {
  if (!formValid.value) return;
  
  try {
    creating.value = true;
    
    // Validate required fields
    if (!newTask.value.projectId || !newTask.value.departmentId) {
      console.error('[CreateTaskModal] Project and Department are required');
      return;
    }
    
    // Prepare task data
    const taskData: CreateTaskData = {
      title: newTask.value.title,
      description: newTask.value.description,
      departmentId: newTask.value.departmentId,
      assignedRoleId: newTask.value.assignedRoleId,
      priority: newTask.value.priority,
      estimatedHours: newTask.value.estimatedHours,
      dueDate: newTask.value.dueDate,
      startDate: newTask.value.startDate,
      endDate: newTask.value.endDate,
      isAllDay: newTask.value.isAllDay,
      progress: newTask.value.progress,
      checklistCount: newTask.value.checklistCount,
      checklistCompleted: newTask.value.checklistCompleted
    };
    
    console.log('[CreateTaskModal] Creating task:', taskData);
    
    const createdTask = await taskApi.createTask(taskData);
    
    emit('task-created', createdTask as KanbanTask);
    resetForm();
    
  } catch (error: any) {
    console.error('[CreateTaskModal] Failed to create task:', error);
    // You might want to show an error message here
  } finally {
    creating.value = false;
  }
};

const cancel = () => {
  localValue.value = false;
  resetForm();
};

const resetForm = () => {
  newTask.value = {
    title: '',
    description: '',
    projectId: props.defaultProject || null,
    departmentId: props.defaultDepartment || null,
    assignedRoleId: undefined,
    priority: 'MEDIUM',
    status: props.defaultStatus || 'PENDING',
    estimatedHours: undefined,
    dueDate: undefined,
    startDate: undefined,
    endDate: undefined,
    isAllDay: false,
    progress: 0,
    checklistCount: undefined,
    checklistCompleted: undefined
  };
  
  if (formRef.value) {
    formRef.value.resetValidation();
  }
};

// Watch for default values changes
watch(() => [props.defaultStatus, props.defaultProject, props.defaultDepartment], ([status, project, department]) => {
  if (status) newTask.value.status = status;
  if (project) newTask.value.projectId = project;
  if (department) newTask.value.departmentId = department;
});

// Watch for modal close to reset form
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    setTimeout(resetForm, 300); // Delay to allow animation to complete
  }
});
</script>

<style scoped>
.progress-section {
  margin-bottom: 1rem;
}

.progress-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  margin-bottom: 0.75rem;
}

.progress-input {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .progress-input {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .progress-input .v-text-field {
    width: 100% !important;
  }
}
</style>
