/**
 * Module-level singleton holding the active chat Socket.IO connection.
 * Used so both the ChatSocketProvider (which owns the lifecycle) and the
 * chat page (which needs to emit messages) can share the same socket without
 * prop-drilling or context overhead.
 */
import type { Socket } from 'socket.io-client';

let _socket: Socket | null = null;

export function getChatSocket(): Socket | null {
  return _socket;
}

export function setChatSocket(socket: Socket | null): void {
  _socket = socket;
}
