// Kafka Producer - Sends events to Kafka topics
// Any service can use this to publish events

import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import Logger from '../utils/logger';
import { KafkaEvent } from '../types';

const logger = new Logger('Kafka-Producer');

class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    // Create Kafka instance
    // clientId: identifies this application to Kafka
    // brokers: where Kafka is running (localhost:9092 for local dev)
    this.kafka = new Kafka({
      clientId: 'draftio-backend',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.producer = this.kafka.producer();
  }

  /**
   * Connect to Kafka
   * Must be called before sending any events
   */
  async connect(): Promise<void> {
    try {
      await this.producer.connect();
      this.isConnected = true;
      logger.success('Kafka Producer connected');
    } catch (error) {
      logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  /**
   * Send an event to a Kafka topic
   * @param topic - The Kafka topic name (e.g., 'user.registered')
   * @param event - The event data to send
   * @example
   * await kafkaProducer.sendEvent('user.registered', {
   *   event_type: 'user.registered',
   *   timestamp: new Date(),
   *   data: { user_id: '123', email: 'user@example.com' }
   * });
   */
  async sendEvent<T>(topic: string, event: KafkaEvent<T>): Promise<void> {
    if (!this.isConnected) {
      logger.warn('Producer not connected. Connecting now...');
      await this.connect();
    }

    try {
      const message: ProducerRecord = {
        topic,
        messages: [
          {
            // Key is used for partitioning (advanced topic, ignore for now)
            key: event.event_type,
            // Value is the actual event data (converted to JSON string)
            value: JSON.stringify(event),
          },
        ],
      };

      await this.producer.send(message);
      logger.info(`Event sent to topic: ${topic}`, { event_type: event.event_type });
    } catch (error) {
      logger.error(`Failed to send event to topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Disconnect from Kafka
   * Call this when shutting down the service
   */
  async disconnect(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      logger.info('Kafka Producer disconnected');
    } catch (error) {
      logger.error('Failed to disconnect Kafka Producer', error);
    }
  }
}

// Export a single instance (Singleton pattern)
// All services will use the same Kafka connection
export default new KafkaProducer();
