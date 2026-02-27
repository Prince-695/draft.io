// Kafka removed — stub only
import { EventType, DomainEvent } from './event-types';

export class KafkaProducerService {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async publishEvent(_eventType: EventType, _data: any): Promise<void> {}
}

export const kafkaProducer = new KafkaProducerService();
export const publishEvent = async (_type: EventType, _data: any): Promise<void> => {};
