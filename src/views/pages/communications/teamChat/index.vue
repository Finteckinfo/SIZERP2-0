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

    <!-- Main Chat Interface -->
    <div class="chat-interface">
      <!-- Projects Sidebar -->
      <v-navigation-drawer
        v-model="showProjectsSidebar"
        location="left"
        :width="sidebarWidth"
        permanent
        class="projects-sidebar"
      >
        <div class="sidebar-header">
          <div class="header-content">
            <h3>Projects</h3>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="toggleProjectsSidebar"
              class="toggle-btn"
            >
              <v-icon>{{ showProjectsSidebar ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
            </v-btn>
          </div>
        </div>
        
        <div class="projects-list">
          <div 
            v-for="project in projects" 
            :key="project.id"
            class="project-item"
            :class="{ active: selectedProject?.id === project.id }"
            @click="selectProject(project)"
          >
            <div class="project-avatar">
              <v-avatar :color="getProjectColor(project.type)" size="36">
                <v-icon :icon="getProjectIcon(project.type)" color="white" size="18" />
              </v-avatar>
            </div>
            
            <div v-if="showProjectsSidebar" class="project-details">
              <div class="project-name">{{ project.name }}</div>
              <div class="project-last-message">{{ getLastMessage(project.id) }}</div>
            </div>
            
            <div v-if="showProjectsSidebar && project.unreadCount > 0" class="unread-badge">
              {{ project.unreadCount }}
            </div>
          </div>
        </div>
      </v-navigation-drawer>

      <!-- Chat Area -->
      <div class="chat-main">
        <!-- Chat Header -->
        <div v-if="selectedProject" class="chat-header">
          <div class="chat-project-info">
            <v-avatar :color="getProjectColor(selectedProject.type)" size="40">
              <v-icon :icon="getProjectIcon(selectedProject.type)" color="white" size="20" />
            </v-avatar>
            <div class="chat-project-details">
              <h3>{{ selectedProject.name }}</h3>
              <p>{{ getOnlineCount() }} team members online</p>
            </div>
          </div>
          
          <div class="chat-actions">
            <v-btn
              icon
              variant="text"
              @click="toggleMembersSidebar"
              :class="{ active: showMembersSidebar }"
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
        <div v-if="selectedProject" class="chat-content">
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

        <!-- Empty State -->
        <div v-else class="empty-chat-state">
          <v-avatar size="80" color="grey-lighten-3" class="mb-4">
            <v-icon size="40" color="grey">mdi-chat</v-icon>
          </v-avatar>
          <h5 class="text-h5 text-medium-emphasis mb-2">Select a Project</h5>
          <p class="text-body-1 text-medium-emphasis">
            Choose a project from the sidebar to start chatting with your team members.
          </p>
        </div>
      </div>

      <!-- Members Sidebar -->
      <v-navigation-drawer
        v-model="showMembersSidebar"
        location="right"
        :width="sidebarWidth"
        temporary
        class="members-sidebar"
      >
        <div class="sidebar-header">
          <div class="header-content">
            <h3>Team Members</h3>
            <v-btn
              icon
              variant="text"
              size="small"
              @click="toggleMembersSidebar"
              class="toggle-btn"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
        
        <div class="members-list">
          <!-- Online Members -->
          <div class="member-section">
            <div class="section-header">
              <span class="section-title">Online ({{ getOnlineCount() }})</span>
            </div>
            <div 
              v-for="member in onlineMembers" 
              :key="member.id"
              class="member-item online"
            >
              <v-avatar size="32" :color="getUserColor(member.id)">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.role }}</span>
              </div>
              <div class="online-indicator"></div>
            </div>
          </div>

          <!-- Offline Members -->
          <div class="member-section">
            <div class="section-header">
              <span class="section-title">Offline ({{ getOfflineCount() }})</span>
            </div>
            <div 
              v-for="member in offlineMembers" 
              :key="member.id"
              class="member-item offline"
            >
              <v-avatar size="32" :color="getUserColor(member.id)">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div class="member-info">
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role">{{ member.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </v-navigation-drawer>
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
const showProjectsSidebar = ref(true);
const showMembersSidebar = ref(false);
const showChatSettings = ref(false);
const newMessage = ref('');
const currentUserId = ref('user-1'); // Dummy current user ID
const sidebarWidth = ref(280);

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

const onlineMembers = computed(() => {
  return projectMembers.value.filter(member => member.online);
});

