const Promise = require('bluebird');
const amqp = require('amqplib');
const config = require('./config');

const topExchange = config.TOP_EXCHANGE;
const queue = config.WORKER_QUEUE;
const workerQueueRouteKey = config.WORKER_QUEUE_ROUTE_KEY;
const open = amqp.connect('amqp://localhost');

// as consumer
open.then((conn) => {
  return conn.createChannel();
}).then((ch) => {
  return ch.assertQueue(queue).then((result) => {
    console.log(result);
    ch.bindQueue(queue, topExchange, workerQueueRouteKey);
    return ch.consume(queue, (msg) => {
      if (msg !== null) {
        console.log('[C]worker_queue: Recv ' + msg.content.toString());
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);
