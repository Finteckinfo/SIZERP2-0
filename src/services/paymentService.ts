// Payment Service - Handles all escrow and payment API calls
import { api } from './projectApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// ============================================
// SIZCOIN ASSET CONFIGURATION
// ============================================
/**
 * SIZCOIN - The official project token
 * Asset ID: 2905622564
 * Created on Algorand MainNet at Block #48747393
 */
export const SIZCOIN_CONFIG = {
  ASSET_ID: 2905622564,
  UNIT_NAME: 'SIZ',
  DECIMALS: 2,
  ASSET_URL: 'https://ipfs.io/ipfs/bafybeiex5cvfmggxjyjaxpdxevyhhzvrrsjw5xnee2ydw5metghl3y6fvq',
  CREATED_BLOCK: 48747393,
  DEFAULT_FROZEN: true,
} as const;

/**
 * Formats SIZCOIN amount with proper decimals
 * @param microAmount - Amount in micro units (1 SIZ = 100 micro units)
 */
export function formatSIZCOIN(microAmount: number): string {
  const sizAmount = microAmount / Math.pow(10, SIZCOIN_CONFIG.DECIMALS);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: SIZCOIN_CONFIG.DECIMALS,
    maximumFractionDigits: SIZCOIN_CONFIG.DECIMALS
  }).format(sizAmount);
}

/**
 * Converts SIZ to micro units for blockchain transactions
 * @param sizAmount - Amount in SIZ
 */
export function sizToMicroUnits(sizAmount: number): number {
  return Math.floor(sizAmount * Math.pow(10, SIZCOIN_CONFIG.DECIMALS));
}

/**
 * Converts micro units to SIZ
 * @param microAmount - Amount in micro units
 */
export function microUnitsToSiz(microAmount: number): number {
  return microAmount / Math.pow(10, SIZCOIN_CONFIG.DECIMALS);
}

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
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.perawallet.app/tx/'
    : 'https://testnet.explorer.perawallet.app/tx/';
  return baseUrl + txHash;
}

/**
 * Gets Algorand explorer URL for address
 */
export function getAddressExplorerUrl(address: string, network?: 'mainnet' | 'testnet'): string {
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.perawallet.app/address/'
    : 'https://testnet.explorer.perawallet.app/address/';
  return baseUrl + address;
}

/**
 * Gets SIZCOIN asset page on Algorand explorer
 */
export function getSIZCOINExplorerUrl(network?: 'mainnet' | 'testnet'): string {
  const currentNetwork = network || (localStorage.getItem('algorand_network') || 'testnet');
  const baseUrl = currentNetwork === 'mainnet' 
    ? 'https://explorer.perawallet.app/asset/'
    : 'https://testnet.explorer.perawallet.app/asset/';
  return baseUrl + SIZCOIN_CONFIG.ASSET_ID;
}

