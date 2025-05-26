declare module '@/vendor/h264-live-player/Canvas' {
  import { CanvasDecoder } from 'src/player/BaseCanvasBasedPlayer';
  export default class Canvas implements CanvasDecoder {
    constructor(canvas: HTMLCanvasElement, size: { width: number; height: number });
    decode(buffer: Uint8Array, width: number, height: number): void;
    // Add other methods/properties of Canvas if known
  }
} 