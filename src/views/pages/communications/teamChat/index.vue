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
          <!-- Loading State -->
          <div v-if="loadingRooms" class="loading-state">
            <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <v-icon color="error" size="24">mdi-alert-circle</v-icon>
            <p class="error-text">{{ error }}</p>
          </div>

          <!-- Projects List -->
          <div 
            v-else
            v-for="project in chatRooms" 
            :key="project.id"
            class="project-item"
            :class="{ active: selectedRoom?.id === project.id }"
            @click="selectRoom(project)"
          >
            <div class="project-avatar">
              <v-avatar :color="getProjectColor(project.roomType)" size="36">
                <v-icon :icon="getProjectIcon(project.roomType)" color="white" size="18" />
              </v-avatar>
            </div>
            
            <div v-if="showProjectsSidebar" class="project-details">
              <div class="project-name">{{ project.roomName }}</div>
              <div class="project-last-message">{{ getLastMessage(project.id) }}</div>
            </div>
            
            <div v-if="showProjectsSidebar && getUnreadCount(project.id) > 0" class="unread-badge">
              {{ getUnreadCount(project.id) }}
            </div>
          </div>
        </div>
      </v-navigation-drawer>

      <!-- Chat Area -->
      <div class="chat-main">
        <!-- Chat Header -->
        <div v-if="selectedRoom" class="chat-header">
          <div class="chat-project-info">
            <v-avatar :color="getProjectColor(selectedRoom.roomType)" size="40">
              <v-icon :icon="getProjectIcon(selectedRoom.roomType)" color="white" size="20" />
            </v-avatar>
            <div class="chat-project-details">
              <h3>{{ selectedRoom.roomName }}</h3>
              <p>{{ onlineMembers.length }} team members online</p>
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
        <div v-if="selectedRoom" class="chat-content">
          <!-- Messages List -->
          <div class="messages-area">
            <div class="messages-list" ref="messagesList">
              <!-- Loading Messages -->
              <div v-if="loadingMessages" class="loading-messages">
                <v-progress-circular indeterminate size="24" color="primary"></v-progress-circular>
                <span class="ml-2">Loading messages...</span>
              </div>

              <!-- Messages -->
              <div 
                v-else
                v-for="message in currentMessages" 
                :key="message.id"
                class="message-bubble"
                :class="{ 
                  'own-message': (message.senderId || message.sender_user_id) === currentUserId,
                  'system-message': message.type === 'system'
                }"
              >
                <div v-if="message.type !== 'system'" class="message-avatar">
                  <v-avatar size="32" :color="getUserColor(message.senderId || message.sender_user_id)">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </div>
                
                <div class="message-content">
                  <div v-if="message.type !== 'system'" class="message-header">
                    <span class="sender-name">{{ getSenderName(message.senderId || message.sender_user_id) }}</span>
                    <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
                  </div>
                  
                  <div class="message-text" :class="{ 'system-text': message.type === 'system' }">
                    {{ message.content }}
                  </div>
                  
                  <div v-if="message.attachments && message.attachments.length > 0" class="message-attachments">
                    <div 
                      v-for="(attachment, index) in message.attachments" 
                      :key="index"
                      class="attachment-item"
                    >
                      <v-icon>mdi-paperclip</v-icon>
                      <span>{{ typeof attachment === 'string' ? attachment : (attachment as any)?.name || attachment }}</span>
                      <v-btn size="x-small" variant="text">Download</v-btn>
                    </div>
                  </div>

                  <!-- Message Reactions -->
                  <div v-if="message.reactions && Object.keys(message.reactions).length > 0" class="message-reactions">
                    <v-chip
                      v-for="(users, emoji) in message.reactions"
                      :key="emoji"
                      size="x-small"
                      variant="outlined"
                      class="reaction-chip"
                    >
                      {{ emoji }} {{ users.length }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="typingUsers.length > 0" class="typing-indicator">
            <div class="typing-content">
              <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span class="typing-text">
                {{ typingUsers.length === 1 ? getSenderName(typingUsers[0]) : `${typingUsers.length} people` }} 
                {{ typingUsers.length === 1 ? 'is' : 'are' }} typing...
              </span>
            </div>
          </div>

          <!-- Connection Status -->
          <div v-if="!isConnected" class="connection-status">
            <v-alert
              :type="connectionError ? 'error' : 'warning'"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              <template v-if="connectionError">
                Connection Error: {{ connectionError }}
              </template>
              <template v-else>
                Connecting to chat...
              </template>
            </v-alert>
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
                @input="handleTypingInput"
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
              <span class="section-title">Online ({{ onlineMembers.length }})</span>
            </div>
            <div 
              v-for="memberId in onlineMembers" 
              :key="memberId"
              class="member-item online"
            >
              <v-avatar size="32" :color="getUserColor(memberId)">
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>
              <div class="member-info">
                <span class="member-name">{{ getSenderName(memberId) }}</span>
                <span class="member-role">{{ projectMembers.find(m => m.id === memberId)?.role || 'Member' }}</span>
              </div>
              <div class="online-indicator"></div>
            </div>
          </div>

          <!-- Offline Members -->
          <div class="member-section">
            <div class="section-header">
              <span class="section-title">Offline ({{ offlineMembers.length }})</span>
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
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { 
  initializeWebSocket, 
  cleanupWebSocket, 
  joinRoom as wsJoinRoom, 
  leaveRoom as wsLeaveRoom, 
  sendTypingStart, 
  sendTypingStop,
  sendReaction,
  on as wsOn,
  off as wsOff,
  isConnected,
  connectionError
} from '@/services/websocket';

// Types
interface ChatRoom {
  id: string;
  roomName: string;
  roomType: string;
  projectId?: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  content: string;
  attachments: string[];
  reactions: { [emoji: string]: string[] };
  reply_to?: string;
  edited: boolean;
  timestamp: number;
  sender_user_id: string;
  senderId?: string; // For compatibility
  type?: string; // For compatibility
  messageType?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  online: boolean;
}

// Reactive data
const selectedRoom = ref<ChatRoom | null>(null);
const showProjectsSidebar = ref(true);
const showMembersSidebar = ref(false);
const showChatSettings = ref(false);
const newMessage = ref('');
const currentUserId = ref('user-1'); // This should come from auth
const sidebarWidth = ref(280);

// Real-time states
const isTyping = ref(false);
const typingUsers = ref<string[]>([]);
const typingTimeout = ref<NodeJS.Timeout | null>(null);

// API data
const chatRooms = ref<ChatRoom[]>([]);
const currentMessages = ref<ChatMessage[]>([]);
const onlineMembers = ref<string[]>([]);
const projectMembers = ref<TeamMember[]>([]);
const unreadCounts = ref<{ [roomId: string]: number }>({});

// Loading states
const loadingRooms = ref(false);
const loadingMessages = ref(false);
const error = ref<string | null>(null);

// Auth store
const authStore = useAuthStore();

// API Base URL
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = authStore.user?.token || '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Computed properties
const offlineMembers = computed(() => {
  return projectMembers.value.filter(member => !member.online);
});

// API Methods
const fetchChatRooms = async () => {
  try {
    loadingRooms.value = true;
    error.value = null;
    
    const response = await fetch(`${API_BASE}/api/chat/rooms`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch chat rooms: ${response.statusText}`);
    }
    
    chatRooms.value = await response.json();
    
    // Filter to only show project rooms
    chatRooms.value = chatRooms.value.filter(room => room.roomType === 'project');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch chat rooms';
    console.error('Error fetching chat rooms:', err);
  } finally {
    loadingRooms.value = false;
  }
};

const fetchMessages = async (roomId: string) => {
  try {
    loadingMessages.value = true;
    error.value = null;
    
    const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/messages`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentMessages.value = data.messages;
    
    // Clear unread count for this room
    unreadCounts.value[roomId] = 0;
    
    nextTick(() => {
      scrollToBottom();
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch messages';
    console.error('Error fetching messages:', err);
  } finally {
    loadingMessages.value = false;
  }
};

const fetchOnlineMembers = async (roomId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/online`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch online members: ${response.statusText}`);
    }
    
    const data = await response.json();
    onlineMembers.value = data.online;
    
    // Update project members online status
    projectMembers.value.forEach(member => {
      member.online = onlineMembers.value.includes(member.id);
    });
  } catch (err) {
    console.error('Error fetching online members:', err);
  }
};

const fetchUnreadCount = async (roomId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/unread`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch unread count: ${response.statusText}`);
    }
    
    const data = await response.json();
    unreadCounts.value[roomId] = data.count;
  } catch (err) {
    console.error('Error fetching unread count:', err);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedRoom.value) return;
  
  try {
    const response = await fetch(`${API_BASE}/api/chat/rooms/${selectedRoom.value.id}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: newMessage.value.trim(),
        messageType: 'text'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }
    
    // Message will be received via WebSocket, so we just clear the input
    newMessage.value = '';
    
    // Stop typing indicator
    if (isTyping.value) {
      sendTypingStop(selectedRoom.value.id);
      isTyping.value = false;
    }
    
  } catch (err) {
    console.error('Error sending message:', err);
    error.value = err instanceof Error ? err.message : 'Failed to send message';
  }
};

const joinRoom = async (roomId: string) => {
  try {
    const response = await fetch(`${API_BASE}/api/chat/rooms/${roomId}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to join room: ${response.statusText}`);
    }
  } catch (err) {
    console.error('Error joining room:', err);
  }
};

const resetUnreadCount = async (roomId: string) => {
  try {
    await fetch(`${API_BASE}/api/chat/rooms/${roomId}/unread/reset`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    unreadCounts.value[roomId] = 0;
  } catch (err) {
    console.error('Error resetting unread count:', err);
  }
};

// WebSocket Event Handlers
const handleNewMessage = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const newMsg: ChatMessage = {
      id: data.id,
      content: data.content,
      attachments: data.attachments || [],
      reactions: data.reactions || {},
      reply_to: data.reply_to,
      edited: data.edited || false,
      timestamp: data.timestamp,
      sender_user_id: data.sender_user_id,
      messageType: data.messageType || 'text'
    };
    
    currentMessages.value.push(newMsg);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleUserJoined = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      content: `${getSenderName(data.userId)} joined the chat`,
      attachments: [],
      reactions: {},
      edited: false,
      timestamp: Date.now(),
      sender_user_id: 'system',
      messageType: 'system'
    };
    
    currentMessages.value.push(systemMessage);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleUserLeft = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      content: `${getSenderName(data.userId)} left the chat`,
      attachments: [],
      reactions: {},
      edited: false,
      timestamp: Date.now(),
      sender_user_id: 'system',
      messageType: 'system'
    };
    
    currentMessages.value.push(systemMessage);
    nextTick(() => {
      scrollToBottom();
    });
  }
};

const handleTypingStart = (data: any) => {
  if (data.roomId === selectedRoom.value?.id && data.userId !== currentUserId.value) {
    if (!typingUsers.value.includes(data.userId)) {
      typingUsers.value.push(data.userId);
    }
  }
};

const handleTypingStop = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const index = typingUsers.value.indexOf(data.userId);
    if (index > -1) {
      typingUsers.value.splice(index, 1);
    }
  }
};

const handleOnlineUpdate = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    onlineMembers.value = data.online;
    
    // Update project members online status
    projectMembers.value.forEach(member => {
      member.online = onlineMembers.value.includes(member.id);
    });
  }
};

const handleReaction = (data: any) => {
  if (data.roomId === selectedRoom.value?.id) {
    const message = currentMessages.value.find(msg => msg.id === data.messageId);
    if (message) {
      if (!message.reactions) {
        message.reactions = {};
      }
      if (!message.reactions[data.emoji]) {
        message.reactions[data.emoji] = [];
      }
      
      if (!message.reactions[data.emoji].includes(data.userId)) {
        message.reactions[data.emoji].push(data.userId);
      }
    }
  }
};

// Methods
const selectRoom = async (room: ChatRoom) => {
  // Leave previous room if any
  if (selectedRoom.value) {
    wsLeaveRoom(selectedRoom.value.id);
  }
  
  selectedRoom.value = room;
  
  // Join the new room via WebSocket
  wsJoinRoom(room.id);
  
  // Fetch messages and online members
  await Promise.all([
    fetchMessages(room.id),
    fetchOnlineMembers(room.id),
    resetUnreadCount(room.id)
  ]);
};

const getProjectColor = (type: string) => {
  switch (type) {
    case 'project': return 'primary';
    case 'direct': return 'success';
    case 'group': return 'warning';
    default: return 'grey';
  }
};

const getProjectIcon = (type: string) => {
  switch (type) {
    case 'project': return 'mdi-folder';
    case 'direct': return 'mdi-account';
    case 'group': return 'mdi-account-group';
    default: return 'mdi-folder';
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
  return member ? member.name : `User ${senderId}`;
};

const formatMessageTime = (timestamp: number) => {
  const now = Date.now();
  const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  return new Date(timestamp).toLocaleDateString();
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

const getUnreadCount = (roomId: string) => {
  return unreadCounts.value[roomId] || 0;
};

const getLastMessage = (roomId: string) => {
  // This would need to be implemented with a separate API call
  // or stored in the room data
  return 'No messages yet';
};

// Typing indicator functions
const handleTypingInput = () => {
  if (!selectedRoom.value) return;
  
  if (!isTyping.value) {
    isTyping.value = true;
    sendTypingStart(selectedRoom.value.id);
  }
  
  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
  
  // Set new timeout to stop typing indicator
  typingTimeout.value = setTimeout(() => {
    if (isTyping.value) {
      sendTypingStop(selectedRoom.value!.id);
      isTyping.value = false;
    }
  }, 3000); // Stop typing after 3 seconds of inactivity
};

// Add reaction to message
const addReaction = (messageId: string, emoji: string) => {
  if (selectedRoom.value) {
    sendReaction(selectedRoom.value.id, messageId, emoji);
  }
};

// Watch for room changes to scroll to bottom
watch(selectedRoom, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

onMounted(async () => {
  // Initialize WebSocket connection
  initializeWebSocket();
  
  // Set up WebSocket event listeners
  wsOn('new_message', handleNewMessage);
  wsOn('user_joined', handleUserJoined);
  wsOn('user_left', handleUserLeft);
  wsOn('typing_start', handleTypingStart);
  wsOn('typing_stop', handleTypingStop);
  wsOn('online_update', handleOnlineUpdate);
  wsOn('reaction', handleReaction);
  
  await fetchChatRooms();
  
  // Initialize with dummy team members for now
  // In real implementation, this would come from project API
  projectMembers.value = [
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
  ];
});

onUnmounted(() => {
  // Clean up WebSocket listeners
  wsOff('new_message', handleNewMessage);
  wsOff('user_joined', handleUserJoined);
  wsOff('user_left', handleUserLeft);
  wsOff('typing_start', handleTypingStart);
  wsOff('typing_stop', handleTypingStop);
  wsOff('online_update', handleOnlineUpdate);
  wsOff('reaction', handleReaction);
  
  // Leave current room if any
  if (selectedRoom.value) {
    wsLeaveRoom(selectedRoom.value.id);
  }
  
  // Clean up typing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value);
  }
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

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}

.error-text {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin-top: 0.5rem;
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

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--erp-text);
  opacity: 0.7;
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

.message-reactions {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.reaction-chip {
  font-size: 0.75rem !important;
  height: 24px !important;
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

/* Typing Indicator */
.typing-indicator {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
}

.typing-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--erp-text);
  opacity: 0.6;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  font-style: italic;
}

/* Connection Status */
.connection-status {
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--erp-border);
  background: var(--erp-surface);
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