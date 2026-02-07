import { Kafka, Consumer } from 'kafkajs';
import recommendationModel from '../models/recommendation.model';

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'recommendation-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
});

let consumer: Consumer;

export const initKafkaConsumer = async () => {
  try {
    consumer = kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID || 'recommendation-service-group',
    });

    await consumer.connect();
    console.log('✅ Kafka consumer connected');

    // Subscribe to relevant topics
    await consumer.subscribe({
      topics: ['blog.published', 'blog.liked', 'blog.commented', 'user.followed'],
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;

          const event = JSON.parse(value);
          console.log(`📨 Received event from ${topic}:`, event);

          switch (topic) {
            case 'blog.published':
              await handleBlogPublished(event);
              break;
            case 'blog.liked':
              await handleBlogLiked(event);
              break;
            case 'blog.commented':
              await handleBlogCommented(event);
              break;
            case 'user.followed':
              await handleUserFollowed(event);
              break;
            default:
              console.log(`Unknown topic: ${topic}`);
          }
        } catch (error) {
          console.error('Error processing Kafka message:', error);
        }
      },
    });

    console.log('✅ Kafka consumer running');
  } catch (error) {
    console.error('❌ Failed to initialize Kafka consumer:', error);
  }
};

/**
 * Handle blog published event
 */
async function handleBlogPublished(event: any) {
  const { blogId, authorId, tags } = event;
  console.log(`New blog published: ${blogId} by ${authorId}`);
  
  // Update author's content patterns (for collaborative filtering)
  if (tags && tags.length > 0) {
    await recommendationModel.updateUserInterests(authorId, tags);
  }
}

/**
 * Handle blog liked event
 */
async function handleBlogLiked(event: any) {
  const { blogId, userId, tags } = event;
  console.log(`User ${userId} liked blog ${blogId}`);
  
  // Track as implicit read
  await recommendationModel.trackRead(userId, blogId, 0);
  
  // Update user interests based on liked blog tags
  if (tags && tags.length > 0) {
    await recommendationModel.updateUserInterests(userId, tags);
  }
}

/**
 * Handle blog commented event
 */
async function handleBlogCommented(event: any) {
  const { blogId, userId, tags } = event;
  console.log(`User ${userId} commented on blog ${blogId}`);
  
  // Track as implicit read with higher weight
  await recommendationModel.trackRead(userId, blogId, 0);
  
  // Update user interests with higher weight for commented blogs
  if (tags && tags.length > 0) {
    await recommendationModel.updateUserInterests(userId, tags);
  }
}

/**
 * Handle user followed event
 */
async function handleUserFollowed(event: any) {
  const { followerId, followingId } = event;
  console.log(`User ${followerId} followed ${followingId}`);
  
  // This can be used for social-based recommendations in the future
  // For now, just log it
}

export const disconnectKafka = async () => {
  if (consumer) {
    await consumer.disconnect();
    console.log('✅ Kafka consumer disconnected');
  }
};
