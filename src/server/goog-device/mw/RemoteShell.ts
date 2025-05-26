import WS from 'ws';
import { Mw, RequestParameters } from '../../mw/Mw';
import * as os from 'os';
import { Message } from '../../../types/Message';
import { XtermClientMessage, XtermServiceParameters } from '../../../types/XtermMessage';
import { ACTION } from '../../../common/Action';
import { Multiplexer } from '../../../packages/multiplexer/Multiplexer';
import { ChannelCode } from '../../../common/ChannelCode';
import { spawn, ChildProcessWithoutNullStreams } from 'child_process';

const OS_WINDOWS = os.platform() === 'win32';
const USE_BINARY = !OS_WINDOWS;
const EVENT_TYPE_SHELL = 'shell';


export interface TerminalLike {
    write(data: string): void;
    kill(): void;
    on(event: 'data', callback: (data: string) => void): void;
    on(event: 'exit', callback: (code: number) => void): void;
}

export class TerminalFallback implements TerminalLike {
    private process: ChildProcessWithoutNullStreams;

    constructor(command: string, args: string[], env: NodeJS.ProcessEnv, cwd: string) {
        this.process = spawn(command, args, {
            env,
            cwd,
            shell: true
        });
    }

    write(data: string): void {
        this.process.stdin.write(data);
    }

    kill(): void {
        this.process.kill();
    }

    on(event: 'data' | 'exit', callback: (arg: any) => void): void {
        if (event === 'data') {
            this.process.stdout.on('data', (data) => callback(data.toString()));
            this.process.stderr.on('data', (data) => callback(data.toString()));
        } else if (event === 'exit') {
            this.process.on('close', (code) => callback(code));
        }
    }
}


export class RemoteShell extends Mw {
    public static readonly TAG = 'RemoteShell';
    private term?: TerminalLike;
    private initialized = false;
    private timeoutString: NodeJS.Timeout | null = null;
    private timeoutBuffer: NodeJS.Timeout | null = null;
    private terminated = false;
    private closeCode = 1000;
    private closeReason = '';

    public static processChannel(ws: Multiplexer, code: string): Mw | undefined {
        if (code !== ChannelCode.SHEL) {
            return;
        }
        return new RemoteShell(ws);
    }

    public static processRequest(ws: WS, params: RequestParameters): RemoteShell | undefined {
        if (params.action !== ACTION.SHELL) {
            return;
        }
        return new RemoteShell(ws);
    }

    constructor(protected ws: WS | Multiplexer) {
        super(ws);
    }

    public createTerminal(params: XtermServiceParameters): TerminalLike {
       const env = Object.assign({}, process.env);
        env['COLORTERM'] = 'truecolor';

        const cwd = env.PWD || '/';
        const file = OS_WINDOWS ? 'adb.exe' : 'adb';
        const args = ['-s', params.udid, 'shell'];

        const term = new TerminalFallback(file, args, env, cwd);

        const send = USE_BINARY ? this.bufferUtf8(5) : this.buffer(5);
        term.on('data', send);

        term.on('exit', (code: number) => {
            this.closeCode = code === 0 ? 1000 : 4500;
            this.closeReason = `[${RemoteShell.TAG}] terminal process exited with code: ${code}`;
            if (this.timeoutString || this.timeoutBuffer) {
                this.terminated = true;
            } else {
                this.ws.close(this.closeCode, this.closeReason);
            }
        });

        return term;
    }

    protected onSocketMessage(event: WS.MessageEvent): void {
        if (this.initialized) {
            if (!this.term) {
                return;
            }
            return this.term.write(event.data as string);
        }
        let data;
        try {
            data = JSON.parse(event.data.toString());
        } catch (error: any) {
            console.error(`[${RemoteShell.TAG}]`, error?.message);
            return;
        }
        this.handleMessage(data as Message).catch((error: Error) => {
            console.error(`[${RemoteShell.TAG}]`, error.message);
        });
    }

    private handleMessage = async (message: Message): Promise<void> => {

        if (message.type !== EVENT_TYPE_SHELL) {
            return;
        }
        const data: XtermClientMessage = message.data as XtermClientMessage;
        const { type } = data;
        if (type === 'start') {
            this.term = this.createTerminal(data);
            this.initialized = true;
        }
        if (type === 'stop') {
            this.release();
        }
    };

    // string message buffering
    private buffer(timeout: number): (data: string) => void {
        let s = '';
        return (data: string) => {
            s += data;
            if (!this.timeoutString) {
                this.timeoutString = setTimeout(() => {
                    this.ws.send(s);
                    s = '';
                    this.timeoutString = null;
                    if (this.terminated) {
                        this.ws.close(this.closeCode, this.closeReason);
                    }
                }, timeout);
            }
        };
    }

    private bufferUtf8(timeout: number): (data: Buffer) => void {
        let buffer: Buffer[] = [];
        let length = 0;
        return (data: Buffer) => {
            buffer.push(data);
            length += data.length;
            if (!this.timeoutBuffer) {
                this.timeoutBuffer = setTimeout(() => {
                    this.ws.send(Buffer.concat(buffer, length));
                    buffer = [];
                    this.timeoutBuffer = null;
                    length = 0;
                    if (this.terminated) {
                        this.ws.close(this.closeCode, this.closeReason);
                    }
                }, timeout);
            }
        };
    }

    public release(): void {
        super.release();
        if (this.timeoutBuffer) {
            clearTimeout(this.timeoutBuffer);
        }
        if (this.timeoutString) {
            clearTimeout(this.timeoutString);
        }
        if (this.term) {
            this.term.kill();
        }
    }
}