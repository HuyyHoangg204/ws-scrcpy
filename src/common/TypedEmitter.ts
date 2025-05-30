export type EventMap = Record<string, any>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
    emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export class TypedEmitter<T extends EventMap> implements Emitter<T> {
    private listeners: Map<string, Set<EventReceiver<any>>> = new Map();

    addEventListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        this.on(eventName, fn);
    }

    removeEventListener<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        this.off(eventName, fn);
    }

    dispatchEvent<K extends EventKey<T>>(event: { type: K } & T[K]): boolean {
        return this.emit(event.type, event);
    }

    on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(fn);
    }

    once<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        const onceWrapper = (params: T[K]) => {
            this.off(eventName, onceWrapper);
            fn(params);
        };
        this.on(eventName, onceWrapper);
    }

    off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
        const listeners = this.listeners.get(eventName);
        if (listeners) {
            listeners.delete(fn);
            if (listeners.size === 0) {
                this.listeners.delete(eventName);
            }
        }
    }

    emit<K extends EventKey<T>>(eventName: K, params: T[K]): boolean {
        const listeners = this.listeners.get(eventName);
        if (!listeners) {
            return false;
        }
        listeners.forEach(listener => listener(params));
        return true;
    }
}
