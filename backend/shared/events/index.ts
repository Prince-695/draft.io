export * from './event-types';

// Kafka removed — no-op stub so existing imports don't break at compile time
export const kafkaProducer = {
  connect: async () => {},
  disconnect: async () => {},
};
export const publishEvent = async (_type: any, _data: any) => {};
