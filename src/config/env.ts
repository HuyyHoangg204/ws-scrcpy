export interface WsConfig {
  host: string;
  port: number;
  remotePort: number;
  secure: boolean;
}

const defaultConfig: WsConfig = {
  host: import.meta.env.VITE_WS_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_WS_PORT || '8000'),
  remotePort: parseInt(import.meta.env.VITE_WS_REMOTE_PORT || '8886'),
  secure: import.meta.env.VITE_WS_SECURE === 'true' || false
};

export let config = {
  ws: { ...defaultConfig }
};

export const setConfig = (newConfig: Partial<WsConfig>) => {
  config.ws = {
    ...config.ws,
    ...newConfig
  };
  console.log('Config updated:', config.ws);
};

// Get protocol (ws:// or wss://)
const getWsProtocol = (secure: boolean = config.ws.secure): string => {
  return secure ? 'wss://' : 'ws://';
};

// Get base WebSocket URL
export const getBaseWsUrl = (secure?: boolean): string => {
  const { host, port } = config.ws;
  return `${getWsProtocol(secure)}${host}:${port}`;
};

// Get WebSocket URL for proxy-adb
export const getWsUrl = (udid: string): string => {
  return `${getBaseWsUrl()}/?action=proxy-adb&remote=tcp%3A${config.ws.remotePort}&udid=${udid}`;
};

// Get WebSocket URL for multiplex
export const getMultiplexWsUrl = (): string => {
  return `${getBaseWsUrl()}/?action=multiplex`;
};

// Get WebSocket URL with custom action
export const getActionWsUrl = (action: string, params: Record<string, string> = {}): string => {
  const baseUrl = new URL(getBaseWsUrl());
  baseUrl.searchParams.set('action', action);
  Object.entries(params).forEach(([key, value]) => {
    baseUrl.searchParams.set(key, value);
  });
  return baseUrl.toString();
}; 