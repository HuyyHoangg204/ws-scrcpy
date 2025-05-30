import { TypedEmitter } from '../../common/TypedEmitter';

/**
 * Enum định nghĩa các loại action có thể có
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
 * Interface cơ bản cho các tham số stream
 */
export interface BaseStreamParams {
    action: ACTION;
    udid: string;
    player?: PlayerType;
}

/**
 * Tham số cụ thể cho Scrcpy streaming
 */
export interface ScrcpyStreamParams extends BaseStreamParams {
    action: ACTION.STREAM_SCRCPY;
    ws: string;           // WebSocket URL
    player: PlayerType;   // Luôn là MSE
}

/**
 * Tham số cho proxy ADB
 */
export interface ProxyAdbParams extends BaseStreamParams {
    action: ACTION.PROXY_ADB;
    remote?: string;
    port?: number;
}

/**
 * Union type của tất cả loại params có thể có
 */
export type StreamConnectionParams = ScrcpyStreamParams | ProxyAdbParams;

/**
 * Định nghĩa các sự kiện stream
 */
interface StreamEvents {
    'stream-data': Uint8Array;     // Phát ra khi nhận được frame data
    'stream-error': Error;         // Phát ra khi có lỗi
    'stream-close': void;          // Phát ra khi đóng kết nối
    'client-connected': string;
    'client-disconnected': string;
}

/**
 * Class quản lý kết nối WebSocket stream
 */
export class StreamConnection extends TypedEmitter<StreamEvents> {
    private ws: WebSocket | null = null;
    private isConnecting = false;
    private baseUrl: string;
    private params: StreamConnectionParams;

    constructor(
        params: StreamConnectionParams,
        baseUrl: string = 'ws://localhost:8000'
    ) {
        super();
        // Đảm bảo player type luôn là MSE cho Scrcpy
        if (params.action === ACTION.STREAM_SCRCPY) {
            params.player = PlayerType.MSE;
        }
        this.params = { ...params };
        this.baseUrl = baseUrl;
    }

    /**
     * Parse params từ URLSearchParams
     * @param params URLSearchParams từ URL
     * @returns StreamConnectionParams đã parse
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
                // Luôn sử dụng MSE player
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
     * Tạo URL WebSocket dựa trên loại params
     */
    private buildWebSocketUrl(): string {
        let wsUrl: string;
        if (this.params.action === ACTION.STREAM_SCRCPY) {
            // Đối với scrcpy, sử dụng URL WebSocket trực tiếp
            wsUrl = this.params.ws;
        } else {
            // Đối với các loại khác, tạo URL từ params
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
                player: PlayerType.MSE // Đảm bảo luôn sử dụng MSE
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
     * Lấy params hiện tại
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