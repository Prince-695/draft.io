// Kafka Consumer - Listens to events and creates notifications

import { Kafka, Consumer } from 'kafkajs';
import { io } from '../index';
import { sendNotificationToUser } from '../controllers/socket.controller';
import * as NotificationModel from '../models/notification.model';

const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const consumer: Consumer = kafka.consumer({
  groupId: process.env.KAFKA_GROUP_ID || 'notification-service'
});

export const startKafkaConsumer = async () => {
  await consumer.connect();
  
  // Subscribe to relevant topics
  await consumer.subscribe({
    topics: [
      'user.followed',
      'blog.liked',
      'blog.commented',
      'comment.replied'
    ],
    fromBeginning: false
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value?.toString() || '{}');
        console.log(`📨 Received event: ${topic}`, event);

        let notification;

        // Handle different event types
        switch (topic) {
          case 'user.followed':
            notification = await NotificationModel.createNotification(
              event.followedUserId, // Recipient
              'follow',
              'New Follower',
              `${event.followerUsername} started following you`,
              event.followerId, // Actor
              undefined,
              undefined
            );
            break;

          case 'blog.liked':
            notification = await NotificationModel.createNotification(
              event.authorId, // Blog author receives notification
              'like',
              'New Like',
              `${event.username} liked your blog: "${event.blogTitle}"`,
              event.userId, // Who liked
              'blog',
              event.blogId
            );
            break;

          case 'blog.commented':
            notification = await NotificationModel.createNotification(
              event.authorId, // Blog author receives notification
              'comment',
              'New Comment',
              `${event.username} commented on your blog: "${event.blogTitle}"`,
              event.userId, // Who commented
              'blog',
              event.blogId
            );
            break;

          case 'comment.replied':
            notification = await NotificationModel.createNotification(
              event.parentCommentAuthorId, // Original commenter
              'reply',
              'New Reply',
              `${event.username} replied to your comment`,
              event.userId, // Who replied
              'comment',
              event.commentId
            );
            break;
        }

        // Send real-time notification via WebSocket
        if (notification) {
          sendNotificationToUser(io, notification.user_id, notification);
        }
      } catch (error) {
        console.error('Error processing Kafka message:', error);
      }
    }
  });

  console.log('✅ Kafka consumer listening for events');
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  await consumer.disconnect();
});
