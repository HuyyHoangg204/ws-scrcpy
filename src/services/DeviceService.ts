// src/services/DeviceService.ts
export class DeviceService {
  private ws: WebSocket | null = null;
  private deviceListeners: ((devices: any[]) => void)[] = [];
  private reconnectTimeout: number | null = null;
  private isConnecting: boolean = false;

  connect() {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Kết nối tới multiplexer
      this.ws = new WebSocket("ws://localhost:8000/?action=multiplex");

      this.ws.onopen = () => {
        console.log("Connected to server");
        this.isConnecting = false;

        // Tạo message đúng format
        const messageType = 4; // MessageType.CreateChannel
        const channelId = 0; // Channel ID mặc định
        const channelCode = new TextEncoder().encode("GTRC");

        // Tạo buffer với đúng format
        const buffer = new ArrayBuffer(5 + channelCode.length);
        const view = new DataView(buffer);

        // Ghi messageType (1 byte)
        view.setUint8(0, messageType);

        // Ghi channelId (4 bytes)
        view.setUint32(1, channelId, true); // true cho little-endian

        // Ghi channel code
        new Uint8Array(buffer, 5).set(channelCode);

        // Gửi buffer
        if (this.ws) {
          this.ws.send(buffer);
        }
      };

      this.ws.onmessage = async (event) => {
        try {
            console.log("Received message type:", event.data.constructor.name);
            console.log("Message size:", event.data.size);  // với Blob dùng .size thay vì .byteLength
    
            // Chuyển Blob thành ArrayBuffer
            const arrayBuffer = await event.data.arrayBuffer();
            
            const view = new DataView(arrayBuffer);
            console.log("Message type:", view.getUint8(0));
            console.log("Channel ID:", view.getUint32(1, true));
    
            const data = arrayBuffer.slice(5);
            const decoder = new TextDecoder();
            const jsonString = decoder.decode(data);
            console.log("Decoded data:", jsonString);
    
            const deviceData = JSON.parse(jsonString);
            console.log(deviceData);
            
            if (deviceData.list) {
                console.log("Device list:", deviceData.list);
                this.deviceListeners.forEach((listener) =>
                    listener(deviceData.list)
                );
            }
        } catch (e) {
            console.error("Error processing message:", e);
            // console.error("Stack:", e.stack);
        }
    };

      this.ws.onclose = () => {
        console.log("Disconnected from server, attempting to reconnect...");
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, 3000); // Thử kết nối lại sau 3 giây
  }

  onDeviceList(callback: (devices: any[]) => void) {
    this.deviceListeners.push(callback);
    return () => {
      // Cleanup function to remove listener
      this.deviceListeners = this.deviceListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.deviceListeners = [];
  }
}
