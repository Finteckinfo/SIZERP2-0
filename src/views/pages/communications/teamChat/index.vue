<template>
  <div class="team-chat-page">
    <!-- Header Section -->
    <div class="team-chat-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="48" color="white">mdi-chat</v-icon>
        </div>
        <h1 class="header-title">Team Chat</h1>
        <p class="header-subtitle">Collaborate and coordinate with your project team members</p>
      </div>
    </div>

    <!-- Project Selection -->
    <div class="project-selection">
      <div class="selection-container">
        <div class="selection-header">
          <h3>Select Project</h3>
          <p>Choose a project to view and participate in team discussions</p>
        </div>
        
        <div class="project-cards">
          <div 
            v-for="project in projects" 
            :key="project.id"
            class="project-card"
            :class="{ active: selectedProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <div class="project-icon">
              <v-avatar :color="getProjectColor(project.type)" size="48">
                <v-icon :icon="getProjectIcon(project.type)" color="white" size="24" />
              </v-avatar>
            </div>
            
            <div class="project-info">
              <h4>{{ project.name }}</h4>
              <p>{{ project.description }}</p>
              <div class="project-meta">
                <div class="team-count">
                  <v-icon size="16">mdi-account-group</v-icon>
                  <span>{{ project.teamSize }} members</span>
                </div>
                <div class="unread-count" v-if="project.unreadCount > 0">
                  <v-chip size="x-small" color="error">
                    {{ project.unreadCount }}
                  </v-chip>
                </div>
              </div>
            </div>
            
            <div class="project-status">
              <v-chip 
                size="small"
                :color="getStatusColor(project.status)"
              >
                {{ getStatusLabel(project.status) }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Interface -->
    <div v-if="selectedProject" class="chat-interface">
      <div class="chat-container">
        <!-- Chat Header -->
        <div class="chat-header">
          <div class="chat-project-info">
            <v-avatar :color="getProjectColor(selectedProject.type)" size="40">
              <v-icon :icon="getProjectIcon(selectedProject.type)" color="white" size="20" />
            </v-avatar>
            <div class="chat-project-details">
              <h3>{{ selectedProject.name }}</h3>
              <p>{{ selectedProject.teamSize }} team members online</p>
            </div>
          </div>
          
          <div class="chat-actions">
            <v-btn
              icon
              variant="text"
              @click="showProjectMembers = !showProjectMembers"
            >
              <v-icon>mdi-account-group</v-icon>
            </v-btn>
            <v-btn
              icon
              variant="text"
              @click="showChatSettings = !showChatSettings"
            >
              <v-icon>mdi-cog</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Chat Content -->
        <div class="chat-content">
          <!-- Messages List -->
          <div class="messages-area">
            <div class="messages-list" ref="messagesList">
              <div 
                v-for="message in currentMessages" 
                :key="message.id"
                class="message-bubble"
                :class="{ 
                  'own-message': message.senderId === currentUserId,
                  'system-message': message.type === 'system'
                }"
              >
                <div v-if="message.type !== 'system'" class="message-avatar">
                  <v-avatar size="32" :color="getUserColor(message.senderId)">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </div>
                
                <div class="message-content">
                  <div v-if="message.type !== 'system'" class="message-header">
                    <span class="sender-name">{{ getSenderName(message.senderId) }}</span>
                    <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  </div>
                  
                  <div class="message-text" :class="{ 'system-text': message.type === 'system' }">
                    {{ message.content }}
                  </div>
                  
                  <div v-if="message.attachments" class="message-attachments">
                    <div 
                      v-for="attachment in message.attachments" 
                      :key="attachment.id"
                      class="attachment-item"
                    >
                      <v-icon>mdi-paperclip</v-icon>
                      <span>{{ attachment.name }}</span>
                      <v-btn size="x-small" variant="text">Download</v-btn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input-area">
            <div class="input-container">
              <v-btn
                icon
                variant="text"
                class="attachment-btn"
              >
                <v-icon>mdi-paperclip</v-icon>
              </v-btn>
              
              <v-textarea
                v-model="newMessage"
                placeholder="Type your message..."
                variant="outlined"
                rows="1"
                auto-grow
                hide-details
                class="message-input"
                @keydown.enter.prevent="sendMessage"
              />
              
              <v-btn
                color="primary"
                variant="flat"
                :disabled="!newMessage.trim()"
                @click="sendMessage"
                class="send-btn"
              >
                <v-icon>mdi-send</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Project Members Sidebar -->
      <v-navigation-drawer
        v-model="showProjectMembers"
        location="right"
        width="300"
        temporary
        class="members-sidebar"
      >
        <div class="members-header">
          <h3>Team Members</h3>
          <v-btn
            icon
            variant="text"
            @click="showProjectMembers = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        
        <div class="members-list">
          <div 
            v-for="member in projectMembers" 
            :key="member.id"
            class="member-item"
          >
            <v-avatar size="40" :color="getUserColor(member.id)">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div class="member-info">
              <h4>{{ member.name }}</h4>
              <p>{{ member.role }}</p>
            </div>
            <div class="member-status">
              <v-chip 
                size="x-small"
                :color="member.online ? 'success' : 'grey'"
              >
                {{ member.online ? 'Online' : 'Offline' }}
              </v-chip>
            </div>
          </div>
        </div>
      </v-navigation-drawer>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <v-avatar size="80" color="grey-lighten-3" class="mb-4">
        <v-icon size="40" color="grey">mdi-chat</v-icon>
      </v-avatar>
      <h5 class="text-h5 text-medium-emphasis mb-2">Select a Project</h5>
      <p class="text-body-1 text-medium-emphasis">
        Choose a project from the list above to start chatting with your team members.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';