const offlineMembers = computed(() => {
  return projectMembers.value.filter(member => !member.online);
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

const toggleProjectsSidebar = () => {
  showProjectsSidebar.value = !showProjectsSidebar.value;
  sidebarWidth.value = showProjectsSidebar.value ? 280 : 60;
};

const toggleMembersSidebar = () => {
  showMembersSidebar.value = !showMembersSidebar.value;
};

const getOnlineCount = () => {
  return projectMembers.value.filter(member => member.online).length;
};

const getOfflineCount = () => {
  return projectMembers.value.filter(member => !member.online).length;
};

const getLastMessage = (projectId: string) => {
  const messages = projectMessages.value[projectId as keyof typeof projectMessages.value];
  if (!messages || messages.length === 0) return 'No messages yet';
  const lastMessage = messages[messages.length - 1];
  return lastMessage.content.length > 50 
    ? lastMessage.content.substring(0, 50) + '...'
    : lastMessage.content;
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

/* Chat Interface */
.chat-interface {
  display: flex;
  height: calc(100vh - 200px);
  background: var(--erp-card-bg);
  border-radius: 16px;
  border: 1px solid var(--erp-border);
  overflow: hidden;
  margin: 2rem;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
}

/* Sidebar Styles */
.projects-sidebar,
.members-sidebar {
  background: var(--erp-surface) !important;
  border-right: 1px solid var(--erp-border);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.members-sidebar {
  border-right: none !important;
  border-left: 1px solid var(--erp-border);
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--erp-text);
}

.toggle-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.toggle-btn:hover {
  opacity: 1;
}

/* Projects List */
.projects-list {
  padding: 0.5rem;
}

.project-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.25rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.project-item:hover {
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.project-item.active {
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
  border-left: 3px solid var(--erp-accent-green);
}

.project-avatar {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.project-details {
  flex: 1;
  min-width: 0;
}

.project-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--erp-text);
  margin-bottom: 0.25rem;
}

.project-last-message {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unread-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: var(--erp-accent-green);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chat Main Area */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--erp-card-bg);
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--erp-border);
  background: var(--erp-surface);
  flex-shrink: 0;
}

.chat-project-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-project-details h3 {
  font-size: 1.125rem;
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

.chat-actions .v-btn.active {
  background: color-mix(in srgb, var(--erp-accent-green) 10%, var(--erp-surface));
  color: var(--erp-accent-green);
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
  margin-bottom: 0.5rem;
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
  border: 1px solid var(--erp-border);
}

.own-message .message-text {
  background: var(--erp-accent-green);
  color: white;
  border-color: var(--erp-accent-green);
}

.system-text {
  background: var(--erp-border);
  color: var(--erp-text);
  opacity: 0.8;
  font-style: italic;
  text-align: center;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
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
.members-list {
  padding: 0.5rem;
}

.member-section {
  margin-bottom: 1rem;
}

.section-header {
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--erp-text);
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
  position: relative;
}

.member-item:hover {
  background: color-mix(in srgb, var(--erp-accent-green) 5%, var(--erp-surface));
}

.member-item.online .member-name {
  color: var(--erp-text);
}

.member-item.offline .member-name {
  color: var(--erp-text);
  opacity: 0.6;
}

.member-item.offline .member-role {
  opacity: 0.5;
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.125rem;
  display: block;
}

.member-role {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  display: block;
}

.online-indicator {
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid var(--erp-surface);
  position: absolute;
  top: 0.75rem;
  left: 2.5rem;
}

/* Empty Chat State */
.empty-chat-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  flex: 1;
  background: var(--erp-card-bg);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .chat-interface {
    height: calc(100vh - 150px);
    margin: 1rem;
  }
  
  .sidebarWidth {
    width: 240px;
  }
}

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
  
  .chat-interface {
    height: calc(100vh - 120px);
    margin: 0.5rem;
    border-radius: 8px;
  }
  
  .sidebarWidth {
    width: 200px;
  }
  
  .chat-header {
    padding: 0.75rem 1rem;
  }
  
  .chat-project-details h3 {
    font-size: 1rem;
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
  
  .project-details {
    display: none;
  }
  
  .project-item {
    justify-content: center;
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .chat-interface {
    height: calc(100vh - 100px);
    margin: 0.25rem;
  }
  
  .sidebarWidth {
    width: 60px;
  }
  
  .chat-header {
    padding: 0.5rem;
  }
  
  .chat-project-info {
    gap: 0.5rem;
  }
  
  .chat-project-details h3 {
    font-size: 0.875rem;
  }
  
  .chat-project-details p {
    font-size: 0.75rem;
  }
  
  .message-bubble {
    max-width: 90%;
  }
  
  .message-text {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
  
  .project-item {
    padding: 0.5rem;
  }
  
  .project-avatar .v-avatar {
    width: 28px !important;
    height: 28px !important;
  }
}
</style>
