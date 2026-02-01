import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { EventType, DomainEvent } from './event-types';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const EVENT_VERSION = '1.0.0';

class KafkaProducerService {
  private kafka: Kafka;
  private producer: Producer;
  private isConnected: boolean = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'draft-io-producer',
      brokers: [KAFKA_BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.producer = this.kafka.producer();
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.producer.connect();
      this.isConnected = true;
      console.log('✅ Kafka Producer connected');
    } catch (error) {
      console.error('❌ Failed to connect Kafka Producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.producer.disconnect();
      this.isConnected = false;
      console.log('Kafka Producer disconnected');
    } catch (error) {
      console.error('Error disconnecting Kafka Producer:', error);
    }
  }

  async publishEvent(eventType: EventType, data: any, topic?: string): Promise<void> {
    const event: Partial<DomainEvent> = {
      eventId: uuidv4(),
      eventType,
      timestamp: new Date().toISOString(),
      version: EVENT_VERSION,
      data,
    };

    const topicName = topic || this.getTopicForEvent(eventType);

    try {
      const record: ProducerRecord = {
        topic: topicName,
        messages: [
          {
            key: event.eventId,
            value: JSON.stringify(event),
            headers: {
              eventType: eventType,
              eventId: event.eventId!,
              timestamp: event.timestamp!,
            },
          },
        ],
      };

      await this.producer.send(record);
      console.log(`📤 Event published: ${eventType} to ${topicName}`);
    } catch (error) {
      console.error(`❌ Failed to publish event ${eventType}:`, error);
      throw error;
    }
  }

  private getTopicForEvent(eventType: EventType): string {
    // Map event types to topics
    if (eventType.startsWith('user.')) return 'user-events';
    if (eventType.startsWith('blog.')) return 'blog-events';
    if (eventType.startsWith('engagement.')) return 'engagement-events';
    return 'general-events';
  }
}

// Singleton instance
export const kafkaProducer = new KafkaProducerService();

// Helper function to publish events easily
export async function publishEvent(eventType: EventType, data: any): Promise<void> {
  if (!kafkaProducer) {
    console.warn('⚠️  Kafka Producer not initialized. Event not published:', eventType);
    return;
  }
  
  await kafkaProducer.publishEvent(eventType, data);
}