// Types
interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  teamSize: number;
  unreadCount: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

interface ChatMessage {
  id: number;
  senderId: string;
  content: string;
  timestamp: Date;
  type: string;
  attachments: any[] | null;
}

// Reactive data
const selectedProject = ref<Project | null>(null);
const showProjectMembers = ref(false);
const showChatSettings = ref(false);
const newMessage = ref('');
const currentUserId = ref('user-1'); // Dummy current user ID

// Dummy projects data
const projects = ref([
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Modernize the company website with improved UX and mobile responsiveness',
    type: 'PROGRESSIVE',
    status: 'ACTIVE',
    teamSize: 5,
    unreadCount: 3
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Create a cross-platform mobile application for customer engagement',
    type: 'PARALLEL',
    status: 'ACTIVE',
    teamSize: 8,
    unreadCount: 0
  },
  {
    id: 'project-3',
    name: 'Database Migration',
    description: 'Migrate legacy database systems to modern cloud infrastructure',
    type: 'SEQUENTIAL',
    status: 'PENDING',
    teamSize: 3,
    unreadCount: 1
  }
]);

// Dummy team members data
const projectMembers = ref([
  {
    id: 'user-1',
    name: 'John Smith',
    role: 'Project Manager',
    online: true
  },
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    role: 'Frontend Developer',
    online: true
  },
  {
    id: 'user-3',
    name: 'Mike Davis',
    role: 'Backend Developer',
    online: false
  },
  {
    id: 'user-4',
    name: 'Emily Wilson',
    role: 'UI/UX Designer',
    online: true
  },
  {
    id: 'user-5',
    name: 'Alex Brown',
    role: 'QA Tester',
    online: false
  }
]);

// Dummy messages data for different projects
const projectMessages = ref({
  'project-1': [
    {
      id: 1,
      senderId: 'user-2',
      content: 'Hey team! I\'ve finished the header component redesign. Should I push it to the dev branch?',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      type: 'user',
      attachments: null
    },
    {
      id: 2,
      senderId: 'user-1',
      content: 'Great work Sarah! Yes, please push it to dev. I\'ll review it this afternoon.',
      timestamp: new Date(Date.now() - 25 * 60 * 1000),
      type: 'user',
      attachments: null
    },
    {
      id: 3,
      senderId: 'user-4',
      content: 'I\'ve updated the design mockups based on the client feedback. Check the shared folder.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      type: 'user',
      attachments: [
        { id: 1, name: 'mockups-v2.zip' }
      ]
    },
    {
      id: 4,
      senderId: 'system',
      content: 'Mike Davis joined the chat',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      type: 'system',
      attachments: null
    },
    {
      id: 5,
      senderId: 'user-3',
      content: 'Thanks for the updates everyone. I\'ll start working on the backend integration tomorrow.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      type: 'user',
      attachments: null
    }
  ],
  'project-2': [
    {
      id: 1,
      senderId: 'user-1',
      content: 'Welcome to the Mobile App Development project chat! Let\'s coordinate our work here.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      type: 'user',
      attachments: null
    },
    {
      id: 2,
      senderId: 'user-2',
      content: 'I\'m working on the React Native setup. Should be ready by end of week.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      type: 'user',
      attachments: null
    }
  ],
  'project-3': [
    {
      id: 1,
      senderId: 'user-1',
      content: 'Database migration project is starting next week. Please review the migration plan.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      type: 'user',
      attachments: null
    }
  ]
});

// Computed properties
const currentMessages = computed(() => {
  if (!selectedProject.value) return [];
  return projectMessages.value[selectedProject.value.id as keyof typeof projectMessages.value] || [];
});

// Methods
const selectProject = (project: Project) => {
  selectedProject.value = project;
  // Clear unread count when selecting project
  project.unreadCount = 0;
  nextTick(() => {
    scrollToBottom();
  });
};

const getProjectColor = (type: string) => {
  switch (type) {
    case 'PROGRESSIVE': return 'primary';
    case 'PARALLEL': return 'success';
    case 'SEQUENTIAL': return 'warning';
    default: return 'grey';
  }
};

const getProjectIcon = (type: string) => {
  switch (type) {
    case 'PROGRESSIVE': return 'mdi-trending-up';
    case 'PARALLEL': return 'mdi-source-branch';
    case 'SEQUENTIAL': return 'mdi-format-list-numbered';
    default: return 'mdi-folder';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'COMPLETED': return 'info';
    default: return 'grey';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Active';
    case 'PENDING': return 'Pending';
    case 'COMPLETED': return 'Completed';
    default: return status;
  }
};

