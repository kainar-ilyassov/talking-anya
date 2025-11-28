export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  isFinal?: boolean;
  timestamp: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
}

export interface LiveConfig {
  voiceName: string;
}