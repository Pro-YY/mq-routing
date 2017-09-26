const Promise = require('bluebird');
const amqp = require('amqplib');
const config = require('./config');

const topExchange = config.TOP_EXCHANGE;

const queue = config.MANAGE_QUEUE;

const open = amqp.connect('amqp://localhost');
let channel;

// Publisher
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
  return ch.assertQueue(queue).then((ok) => {
    return ch.consume(queue, (msg) => {
      if (msg !== null) {
        console.log('[C]manage_queue: Recv ' + msg.content.toString());
        ch.ack(msg);
      }
    });
  });
}).catch(console.warn);


// main
function main() {
  // start demo workload
  const workerQueueRouteKey = config.WORKER_QUEUE_ROUTE_KEY;
  const assistQueueRouteKey = config.ASSIST_QUEUE_ROUTE_KEY;
  init().then(() => {
    setInterval(() => {
      let d = new Date();
      let workerMessage = d.getSeconds() * 10;
      let assistMessage = d.getSeconds();
      console.log('[P]manage_queue: Send to worker ' + workerMessage);
      channel.publish(topExchange, workerQueueRouteKey, Buffer.from(JSON.stringify(workerMessage)));
      console.log('[P]manage_queue: Send to assist ' + assistMessage);
      channel.publish(topExchange, assistQueueRouteKey, Buffer.from(JSON.stringify(assistMessage)));
    }, 3 * 1000);
  });
}

main();
