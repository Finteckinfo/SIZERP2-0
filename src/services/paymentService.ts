// Payment Service - Handles all escrow and payment API calls
import { api } from './projectApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ============================================
// ESCROW MANAGEMENT
// ============================================

export interface EscrowAccount {
  escrowAddress: string;
  currentBalance: number;
  status: string;
}

export interface EscrowBalance {
  balance: number;
  allocated: number;
  released: number;
  available: number;
}

/**
 * Creates an Algorand escrow account for a project
 */
export async function createProjectEscrow(projectId: string): Promise<EscrowAccount> {
  const response = await api.post(`/projects/${projectId}/escrow/create`);
  return response.data;
}

/**
 * Records a deposit transaction to project escrow
 */
export async function depositToEscrow(projectId: string, txHash: string, amount: number) {
  const response = await api.post(`/projects/${projectId}/escrow/deposit`, {
    txHash,
    amount
  });
  return response.data;
}

/**
 * Gets current escrow balance for a project
 */
export async function getEscrowBalance(projectId: string): Promise<EscrowBalance> {
  const response = await api.get(`/projects/${projectId}/escrow/balance`);
  return response.data;
}

/**
 * Gets all escrow transactions for a project
 */
export async function getEscrowTransactions(projectId: string, filters?: {
  type?: string;
  status?: string;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  
  const response = await api.get(`/projects/${projectId}/escrow/transactions?${params}`);
  return response.data;
}

// ============================================
// TASK PAYMENTS
// ============================================

export interface TaskPaymentStatus {
  taskId: string;
  paymentAmount: number;
  paymentStatus: 'PENDING' | 'ALLOCATED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paidAt?: string;
  txHash?: string;
  confirmations?: number;
}

/**
 * Approves a task and triggers payment release
 */
export async function approveAndPayTask(taskId: string): Promise<{
  success: boolean;
  txHash?: string;
  jobId?: string;
  message: string;
}> {
  const response = await api.post(`/tasks/${taskId}/approve`);
  return response.data;
}

/**
 * Gets payment status for a specific task
 */
export async function getTaskPaymentStatus(taskId: string): Promise<TaskPaymentStatus> {
  const response = await api.get(`/tasks/${taskId}/payment-status`);
  return response.data;
}

// ============================================
// WALLET MANAGEMENT
// ============================================

export interface UserWalletInfo {
  walletAddress: string;
  verified: boolean;
  verifiedAt?: string;
}

/**
 * Verifies user owns the wallet address
 */
export async function verifyWallet(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ verified: boolean }> {
  const response = await api.post('/users/wallet/verify', {
    walletAddress,
    signature,
    message
  });
  return response.data;
}

/**
 * Gets current user's wallet info
 */
export async function getUserWallet(): Promise<UserWalletInfo | null> {
  const response = await api.get('/users/wallet');
  return response.data;
}

/**
 * Updates user's wallet address
 */
export async function updateUserWallet(walletAddress: string): Promise<UserWalletInfo> {
  const response = await api.patch('/users/wallet', { walletAddress });
  return response.data;
}

// ============================================
// TRANSACTIONS & ANALYTICS
// ============================================

export interface BlockchainTransaction {
  id: string;
  txHash: string;
  type: 'DEPOSIT' | 'TASK_PAYMENT' | 'REFUND' | 'WITHDRAWAL';
  amount: number;
  fee?: number;
  fromAddress: string;
  toAddress: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockNumber?: number;
  confirmations: number;
  note?: string;
  taskId?: string;
  taskTitle?: string;
  employeeName?: string;
  submittedAt: string;
  confirmedAt?: string;
}

/**
 * Gets transaction details by hash
 */
export async function getTransaction(txHash: string): Promise<BlockchainTransaction> {
  const response = await api.get(`/transactions/${txHash}`);
  return response.data;
}

/**
 * Gets user's earnings summary
 */
export async function getUserEarnings(userId: string): Promise<{
  total: number;
  pending: number;
  paid: number;
  processing: number;
  transactions: BlockchainTransaction[];
}> {
  const response = await api.get(`/users/${userId}/earnings`);
  return response.data;
}

/**
 * Gets payment summary for a project
 */
export async function getProjectPaymentSummary(projectId: string): Promise<{
  budget: {
    total: number;
    allocated: number;
    released: number;
    available: number;
    utilizationPercent: number;
  };
  employeeBreakdown: Array<{
    employeeId: string;
    employeeName: string;
    tasksCount: number;
    totalEarned: number;
    pending: number;
  }>;
  statusDistribution: {
    pending: number;
    allocated: number;
    processing: number;
    paid: number;
    failed: number;
  };
  recentTransactions: BlockchainTransaction[];
}> {
  const response = await api.get(`/projects/${projectId}/payment-summary`);
  return response.data;
}

/**
 * Gets all transactions for a project
 */
export async function getProjectTransactions(
  projectId: string,
  filters?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  transactions: BlockchainTransaction[];
  total: number;
  page: number;
  limit: number;
}> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  
  const response = await api.get(`/projects/${projectId}/transactions?${params}`);
  return response.data;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formats SIZCOIN amount with proper decimals
 */
export function formatSIZCOIN(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount) + ' SIZ';
}

/**
 * Gets payment status color for UI
 */
export function getPaymentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'grey',
    ALLOCATED: 'info',
    PROCESSING: 'warning',
    PAID: 'success',
    FAILED: 'error',
    REFUNDED: 'secondary'
  };
  return colors[status] || 'grey';
}

/**
 * Gets payment status label
 */
export function getPaymentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Not Allocated',
    ALLOCATED: 'Reserved',
    PROCESSING: 'Processing',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded'
  };
  return labels[status] || status;
}

/**
 * Gets Algorand explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, network?: 'mainnet' | 'testnet'): string {
  // Import network utils to get current network if not specified
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://algoexplorer.io/tx/'
    : 'https://testnet.algoexplorer.io/tx/';
  return baseUrl + txHash;
}

/**
 * Gets Algorand explorer URL for address
 */
export function getAddressExplorerUrl(address: string, network?: 'mainnet' | 'testnet'): string {
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://algoexplorer.io/address/'
    : 'https://testnet.algoexplorer.io/address/';
  return baseUrl + address;
}

