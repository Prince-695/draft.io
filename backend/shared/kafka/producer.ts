// Kafka removed — stub only
export class KafkaProducer {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async sendEvent(_topic: string, _event: any): Promise<void> {}
}

export default new KafkaProducer();
