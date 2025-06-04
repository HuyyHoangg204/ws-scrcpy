import { TypedEmitter } from '../../common/TypedEmitter';
import { getBaseWsUrl } from '../../config/env';

/**
 * Enum define all types of action
 */
export enum ACTION {
    LIST_HOSTS = 'list-hosts',
    APPL_DEVICE_LIST = 'appl-device-list',
    GOOG_DEVICE_LIST = 'goog-device-list',
    MULTIPLEX = 'multiplex',
    SHELL = 'shell',
    PROXY_WS = 'proxy-ws',
    PROXY_ADB = 'proxy-adb',
    DEVTOOLS = 'devtools',
    STREAM_SCRCPY = 'stream',
    STREAM_WS_QVH = 'stream-qvh',
    STREAM_MJPEG = 'stream-mjpeg',
    PROXY_WDA = 'proxy-wda',
    FILE_LISTING = 'list-files',
}

export enum PlayerType {
    MSE = 'mse'
}

/**
 * Interface basic for stream params
 */
export interface BaseStreamParams {
    action: ACTION;
    udid: string;
    player?: PlayerType;
}

/**
 * Specific params for Scrcpy streaming
 */
export interface ScrcpyStreamParams extends BaseStreamParams {
    action: ACTION.STREAM_SCRCPY;
    ws: string;           // WebSocket URL
    player: PlayerType;   // Always MSE
}

/**
 * Params for proxy ADB
 */
export interface ProxyAdbParams extends BaseStreamParams {
    action: ACTION.PROXY_ADB;
    remote?: string;
    port?: number;
}

/**
 * Union type of all possible params
 */
export type StreamConnectionParams = ScrcpyStreamParams | ProxyAdbParams;

/**
 * Define all stream events
 */
interface StreamEvents {
    'stream-data': Uint8Array;     // Emit when receive frame data
    'stream-error': Error;         // Emit when error
    'stream-close': void;          // Emit when close connection
    'client-connected': string;
    'client-disconnected': string;
}

/**
 * Class manage WebSocket connection
 */
export class StreamConnection extends TypedEmitter<StreamEvents> {
    private ws: WebSocket | null = null;
    private isConnecting = false;
    private baseUrl: string;
    private params: StreamConnectionParams;

    constructor(
        params: StreamConnectionParams,
        baseUrl: string = getBaseWsUrl()
    ) {
        super();
        // Ensure player type is always MSE for Scrcpy
        if (params.action === ACTION.STREAM_SCRCPY) {
            params.player = PlayerType.MSE;
        }
        this.params = { ...params };
        this.baseUrl = baseUrl;
    }

    /**
     * Parse params from URLSearchParams
     * @param params URLSearchParams from URL
     * @returns Parsed StreamConnectionParams
     */
    public static parseFromURL(params: URLSearchParams): StreamConnectionParams {
        const action = params.get('action') as ACTION;
        const udid = params.get('udid');

        if (!udid) {
            throw new Error('Missing required parameter: udid');
        }

        switch (action) {
            case ACTION.STREAM_SCRCPY: {
                const ws = params.get('ws');
                if (!ws) {
                    throw new Error('Missing required scrcpy parameters');
                }
                // Always use MSE player
                return { 
                    action, 
                    udid, 
                    ws, 
                    player: PlayerType.MSE 
                };
            }
            case ACTION.PROXY_ADB: {
                const remote = params.get('remote') || undefined;
                const port = params.get('port') ? parseInt(params.get('port')!) : undefined;
                return { action, udid, remote, port };
            }
            default:
                throw new Error(`Unsupported action: ${action}`);
        }
    }

    /**
     * Create WebSocket URL based on params type
     */
    private buildWebSocketUrl(): string {
        let wsUrl: string;
        if (this.params.action === ACTION.STREAM_SCRCPY) {
            // For scrcpy, use direct WebSocket URL
            wsUrl = this.params.ws;
        } else {
            // For other types, create URL from params
            const url = new URL(this.baseUrl);
            Object.entries(this.params).forEach(([key, value]) => {
                if (value !== undefined) {
                    url.searchParams.append(key, value.toString());
                }
            });
            wsUrl = url.toString();
        }
        console.log('Building WebSocket URL:', {
            params: this.params,
            resultUrl: wsUrl
        });
        return wsUrl;
    }

    public async connect(): Promise<void> {
        if (this.isConnecting || this.ws) {
            console.log('WebSocket already connecting or connected');
            return;
        }

        this.isConnecting = true;
        try {
            const wsUrl = this.buildWebSocketUrl();
            console.log('Connecting to WebSocket:', wsUrl);
            this.ws = new WebSocket(wsUrl);
            
            this.ws.binaryType = 'arraybuffer';

            this.ws.onmessage = (event) => {
                const data = new Uint8Array(event.data);
                this.emit('stream-data', data);
            };

            this.ws.onerror = (error) => {
                console.error('Stream WebSocket error:', error);
                this.emit('stream-error', new Error('Stream connection error'));
            };

            this.ws.onclose = () => {
                console.log('Stream WebSocket closed');
                this.ws = null;
                this.emit('stream-close', undefined);
            };

            await new Promise<void>((resolve, reject) => {
                if (!this.ws) {
                    reject(new Error('WebSocket not initialized'));
                    return;
                }

                this.ws.onopen = () => {
                    console.log('WebSocket connection established');
                    this.isConnecting = false;
                    resolve();
                };
            });
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.isConnecting = false;
            throw error;
        }
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    public isConnected(): boolean {
        return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
    }

    public updateParams(newParams: Partial<StreamConnectionParams>): void {
        const currentParams = this.params;
        
        if (currentParams.action === ACTION.STREAM_SCRCPY) {
            this.params = {
                ...currentParams,
                ...newParams,
                action: ACTION.STREAM_SCRCPY,
                player: PlayerType.MSE // Ensure always use MSE
            } as ScrcpyStreamParams;
        } else if (currentParams.action === ACTION.PROXY_ADB) {
            this.params = {
                ...currentParams,
                ...newParams,
                action: ACTION.PROXY_ADB,
            } as ProxyAdbParams;
        }

        if (this.isConnected()) {
            this.disconnect();
        }
    }

    /**
     * Get current params
     */
    public getParams(): StreamConnectionParams {
        return { ...this.params };
    }

    public async send(data: unknown): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket is not connected');
        }

        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.ws.send(message);
    }
}