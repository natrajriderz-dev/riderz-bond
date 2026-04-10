// ============================================
// Suyavaraa Fish Trap - Decoy Request Scheduler
// ============================================
// Background job to automatically send decoy requests to unverified users
// Runs every 2 days to maintain engagement and monitoring

const fishTrapService = require('../services/fishTrapService');

class DecoyRequestScheduler {
  constructor() {
    this.intervalId = null;
    this.intervalMs = 2 * 24 * 60 * 60 * 1000; // 2 days in milliseconds
    this.isRunning = false;
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Decoy request scheduler is already running');
      return;
    }

    console.log('Starting decoy request scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.runJob();

    // Then run every 2 days
    this.intervalId = setInterval(() => {
      this.runJob();
    }, this.intervalMs);
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Decoy request scheduler stopped');
  }

  // Run the job manually (for testing)
  async runNow() {
    console.log('Running decoy request scheduler manually...');
    return await this.runJob();
  }

  // Execute the job
  async runJob() {
    try {
      console.log('🔄 Running decoy request scheduler job...');

      const result = await fishTrapService.sendAutoDecoyRequests();

      if (result.success) {
        console.log(`✅ Decoy request scheduler completed successfully. Sent ${result.requestsSent} requests.`);
      } else {
        console.error('❌ Decoy request scheduler failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Decoy request scheduler error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.intervalMs,
      nextRun: this.isRunning ? new Date(Date.now() + this.intervalMs) : null
    };
  }
}

// Export singleton instance
const decoyRequestScheduler = new DecoyRequestScheduler();
module.exports = decoyRequestScheduler;