// Kafka removed — stub only
import { DomainEvent } from './event-types';

export type EventHandler = (event: DomainEvent) => Promise<void>;

export class KafkaConsumerService {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async subscribe(_topic: string, _handler: EventHandler): Promise<void> {}
}