const getUserColor = (userId: string) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'];
  const index = userId.split('-')[1] ? parseInt(userId.split('-')[1]) % colors.length : 0;
  return colors[index] || 'grey';
};

const getSenderName = (senderId: string) => {
  if (senderId === 'system') return 'System';
  const member = projectMembers.value.find(m => m.id === senderId);
  return member ? member.name : 'Unknown User';
};

const formatMessageTime = (timestamp: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return timestamp.toLocaleDateString();
};

const sendMessage = () => {
  if (!newMessage.value.trim() || !selectedProject.value) return;
  
  const message = {
    id: Date.now(),
    senderId: currentUserId.value,
    content: newMessage.value.trim(),
    timestamp: new Date(),
    type: 'user',
    attachments: null
  };
  
  const projectId = selectedProject.value.id as keyof typeof projectMessages.value;
  if (!projectMessages.value[projectId]) {
    projectMessages.value[projectId] = [];
  }
  
  projectMessages.value[projectId].push(message);
  newMessage.value = '';
  
  nextTick(() => {
    scrollToBottom();
  });
};

const scrollToBottom = () => {
  const messagesList = document.querySelector('.messages-list');
  if (messagesList) {
    messagesList.scrollTop = messagesList.scrollHeight;
  }
};

// Watch for project changes to scroll to bottom
watch(selectedProject, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

onMounted(() => {
  // Any initialization logic
});
</script>

<style scoped>
.team-chat-page {
  min-height: 100vh;
  background: var(--erp-page-bg);
  transition: background-color 0.3s ease;
}

/* Header Section */
.team-chat-header {
  background: linear-gradient(135deg, var(--erp-accent-green) 0%, var(--erp-accent-indigo) 100%);
  padding: 4rem 2rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.team-chat-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.header-icon {
  margin-bottom: 1.5rem;
}

.header-title {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  letter-spacing: -0.025em;
}

.header-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  font-weight: 400;
}

/* Project Selection */
.project-selection {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.selection-container {
  background: var(--erp-card-bg);
  border-radius: 16px;
  border: 1px solid var(--erp-border);
  padding: 2rem;
}

.selection-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selection-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
}

.selection-header p {
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 2px solid var(--erp-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--erp-surface);
}

.project-card:hover {
  border-color: var(--erp-accent-green);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.project-card.active {
  border-color: var(--erp-accent-green);
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.project-icon {
  margin-right: 1rem;
  flex-shrink: 0;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-info h4 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--erp-text);
}

.project-info p {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.8;
  margin: 0 0 1rem 0;
  line-height: 1.4;
}

.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.team-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
}

.project-status {
  margin-left: 1rem;
  flex-shrink: 0;
}

/* Chat Interface */
.chat-interface {
  padding: 0 2rem 2rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.chat-container {
  background: var(--erp-card-bg);
  border-radius: 16px;
  border: 1px solid var(--erp-border);
  height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.chat-project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-project-details h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.chat-project-details p {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.messages-area {
  flex: 1;
  overflow: hidden;
}

.messages-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-bubble {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  max-width: 70%;
}

.message-bubble.own-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-bubble.system-message {
  align-self: center;
  max-width: 100%;
  justify-content: center;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.sender-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
}

.message-time {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.6;
}

.message-text {
  background: var(--erp-surface);
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--erp-text);
  word-wrap: break-word;
}

.own-message .message-text {
  background: var(--erp-accent-green);
  color: white;
}

.system-text {
  background: var(--erp-border);
  color: var(--erp-text);
  opacity: 0.8;
  font-style: italic;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.message-attachments {
  margin-top: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--erp-border);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--erp-text);
}

.message-input-area {
  padding: 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

.attachment-btn {
  flex-shrink: 0;
}

.message-input {
  flex: 1;
}

.send-btn {
  flex-shrink: 0;
}

/* Members Sidebar */
.members-sidebar {
  background: var(--erp-card-bg) !important;
}

.members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--erp-border);
}

.members-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.members-list {
  padding: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.member-item:hover {
  background: var(--erp-surface);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-info h4 {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.member-info p {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.member-status {
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  min-height: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .team-chat-header {
    padding: 2rem 1rem;
  }
  
  .header-title {
    font-size: 2rem;
  }
  
  .header-subtitle {
    font-size: 1rem;
  }
  
  .project-selection {
    padding: 1rem;
  }
  
  .selection-container {
    padding: 1.5rem;
  }
  
  .project-cards {
    grid-template-columns: 1fr;
  }
  
  .project-card {
    padding: 1rem;
  }
  
  .chat-interface {
    padding: 0 1rem 1rem 1rem;
  }
  
  .chat-container {
    height: 500px;
  }
  
  .chat-header {
    padding: 1rem;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .messages-list {
    padding: 0.75rem;
  }
  
  .message-input-area {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .project-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .project-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .project-status {
    margin-left: 0;
    margin-top: 1rem;
    align-self: flex-end;
  }
  
  .chat-project-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .message-bubble {
    max-width: 90%;
  }
}
</style>
