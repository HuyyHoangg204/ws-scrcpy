declare module '@/vendor/Broadway/Decoder' {
  export default class Avc {
    constructor();
    onPictureDecoded: (buffer: Uint8Array, width: number, height: number) => void;
    decode(data: Uint8Array): void;
    // Add other methods/properties of Avc if known
  }
} 