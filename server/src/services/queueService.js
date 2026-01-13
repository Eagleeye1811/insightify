const PQueue = require('p-queue');

// Create a queue with concurrency 1 and interval to respect rate limits
// Rate limit: 1 request every 2000ms (2 seconds) to be safe
const queue = new PQueue.default({
    concurrency: 1,
    interval: 2000,
    intervalCap: 1
});

let activeJobs = 0;

queue.on('active', () => {
    activeJobs++;
    console.log(`Working on item. Size: ${queue.size}  Pending: ${queue.pending}`);
});

queue.on('idle', () => {
    activeJobs = 0;
    console.log('Queue is idle');
});

module.exports = {
    queue,
    addJob: (fn) => queue.add(fn)
};
