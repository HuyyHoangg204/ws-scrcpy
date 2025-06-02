import { ManagerClient } from "./ManagerClient";
import { ControlMessage } from "../../controlMessage/ControlMessage";
import DeviceMessage from "../../packages/DeviceMessage";
import VideoSettings from "../../utils/VideoSettings";
import ScreenInfo from "../../utils/ScreenInfo";
import Util from "../../utils/Util";
import { DisplayInfo } from "../../utils/DisplayInfo";
import type { ParamsStream } from "../../types/ParamsStream";

// Polyfill Buffer
import { Buffer } from "buffer/";
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

const DEVICE_NAME_FIELD_LENGTH = 64;
const MAGIC_BYTES_INITIAL = Util.stringToUtf8ByteArray("scrcpy_initial");

export type ClientsStats = {
  deviceName: string;
  clientId: number;
};

export type DisplayCombinedInfo = {
  displayInfo: DisplayInfo;
  videoSettings?: VideoSettings;
  screenInfo?: ScreenInfo;
  connectionCount: number;
};

interface StreamReceiverEvents {
  video: ArrayBuffer;
  deviceMessage: DeviceMessage;
  displayInfo: DisplayCombinedInfo[];
  clientsStats: ClientsStats;
  encoders: string[];
  connected: void;
  disconnected: CloseEvent;
}

const TAG = "[StreamReceiver]";

export class StreamReceiver<P extends ParamsStream> extends ManagerClient<
  ParamsStream,
  StreamReceiverEvents
