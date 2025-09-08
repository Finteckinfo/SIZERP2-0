import { ref } from 'vue'

export interface Task {
  id: string
  title: string
  description?: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  dueDate: string
  startDate?: string
  estimatedHours?: number
  actualHours?: number
  projectId: string
  departmentId: string
  assignedUserId?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  startDate: string
  endDate: string
  color: string
}

export interface Department {
  id: string
  name: string
  projectId: string
  color: string
}

export function generateDummyData() {
  const projects = ref<Project[]>([
    {
      id: '1',
      name: 'SIZ ERP System',
      description: 'Complete ERP system for immigration services',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Client Portal',
      description: 'Client-facing portal for case management',
      startDate: '2024-02-01',
      endDate: '2024-10-31',
      color: '#10b981'
    },
    {
      id: '3',
      name: 'Document Management',
      description: 'Document processing and storage system',
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      color: '#f59e0b'
    }
  ])

  const departments = ref<Department[]>([
    {
      id: '1',
      name: 'Frontend Development',
      projectId: '1',
      color: '#3b82f6'
    },
    {
      id: '2',
      name: 'Backend Development',
      projectId: '1',
      color: '#8b5cf6'
    },
    {
      id: '3',
      name: 'Database Design',
      projectId: '1',
      color: '#06b6d4'
    },
    {
      id: '4',
      name: 'UI/UX Design',
      projectId: '2',
      color: '#10b981'
    },
    {
      id: '5',
      name: 'Quality Assurance',
      projectId: '2',
      color: '#f59e0b'
    },
    {
      id: '6',
      name: 'DevOps',
      projectId: '3',
      color: '#ef4444'
    }
  ])

  const tasks = ref<Task[]>([
    // Current week tasks
    {
      id: '1',
      title: 'Design user authentication flow',
      description: 'Create wireframes and user stories for login/signup process',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date().toISOString(),
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 8,
      actualHours: 5,
      projectId: '1',
      departmentId: '1',
      assignedUserId: 'user1',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Implement JWT authentication',
      description: 'Set up JWT token generation and validation middleware',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date().toISOString(),
      estimatedHours: 12,
      projectId: '1',
      departmentId: '2',
      assignedUserId: 'user2',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'Create database schema',
      description: 'Design and implement database tables for user management',
      status: 'COMPLETED',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 16,
      actualHours: 14,
      projectId: '1',
      departmentId: '3',
      assignedUserId: 'user3',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Design client dashboard',
      description: 'Create mockups for the main client dashboard interface',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 6,
      actualHours: 2,
      projectId: '2',
      departmentId: '4',
      assignedUserId: 'user4',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'Write unit tests for auth module',
      description: 'Create comprehensive test coverage for authentication functions',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 8,
      projectId: '1',
      departmentId: '5',
      assignedUserId: 'user5',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Next week tasks
    {
      id: '6',
      title: 'Deploy staging environment',
      description: 'Set up and configure staging environment for testing',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 4,
      projectId: '1',
      departmentId: '6',
      assignedUserId: 'user6',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '7',
      title: 'Implement file upload feature',
      description: 'Add document upload functionality to client portal',
      status: 'PENDING',
      priority: 'MEDIUM',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 10,
      projectId: '2',
      departmentId: '2',
      assignedUserId: 'user2',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '8',
      title: 'Create API documentation',
      description: 'Generate comprehensive API documentation for all endpoints',
      status: 'PENDING',
      priority: 'LOW',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 6,
      projectId: '1',
      departmentId: '2',
      assignedUserId: 'user7',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    // Past tasks
    {
      id: '9',
      title: 'Project setup and configuration',
      description: 'Initialize project structure and development environment',
      status: 'COMPLETED',
      priority: 'CRITICAL',
      dueDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 12,
      actualHours: 10,
      projectId: '1',
      departmentId: '6',
      assignedUserId: 'user6',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '10',
      title: 'Research and analysis',
      description: 'Conduct market research and technical analysis for the project',
      status: 'APPROVED',
      priority: 'HIGH',
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 20,
      actualHours: 18,
      projectId: '1',
      departmentId: '4',
      assignedUserId: 'user4',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])

  return {
    projects,
    departments,
    tasks
  }
}
