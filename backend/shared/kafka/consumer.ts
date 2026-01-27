// Kafka Consumer - Listens to events from Kafka topics
// Services use this to react to events from other services

import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import Logger from '../utils/logger';
import { KafkaEvent } from '../types';

const logger = new Logger('Kafka-Consumer');

// Type for the event handler function
type EventHandler<T = any> = (event: KafkaEvent<T>) => Promise<void>;

class KafkaConsumer {
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected: boolean = false;
  private handlers: Map<string, EventHandler> = new Map();

  constructor(groupId: string) {
    // groupId: identifies which service is consuming
    // Example: 'notification-service', 'recommendation-service'
    this.kafka = new Kafka({
      clientId: 'draftio-backend',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.consumer = this.kafka.consumer({ groupId });
  }

  /**
   * Connect to Kafka
   */
  async connect(): Promise<void> {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      logger.success(`Kafka Consumer connected`);
    } catch (error) {
      logger.error('Failed to connect Kafka Consumer', error);
      throw error;
    }
  }

  /**
   * Subscribe to a topic and handle events
   * @param topic - Kafka topic to listen to
   * @param handler - Function to call when event arrives
   * @example
   * await consumer.subscribe('user.registered', async (event) => {
   *   console.log('New user:', event.data.email);
   * });
   */
  async subscribe(topic: string, handler: EventHandler): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Subscribe to the topic
      await this.consumer.subscribe({ topic, fromBeginning: false });
      
      // Store the handler
      this.handlers.set(topic, handler);
      
      logger.info(`Subscribed to topic: ${topic}`);

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });
    } catch (error) {
      logger.error(`Failed to subscribe to topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Handle incoming Kafka message
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, message } = payload;

    try {
      // Parse the JSON message
      const event = JSON.parse(message.value?.toString() || '{}') as KafkaEvent;

      logger.info(`Received event from topic: ${topic}`, {
        event_type: event.event_type,
      });

      // Get the handler for this topic
      const handler = this.handlers.get(topic);

      if (handler) {
        // Call the handler function
        await handler(event);
      } else {
        logger.warn(`No handler found for topic: ${topic}`);
      }
    } catch (error) {
      logger.error(`Error processing message from topic: ${topic}`, error);
    }
  }

  /**
   * Disconnect from Kafka
   */
  async disconnect(): Promise<void> {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      logger.info('Kafka Consumer disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka Consumer', error);
    }
  }
}

export default KafkaConsumer;
