import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
import { DomainEvent } from './event-types';

const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

export type EventHandler = (event: DomainEvent) => Promise<void>;

export class KafkaConsumerService {
  private kafka: Kafka;
  private consumer: Consumer;
  private handlers: Map<string, EventHandler[]> = new Map();
  private isConnected: boolean = false;

  constructor(groupId: string) {
    this.kafka = new Kafka({
      clientId: `draft-io-consumer-${groupId}`,
      brokers: [KAFKA_BROKER],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });

    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.consumer.connect();
      this.isConnected = true;
      console.log(`✅ Kafka Consumer connected (group: ${this.consumer})`);
    } catch (error) {
      console.error('❌ Failed to connect Kafka Consumer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      console.log('Kafka Consumer disconnected');
    } catch (error) {
      console.error('Error disconnecting Kafka Consumer:', error);
    }
  }

  async subscribe(topics: string[]): Promise<void> {
    try {
      for (const topic of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
        console.log(`📥 Subscribed to topic: ${topic}`);
      }
    } catch (error) {
      console.error('Failed to subscribe to topics:', error);
      throw error;
    }
  }

  registerHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.log(`🎯 Handler registered for: ${eventType}`);
  }

  async startConsuming(): Promise<void> {
    try {
      await this.consumer.run({
        eachMessage: async (payload: EachMessagePayload) => {
          await this.handleMessage(payload);
        },
      });
      console.log('🎧 Kafka Consumer started');
    } catch (error) {
      console.error('Error starting Kafka consumer:', error);
      throw error;
    }
  }

  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      const event: DomainEvent = JSON.parse(message.value!.toString());
      const eventType = event.eventType;

      console.log(`📨 Received event: ${eventType} from ${topic}`);

      const handlers = this.handlers.get(eventType);
      if (handlers && handlers.length > 0) {
        await Promise.all(handlers.map((handler) => handler(event)));
      } else {
        console.log(`⚠️  No handler registered for event: ${eventType}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      // Don't throw - we don't want to stop consuming messages
    }
  }
}

// Factory function to create consumer instances
export function createKafkaConsumer(groupId: string): KafkaConsumerService {
  return new KafkaConsumerService(groupId);
}
