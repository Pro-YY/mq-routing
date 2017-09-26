const Promise = require('bluebird');
const amqp = require('amqplib');
const config = require('./config');

const topExchange = config.TOP_EXCHANGE;
const assistQueueRouteKey = config.ASSIST_QUEUE_ROUTE_KEY;
const queue = config.ASSIST_QUEUE;
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
    ch.bindQueue(queue, topExchange, assistQueueRouteKey);
    return ch.consume(queue, (msg) => {
      if (msg !== null) {
        console.log('[C]assist_queue: Recv ' + msg.content.toString());
        doAssist(msg);
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);

function doAssist(msg) {
  const workerQueueRouteKey = config.WORKER_QUEUE_ROUTE_KEY;
  let workerMessage = msg.content.toString() + ' (assist done)';
  console.log('[P]worker: Send to worker ' + workerMessage);
  channel.publish(topExchange, workerQueueRouteKey, Buffer.from(workerMessage));
}

init();
