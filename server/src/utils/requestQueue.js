/**
 * Request Queue for AI API Calls
 * Throttles requests to stay within rate limits
 */

class RequestQueue {
    constructor(options = {}) {
        this.queue = [];
        this.processing = false;
        this.requestsPerMinute = options.requestsPerMinute || 10;
        this.minDelay = options.minDelay || 1000; // Min 1 second between requests
        this.lastRequestTime = 0;
        this.requestCount = 0;
        this.windowStart = Date.now();
    }

    /**
     * Add a request to the queue
     */
    async enqueue(requestFn, priority = 'normal') {
        return new Promise((resolve, reject) => {
            const request = {
                fn: requestFn,
                priority: priority === 'high' ? 1 : 0,
                resolve,
                reject,
                timestamp: Date.now()
            };

            // Add to queue based on priority
            if (priority === 'high') {
                this.queue.unshift(request);
            } else {
                this.queue.push(request);
            }

            console.log(`📥 Added request to queue (${this.queue.length} pending, priority: ${priority})`);

            // Start processing if not already
            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    /**
     * Process queued requests with throttling
     */
    async processQueue() {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            // Check if we need to reset the window
            const now = Date.now();
            if (now - this.windowStart >= 60000) {
                this.requestCount = 0;
                this.windowStart = now;
            }

            // If we've hit the rate limit, wait for the window to reset
            if (this.requestCount >= this.requestsPerMinute) {
                const waitTime = 60000 - (now - this.windowStart);
                console.log(`⏸️ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s before next request...`);
                await this.sleep(waitTime);
                this.requestCount = 0;
                this.windowStart = Date.now();
            }

            // Ensure minimum delay between requests
            const timeSinceLastRequest = Date.now() - this.lastRequestTime;
            if (timeSinceLastRequest < this.minDelay) {
                await this.sleep(this.minDelay - timeSinceLastRequest);
            }

            // Get next request (already sorted by priority)
            const request = this.queue.shift();
            
            try {
                console.log(`⚡ Processing request (${this.queue.length} remaining)`);
                const result = await request.fn();
                this.lastRequestTime = Date.now();
                this.requestCount++;
                request.resolve(result);
            } catch (error) {
                console.error(`❌ Request failed:`, error.message);
                request.reject(error);
            }
        }

        this.processing = false;
        console.log(`✅ Queue processed. All requests completed.`);
    }

    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get queue status
     */
    getStatus() {
        return {
            queueLength: this.queue.length,
            processing: this.processing,
            requestsInWindow: this.requestCount,
            maxRequestsPerMinute: this.requestsPerMinute,
            windowStarted: new Date(this.windowStart).toISOString(),
            lastRequest: this.lastRequestTime ? new Date(this.lastRequestTime).toISOString() : null
        };
    }

    /**
     * Clear the queue
     */
    clear() {
        const count = this.queue.length;
        this.queue = [];
        console.log(`🗑️ Cleared ${count} pending requests from queue`);
        return count;
    }
}

// Create singleton instance
const requestQueue = new RequestQueue({
    requestsPerMinute: 12, // Slightly below Gemini's 15/min limit for safety
    minDelay: 2000 // 2 seconds between requests minimum
});

module.exports = requestQueue;
