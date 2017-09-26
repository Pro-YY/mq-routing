module.exports = {
  TOP_EXCHANGE: 'top_exchange',
  MANAGE_QUEUE: 'manage_queue',   // scalable, not temporary(exclusive) queue used in P/S for fanout
  MANAGE_QUEUE_ROUTE_KEY: 'manage_queue_route_key',
  ASSIST_QUEUE: 'assist_queue',
  ASSIST_QUEUE_ROUTE_KEY: 'assist_queue_route_key',
  WORKER_QUEUE: 'worker_queue',
  WORKER_QUEUE_ROUTE_KEY: 'worker_queue_route_key',
};
