<template>
  <div class="calendar-header">
    <div class="header-left">
      <h1 class="page-title">Task Calendar</h1>
      <div class="view-controls">
        <button 
          v-for="view in views" 
          :key="view"
          :class="['view-btn', { active: currentView === view }]"
          @click="$emit('view-change', view)"
        >
          {{ view.charAt(0).toUpperCase() + view.slice(1) }}
        </button>
      </div>
    </div>

    <div class="header-center">
      <div class="date-navigation">
        <button class="nav-btn" @click="previousPeriod">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 class="current-date" @click="showDatePicker = !showDatePicker">
          {{ formattedDate }}
        </h2>
        
        <button class="nav-btn" @click="nextPeriod">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Date Picker Modal -->
      <div v-if="showDatePicker" class="date-picker-modal" @click.self="showDatePicker = false">
        <div class="date-picker-content">
          <input 
            type="date" 
            v-model="selectedDate"
            @change="handleDateChange"
            class="date-input"
          />
          <button @click="goToToday" class="today-btn">Today</button>
        </div>
      </div>
    </div>

    <div class="header-right">
      <div class="project-filter">
        <select 
          v-model="selectedProjectId" 
          @change="handleProjectChange"
          class="project-select"
        >
          <option value="">All Projects</option>
          <option 
            v-for="project in projects" 
            :key="project.id" 
            :value="project.id"
          >
            {{ project.name }}
          </option>
        </select>
      </div>

      <button class="create-task-btn" @click="$emit('create-task')">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Task
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Project {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  color: string
}

interface Props {
  currentView: 'month' | 'week' | 'day'
  currentDate: Date
  selectedProject: string | null
  projects: Project[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-change': [view: 'month' | 'week' | 'day']
  'date-change': [date: Date]
  'project-change': [projectId: string | null]
  'create-task': []
}>()

const views = ['month', 'week', 'day'] as const
const showDatePicker = ref(false)
const selectedDate = ref('')
const selectedProjectId = ref(props.selectedProject || '')

const formattedDate = computed(() => {
  const date = props.currentDate
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long'
  }
  
  if (props.currentView === 'week') {
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  } else if (props.currentView === 'day') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  } else {
    return date.toLocaleDateString('en-US', options)
  }
})

const previousPeriod = () => {
  const newDate = new Date(props.currentDate)
  if (props.currentView === 'month') {
    newDate.setMonth(newDate.getMonth() - 1)
  } else if (props.currentView === 'week') {
    newDate.setDate(newDate.getDate() - 7)
  } else {
    newDate.setDate(newDate.getDate() - 1)
  }
  emit('date-change', newDate)
}

const nextPeriod = () => {
  const newDate = new Date(props.currentDate)
  if (props.currentView === 'month') {
    newDate.setMonth(newDate.getMonth() + 1)
  } else if (props.currentView === 'week') {
    newDate.setDate(newDate.getDate() + 7)
  } else {
    newDate.setDate(newDate.getDate() + 1)
  }
  emit('date-change', newDate)
}

const handleDateChange = () => {
  if (selectedDate.value) {
    emit('date-change', new Date(selectedDate.value))
    showDatePicker.value = false
  }
}

const goToToday = () => {
  emit('date-change', new Date())
  showDatePicker.value = false
}

const handleProjectChange = () => {
  emit('project-change', selectedProjectId.value || null)
}
</script>

<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background-color: var(--erp-card-bg);
  border-bottom: 1px solid var(--erp-border);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--erp-text);
  margin: 0;
}

.view-controls {
  display: flex;
  background-color: var(--erp-surface);
  border-radius: 0.5rem;
  padding: 0.25rem;
  border: 1px solid var(--erp-border);
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--erp-text);
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn:hover {
  color: var(--erp-text);
  background-color: var(--erp-surface);
}

.view-btn.active {
  background-color: var(--erp-card-bg);
  color: var(--erp-text);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.header-center {
  position: relative;
}

.date-navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background-color: #e5e7eb;
  color: #374151;
}

.current-date {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.current-date:hover {
  background-color: var(--erp-surface);
}

.date-picker-modal {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  margin-top: 0.5rem;
}

.date-picker-content {
  background-color: var(--erp-card-bg);
  border: 1px solid var(--erp-border);
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.date-input {
  padding: 0.5rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.today-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.today-btn:hover {
  background-color: #2563eb;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.project-filter {
  display: flex;
  align-items: center;
}

.project-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  background-color: var(--erp-card-bg);
  font-size: 0.875rem;
  color: var(--erp-text);
  cursor: pointer;
}

.project-select:focus {
  outline: none;
  border-color: var(--erp-accent-indigo);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--erp-accent-indigo) 20%, transparent);
}

.create-task-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--erp-accent-indigo);
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-task-btn:hover {
  filter: brightness(0.95);
}

/* Responsive design */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .header-left,
  .header-center,
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .view-controls {
    width: 100%;
    justify-content: center;
  }
  
  .date-navigation {
    width: 100%;
    justify-content: center;
  }
  
  .header-right {
    justify-content: space-between;
  }
}
</style>