> {
  private events: ControlMessage[] = [];
  private encodersSet: Set<string> = new Set<string>();
  private clientId = -1;
  private deviceName = "";
  private readonly displayInfoMap: Map<number, DisplayInfo> = new Map();
  private readonly connectionCountMap: Map<number, number> = new Map();
  private readonly screenInfoMap: Map<number, ScreenInfo> = new Map();
  private readonly videoSettingsMap: Map<number, VideoSettings> = new Map();
  private hasInitialInfo = false;

  constructor(params: P) {
    super(params);
    this.openNewConnection();
    if (this.ws) {
      this.ws.binaryType = "arraybuffer";
    }
  }

  private handleInitialInfo(data: ArrayBuffer): void {
    let offset = MAGIC_BYTES_INITIAL.length;

    // Lưu lại nameBytes để xử lý sau
    let nameBytes = new Uint8Array(data, offset, DEVICE_NAME_FIELD_LENGTH);
    offset += DEVICE_NAME_FIELD_LENGTH;

    const view = new DataView(data, offset);
    let dvOffset = 0;

    const displaysCount = view.getInt32(dvOffset, false); // Big-endian

    dvOffset += 4;

    this.displayInfoMap.clear();
    this.connectionCountMap.clear();
    this.screenInfoMap.clear();
    this.videoSettingsMap.clear();

    const uint8 = new Uint8Array(data, offset);

    for (let i = 0; i < displaysCount; i++) {
      // DisplayInfo
      const displayInfoBytes = uint8.slice(
        dvOffset,
        dvOffset + DisplayInfo.BUFFER_LENGTH
      );
      const displayInfo = DisplayInfo.fromBuffer(Buffer.from(displayInfoBytes));
      const { displayId } = displayInfo;
      this.displayInfoMap.set(displayId, displayInfo);
      dvOffset += DisplayInfo.BUFFER_LENGTH;

      // connectionCount
      const connectionCount = view.getInt32(dvOffset, false);
      this.connectionCountMap.set(displayId, connectionCount);
      dvOffset += 4;

      // screenInfo
      const screenInfoBytesCount = view.getInt32(dvOffset, false);
      dvOffset += 4;
      if (screenInfoBytesCount) {
        const screenInfoBytes = uint8.slice(
          dvOffset,
          dvOffset + screenInfoBytesCount
        );
        this.screenInfoMap.set(
          displayId,
          ScreenInfo.fromBuffer(Buffer.from(screenInfoBytes))
        );
        dvOffset += screenInfoBytesCount;
      }

      // videoSettings
      const videoSettingsBytesCount = view.getInt32(dvOffset, false);
      dvOffset += 4;
      if (videoSettingsBytesCount) {
        const videoSettingsBytes = uint8.slice(
          dvOffset,
          dvOffset + videoSettingsBytesCount
        );
        this.videoSettingsMap.set(
          displayId,
          VideoSettings.fromBuffer(Buffer.from(videoSettingsBytes))
        );
        dvOffset += videoSettingsBytesCount;
      }
    }

    // encoders
    this.encodersSet.clear();
    const encodersCount = view.getInt32(dvOffset, false);
    dvOffset += 4;

    for (let i = 0; i < encodersCount; i++) {
      const nameLength = view.getInt32(dvOffset, false);
      dvOffset += 4;
      const nameBytesArr = uint8.slice(dvOffset, dvOffset + nameLength);
      dvOffset += nameLength;
      const name = Util.utf8ByteArrayToString(nameBytesArr);
      this.encodersSet.add(name);
    }

    // clientId
    this.clientId = view.getInt32(dvOffset, false);
    dvOffset += 4;

    // deviceName
    nameBytes = Util.filterTrailingZeroes(nameBytes);
    this.deviceName = Util.utf8ByteArrayToString(nameBytes);

    this.hasInitialInfo = true;
    this.triggerInitialInfoEvents();
  }

  private static EqualArrays(
    a: ArrayLike<number>,
    b: ArrayLike<number>
  ): boolean {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0, l = a.length; i < l; i++) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  protected buildDirectWebSocketUrl(): URL {
    const localUrl = super.buildDirectWebSocketUrl();
    if (this.supportMultiplexing()) {
      return localUrl;
    }
    localUrl.searchParams.set("udid", this.params.udid);
    return localUrl;
  }

  protected onSocketClose(ev: CloseEvent): void {
    this.emit("disconnected", ev);
  }

  protected onSocketMessage(event: MessageEvent): void {
    if (event.data instanceof ArrayBuffer) {
      // works only because MAGIC_BYTES_INITIAL and MAGIC_BYTES_MESSAGE have same length
      if (event.data.byteLength > MAGIC_BYTES_INITIAL.length) {
        const magicBytes = new Uint8Array(
          event.data,
          0,
          MAGIC_BYTES_INITIAL.length
        );

        // Log magic bytes để debug

        if (StreamReceiver.EqualArrays(magicBytes, MAGIC_BYTES_INITIAL)) {
          this.handleInitialInfo(event.data);
          return;
        }
        if (
          StreamReceiver.EqualArrays(
            magicBytes,
            DeviceMessage.MAGIC_BYTES_MESSAGE
          )
        ) {
          const message = DeviceMessage.fromBuffer(event.data);

          this.emit("deviceMessage", message);
          return;
        }
      }

      this.emit("video", new Uint8Array(event.data));
    }
  }

  private getMessageType(data: Uint8Array): string {
    if (data.length < MAGIC_BYTES_INITIAL.length) return "unknown";

    const magicBytes = data.slice(0, MAGIC_BYTES_INITIAL.length);
    if (StreamReceiver.EqualArrays(magicBytes, MAGIC_BYTES_INITIAL))
      return "initial";
    if (
      StreamReceiver.EqualArrays(magicBytes, DeviceMessage.MAGIC_BYTES_MESSAGE)
    )
      return "device";
    return "video";
  }

  private isKeyFrame(data: Uint8Array): boolean {
    // Basic h264 NAL unit type check - this is a simplified check
    if (data.length < 5) return false;
    const nalType = data[4] & 0x1f;
    return nalType === 5; // 5 = IDR frame
  }

  protected onSocketOpen(): void {
    this.emit("connected", void 0);
    let e = this.events.shift();
    while (e) {
      this.sendEvent(e);
      e = this.events.shift();
    }
  }

  public sendEvent(event: ControlMessage): void {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.send(event.toBuffer());
    } else {
      this.events.push(event);
    }
  }

  public stop(): void {
    if (this.ws && this.ws.readyState === this.ws.OPEN) {
      this.ws.close();
    }
    this.events.length = 0;
  }

  public getEncoders(): string[] {
    return Array.from(this.encodersSet.values());
  }

  public getDeviceName(): string {
    return this.deviceName;
  }

  public triggerInitialInfoEvents(): void {
    if (this.hasInitialInfo) {
      const encoders = this.getEncoders();
      this.emit("encoders", encoders);
      const { clientId, deviceName } = this;
      this.emit("clientsStats", { clientId, deviceName });
      const infoArray: DisplayCombinedInfo[] = [];
      this.displayInfoMap.forEach(
        (displayInfo: DisplayInfo, displayId: number) => {
          const connectionCount = this.connectionCountMap.get(displayId) || 0;
          infoArray.push({
            displayInfo,
            videoSettings: this.videoSettingsMap.get(displayId),
            screenInfo: this.screenInfoMap.get(displayId),
            connectionCount,
          });
        }
      );
      this.emit("displayInfo", infoArray);
    }
  }

  public getDisplayInfo(displayId: number): DisplayInfo | undefined {
    return this.displayInfoMap.get(displayId);
  }
}
