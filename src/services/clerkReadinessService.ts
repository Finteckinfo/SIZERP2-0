import { ref, computed } from 'vue';

export interface ClerkStatus {
  isReady: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  progress: number;
  progressText: string;
  loadingTitle: string;
  loadingSubtitle: string;
  tipText: string;
}

class ClerkReadinessService {
  private static instance: ClerkReadinessService;
  private status = ref<ClerkStatus>({
    isReady: false,
    isLoading: true,
    hasError: false,
    progress: 0,
    progressText: 'Initializing...',
    loadingTitle: 'Setting up your secure session',
    loadingSubtitle: 'Please wait while we authenticate you...',
    tipText: 'This usually takes just a few seconds'
  });

  private maxWaitTime = 15000; // 15 seconds max wait
  private checkInterval = 100; // Check every 100ms
  private startTime = Date.now();
  private checkTimer?: NodeJS.Timeout;

  public static getInstance(): ClerkReadinessService {
    if (!ClerkReadinessService.instance) {
      ClerkReadinessService.instance = new ClerkReadinessService();
    }
    return ClerkReadinessService.instance;
  }

  public getStatus() {
    return this.status.value;
  }

  public async waitForClerk(): Promise<boolean> {
    return new Promise((resolve) => {
      this.startTime = Date.now();
      this.status.value.isLoading = true;
      this.status.value.hasError = false;
      this.status.value.progress = 0;

      this.checkTimer = setInterval(() => {
        this.updateProgress();
        
        if (this.isClerkReady()) {
          this.status.value.isReady = true;
          this.status.value.isLoading = false;
          this.status.value.progress = 100;
          this.status.value.progressText = 'Ready!';
          this.clearTimer();
          resolve(true);
        } else if (this.hasTimedOut()) {
          this.handleTimeout();
          this.clearTimer();
          resolve(false);
        }
      }, this.checkInterval);
    });
  }

  public retry(): Promise<boolean> {
    this.status.value.hasError = false;
    this.status.value.isLoading = true;
    this.status.value.progress = 0;
    this.status.value.progressText = 'Retrying...';
    this.status.value.loadingTitle = 'Retrying authentication';
    this.status.value.loadingSubtitle = 'Please wait while we try again...';
    this.status.value.tipText = 'Sometimes a retry helps with connection issues';
    
    return this.waitForClerk();
  }

  private isClerkReady(): boolean {
    return !!(
      window.Clerk &&
      window.Clerk.session &&
      window.Clerk.user &&
      window.Clerk.user.id
    );
  }

  private hasTimedOut(): boolean {
    return Date.now() - this.startTime > this.maxWaitTime;
  }

  private updateProgress(): void {
    const elapsed = Date.now() - this.startTime;
    const progressPercent = Math.min((elapsed / this.maxWaitTime) * 100, 95);
    
    this.status.value.progress = Math.round(progressPercent);
    
    // Update progress text based on elapsed time
    if (elapsed < 2000) {
      this.status.value.progressText = 'Loading Clerk...';
      this.status.value.loadingSubtitle = 'Initializing authentication system...';
    } else if (elapsed < 5000) {
      this.status.value.progressText = 'Authenticating...';
      this.status.value.loadingSubtitle = 'Verifying your session...';
    } else if (elapsed < 10000) {
      this.status.value.progressText = 'Syncing with backend...';
      this.status.value.loadingSubtitle = 'Connecting to our servers...';
    } else {
      this.status.value.progressText = 'Almost ready...';
      this.status.value.loadingSubtitle = 'Finalizing your session...';
    }
  }

  private handleTimeout(): void {
    this.status.value.isLoading = false;
    this.status.value.hasError = true;
    this.status.value.isReady = false;
    this.status.value.progress = 100;
    this.status.value.progressText = 'Timeout';
    this.status.value.loadingTitle = 'Authentication Timeout';
    this.status.value.loadingSubtitle = 'The authentication process took longer than expected.';
    this.status.value.tipText = 'Try refreshing the page or check your internet connection';
    this.status.value.errorMessage = 'Authentication timeout after 15 seconds';
    
    console.error('🚨 Clerk authentication timeout');
  }

  private clearTimer(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = undefined;
    }
  }

  public destroy(): void {
    this.clearTimer();
  }
}

export const clerkReadinessService = ClerkReadinessService.getInstance();
