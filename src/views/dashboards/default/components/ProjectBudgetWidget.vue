<template>
  <v-card class="budget-widget" elevation="0">
    <v-card-text>
      <div class="widget-header">
        <div class="header-icon">
          <v-icon color="primary" size="32">mdi-wallet</v-icon>
        </div>
        <div class="header-content">
          <h3 class="widget-title text-center">Escrow Overview</h3>
          <p class="widget-subtitle text-center">Live payouts across every project</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <v-skeleton-loader type="list-item-three-line" />
      </div>

      <!-- Budget Summary -->
      <div v-else-if="projectSummaries.length > 0" class="budget-summary">
        <div 
          v-for="project in projectSummaries" 
          :key="project.projectId"
          class="project-budget-item"
          @click="navigateToProject(project.projectId)"
        >
          <div class="project-info">
            <h4 class="project-name">{{ project.projectName }}</h4>
            <div class="budget-details">
              <div class="budget-row">
                <span class="budget-label">Escrow Balance:</span>
                <span class="budget-value total">{{ formatAmount(project.balance) }} SIZ</span>
              </div>
              <div class="budget-row">
                <span class="budget-label">Assigned:</span>
                <span class="budget-value allocated">{{ formatAmount(project.assigned) }} SIZ</span>
              </div>
              <div class="budget-row">
                <span class="budget-label">Pending:</span>
                <span class="budget-value pending">{{ formatAmount(project.pending) }} SIZ</span>
              </div>
              <div class="budget-row">
                <span class="budget-label">Processing:</span>
                <span class="budget-value processing">{{ formatAmount(project.processing) }} SIZ</span>
              </div>
              <div class="budget-row">
                <span class="budget-label">Paid Out:</span>
                <span class="budget-value released">{{ formatAmount(project.paid) }} SIZ</span>
              </div>
              <div class="budget-row">
                <span class="budget-label">Team Members Paid:</span>
                <span class="budget-value recipients">{{ project.totalRecipients }}</span>
              </div>
            </div>
            
            <div class="budget-progress">
              <v-chip size="small" color="primary" variant="tonal">
                Oversight Paid: {{ formatAmount(project.oversightPaid) }} SIZ
              </v-chip>
            </div>
          </div>

          <!-- Action Button -->
          <v-btn
            size="small"
            color="primary"
            variant="outlined"
            @click.stop="addFunds(project.projectId)"
          >
            <v-icon start size="16">mdi-plus</v-icon>
            Add Funds
          </v-btn>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <v-icon size="48" color="grey-lighten-2">mdi-wallet-outline</v-icon>
        <p class="text-body-2 text-medium-emphasis mt-2">
          No escrow activity yet
        </p>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getProjectPaymentSummary } from '@/services/paymentService';

// Composables
const router = useRouter();
// Props
interface Props {
  projectIds: string[];
}

const props = defineProps<Props>();

// Reactive data
const loading = ref(true);
const projectSummaries = ref<Array<{
  projectId: string;
  projectName: string;
  balance: number;
  assigned: number;
  pending: number;
  processing: number;
  paid: number;
  oversightPaid: number;
  totalRecipients: number;
}>>([]);

// Load payout data for all projects
const loadSummaries = async () => {
  if (!props.projectIds || props.projectIds.length === 0) {
    loading.value = false;
    return;
  }
  
  try {
    loading.value = true;
    
    // Fetch budget data for each project
    const summaryPromises = props.projectIds.map(async (projectId) => {
      try {
        const summary = await getProjectPaymentSummary(projectId);
        return {
          projectId,
          projectName: summary.projectName || projectId,
          balance: summary.escrow.balance,
          assigned: summary.payouts.totals.assigned,
          pending: summary.payouts.totals.pending,
          processing: summary.payouts.totals.processing,
          paid: summary.payouts.totals.paid,
          oversightPaid: summary.payouts.totals.oversight.paid,
          totalRecipients: summary.payouts.totalRecipients,
        };
      } catch (error) {
        console.error(`Failed to load budget for project ${projectId}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(summaryPromises);
    projectSummaries.value = results.filter((b): b is NonNullable<typeof b> => b !== null);
  } catch (error) {
    console.error('Failed to load project payouts:', error);
  } finally {
    loading.value = false;
  }
};

// Helper functions
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

const navigateToProject = (projectId: string) => {
  router.push(`/projects/${projectId}`);
};

const addFunds = (projectId: string) => {
  // Open add funds modal or navigate to funding page
  router.push(`/projects/${projectId}/funding`);
};

// Lifecycle
onMounted(() => {
  loadSummaries();
});
</script>

<style scoped>
.budget-widget {
  background: var(--erp-surface);
  border: 1px solid var(--erp-border);
  border-radius: 16px;
  height: 100%;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
  text-align: center;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  border-radius: 12px;
}

.header-content {
  flex: 1;
}

.widget-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0;
}

.widget-subtitle {
  font-size: 0.875rem;
  color: var(--erp-text);
  opacity: 0.7;
  margin: 0;
}

.budget-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-budget-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  background: var(--erp-page-bg);
  border: 1px solid var(--erp-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.project-budget-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--erp-text);
  margin: 0 0 12px 0;
}

.budget-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.budget-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.budget-label {
  color: var(--erp-text);
  opacity: 0.7;
}

.budget-value {
  font-weight: 600;
  color: var(--erp-text);
}

.budget-value.total {
  color: var(--erp-accent-blue);
}

.budget-value.allocated {
  color: var(--erp-accent-orange);
}

.budget-value.released {
  color: var(--erp-text);
  opacity: 0.6;
}

.budget-value.pending {
  color: var(--erp-accent-orange);
}

.budget-value.processing {
  color: var(--erp-accent-blue);
}

.budget-value.recipients {
  color: var(--erp-accent-green);
}

.budget-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--erp-text);
  opacity: 0.7;
  text-align: right;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-state {
  padding: 24px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .budget-details {
    grid-template-columns: 1fr;
  }

  .project-budget-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

