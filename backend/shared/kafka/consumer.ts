// Kafka removed — stub only
export class KafkaConsumer {
  async connect(): Promise<void> {}
  async disconnect(): Promise<void> {}
  async subscribe(_topic: string, _handler: any): Promise<void> {}
}

export default new KafkaConsumer();
