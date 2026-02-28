import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5006';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    // Reuse if already connected OR still in the process of connecting.
    // Tearing down a connecting socket causes "WebSocket closed before established".
    if (this.socket) return this.socket;

    this.socket = io(WS_URL, {
      auth: { token },
      // Use polling first (default), then upgrade to WebSocket.
      // Forcing 'websocket' only skips the HTTP handshake and causes
      // "WebSocket is closed before connection is established" errors.
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('WebSocket connect error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
