declare module '@/vendor/h264-live-player/YUVWebGLCanvas' {
  import { CanvasDecoder } from 'src/player/BaseCanvasBasedPlayer';
  export default class YUVWebGLCanvas implements CanvasDecoder {
    constructor(canvas: HTMLCanvasElement, size: { width: number; height: number });
    decode(buffer: Uint8Array, width: number, height: number): void;
    // Add other methods/properties of YUVWebGLCanvas if known
  }
} 