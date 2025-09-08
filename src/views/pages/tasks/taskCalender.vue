<template>
  <div class="task-calendar-container">
    <!-- Header with navigation and filters -->
    <CalendarHeader
      :current-view="currentView"
      :current-date="currentDate"
      :selected-project="selectedProject"
      :projects="projects"
      @view-change="handleViewChange"
      @date-change="handleDateChange"
      @project-change="handleProjectChange"
      @create-task="openTaskModal"
    />

    <div class="calendar-content">
      <!-- Sidebar with task list -->
      <div class="sidebar">
        <TaskList
          :tasks="filteredTasks"
          :selected-date="currentDate"
          @task-select="selectTask"
          @task-edit="editTask"
          @task-delete="deleteTask"
        />
      </div>

      <!-- Main calendar view -->
      <div class="calendar-main">
        <CalendarView
          :current-view="currentView"
          :current-date="currentDate"
          :tasks="filteredTasks"
          :selected-task="selectedTask"
          @task-click="selectTask"
          @date-click="handleDateClick"
        />
      </div>
    </div>

    <!-- Task Modal for create/edit -->
    <TaskModal
      v-if="showTaskModal"
      :task="editingTask"
      :projects="projects"
      :departments="departments"
      @close="closeTaskModal"
      @save="saveTask"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CalendarHeader from './components/CalendarHeader.vue'
import CalendarView from './components/CalendarView.vue'
import TaskList from './components/TaskList.vue'
import TaskModal from './components/TaskModal.vue'
import { generateDummyData, type Task, type Project, type Department } from './components'

// Reactive data
const currentView = ref<'month' | 'week' | 'day'>('month')
const currentDate = ref(new Date())
const selectedProject = ref<string | null>(null)
const selectedTask = ref<Task | null>(null)
const showTaskModal = ref(false)
const editingTask = ref<Task | null>(null)

// Dummy data
const { tasks, projects, departments } = generateDummyData()

// Computed properties
const filteredTasks = computed(() => {
  let filtered = tasks.value
  if (selectedProject.value) {
    filtered = filtered.filter(task => task.projectId === selectedProject.value)
  }
  return filtered
})

// Methods
const handleViewChange = (view: 'month' | 'week' | 'day') => {
  currentView.value = view
}

const handleDateChange = (date: Date) => {
  currentDate.value = date
}

const handleProjectChange = (projectId: string | null) => {
  selectedProject.value = projectId
}

const handleDateClick = (date: Date) => {
  currentDate.value = date
  if (currentView.value === 'month') {
    currentView.value = 'day'
  }
}

const handleTimeSlotClick = (date: Date, hour: number) => {
  console.log('Time slot clicked:', date, hour)
}

const selectTask = (task: any) => {
  selectedTask.value = task
}

const editTask = (task: any) => {
  editingTask.value = task
  showTaskModal.value = true
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex((task: any) => task.id === taskId)
  if (index > -1) {
    tasks.value.splice(index, 1)
  }
}

const openTaskModal = () => {
  editingTask.value = null
  showTaskModal.value = true
}

const closeTaskModal = () => {
  showTaskModal.value = false
  editingTask.value = null
}

const saveTask = (taskData: any) => {
  if (editingTask.value) {
    const index = tasks.value.findIndex((task: any) => task.id === editingTask.value!.id)
    if (index > -1) {
      tasks.value[index] = { ...tasks.value[index], ...taskData }
    }
  } else {
    const newTask: any = {
      id: Date.now().toString(),
      title: taskData.title || '',
      description: taskData.description,
      status: taskData.status || 'PENDING',
      priority: taskData.priority || 'MEDIUM',
      dueDate: taskData.dueDate || new Date().toISOString(),
      startDate: taskData.startDate,
      estimatedHours: taskData.estimatedHours,
      actualHours: taskData.actualHours,
      projectId: taskData.projectId || projects.value[0].id,
      departmentId: taskData.departmentId || departments.value[0].id,
      assignedUserId: taskData.assignedUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.value.push(newTask)
  }
  closeTaskModal()
}

// Lifecycle
onMounted(() => {
  if (projects.value.length > 0) {
    selectedProject.value = projects.value[0].id
  }
})
</script>

<style scoped>
.task-calendar-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8fafc;
}

.calendar-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 350px;
  background-color: white;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
}

.calendar-main {
  flex: 1;
  background-color: white;
  overflow: hidden;
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-content {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
  }
}
</style>
