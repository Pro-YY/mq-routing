const Promise = require('bluebird');
const amqp = require('amqplib');
const config = require('./config');

const topExchange = config.TOP_EXCHANGE;
const queue = config.WORKER_QUEUE;
const workerQueueRouteKey = config.WORKER_QUEUE_ROUTE_KEY;
const open = amqp.connect('amqp://localhost');

// as publisher
let channel; // init publish channel
function init() {
  return Promise.resolve(true).then(() => {
    return open.then((conn) => {
      return conn.createChannel();
    }).then((ch) => {
      ch.assertExchange(topExchange, 'direct', {durable: false});
      channel = ch;
    });
  });
}

// as consumer
open.then((conn) => {
  return conn.createChannel();
}).then((ch) => {
  return ch.assertQueue(queue).then((result) => {
    console.log(result);
    // bind listen queue to exchange with route key
    ch.bindQueue(queue, topExchange, workerQueueRouteKey);
    return ch.consume(queue, (msg) => {
      if (msg !== null) {
        console.log('[C]worker_queue: Recv ' + msg.content.toString());
        doWork(msg);
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);

function doWork(msg) {
  const manageQueueRouteKey = config.MANAGE_QUEUE_ROUTE_KEY;
  let manageMessage = msg.content.toString() + ' (worker done)';
  console.log('[P]worker: Send to manager ' + manageMessage);
  channel.publish(topExchange, manageQueueRouteKey, Buffer.from(manageMessage));
}

init();
