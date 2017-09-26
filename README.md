Implementation of Routable Working Queues, with rabbitmq.

start multiple *manager*(at least one top), *assist* and *worker* nodes.

job workflow: manager -> assist -> worker -> manager

NOTE:

The producer **never** sends any messages directly to a queue, send to exchange. 发消息不需要队列。

The consumer receives message from its own queue.

每个节点都由两个通道完成消息的收（通过指定路由键将自己关注的队列绑定到中心交换机）、发（发向交换机，指定路由键）。
并合作完成流程。
