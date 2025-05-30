// src/services/DeviceService.ts

// Interface định nghĩa trạng thái của thiết bị
interface DeviceState {
  devices: any[]; // Danh sách các thiết bị
  state: 'device' | 'disconnected'; // Trạng thái kết nối: đã kết nối hoặc đã ngắt kết nối
}

export class DeviceService {
  private ws: WebSocket | null = null; // Kết nối WebSocket
  private deviceListeners: ((state: DeviceState) => void)[] = []; // Danh sách các callback functions
  private reconnectTimeout: number | null = null; // Timer cho việc kết nối lại
  private isConnecting: boolean = false; // Cờ đánh dấu trạng thái đang kết nối

  // Phương thức thiết lập kết nối WebSocket
  connect() {
    if (this.isConnecting) return; // Tránh kết nối nhiều lần
    this.isConnecting = true;

    try {
      // Khởi tạo kết nối WebSocket đến server multiplexer trên cổng 8000
      this.ws = new WebSocket("ws://localhost:8000/?action=multiplex");

      // Xử lý sự kiện khi kết nối thành công
      this.ws.onopen = () => {
        console.log('DeviceService: WebSocket connection opened');
        this.isConnecting = false;

        // Tạo message theo protocol để tạo kênh giao tiếp:
        // - Byte 0: Message Type (4 = CreateChannel)
        // - Byte 1-4: Channel ID (0)
        // - Byte 5+: Channel Code ("GTRC")
        const messageType = 4; // MessageType.CreateChannel
        const channelId = 0; // Channel ID mặc định
        const channelCode = new TextEncoder().encode("GTRC");

        // Tạo buffer với đúng format protocol
        const buffer = new ArrayBuffer(5 + channelCode.length);
        const view = new DataView(buffer);

        // Ghi messageType vào byte đầu tiên
        view.setUint8(0, messageType);

        // Ghi channelId vào 4 bytes tiếp theo
        view.setUint32(1, channelId, true); // true cho little-endian

        // Ghi channel code vào các bytes còn lại
        new Uint8Array(buffer, 5).set(channelCode);

        // Gửi buffer đến server
        if (this.ws) {
          this.ws.send(buffer);
        }
      };

      // Xử lý các message nhận được từ server
      this.ws.onmessage = async (event) => {
        try {
          // Chuyển đổi dữ liệu Blob thành ArrayBuffer
          const arrayBuffer = await event.data.arrayBuffer();

          // Đọc header của message (5 bytes đầu)
          const view = new DataView(arrayBuffer);

          // Đọc và giải mã phần data JSON
          const data = arrayBuffer.slice(5); // Bỏ qua 5 bytes header
          const decoder = new TextDecoder();
          const jsonString = decoder.decode(data);

          // Parse JSON và xử lý dữ liệu
          const deviceData = JSON.parse(jsonString);
          
          // Xử lý 2 loại message: devicelist và device
          if (deviceData.type === 'devicelist') {
            // Xử lý danh sách thiết bị
            const deviceList = deviceData.data?.list || [];
            const device = deviceList[0];
            const state = device?.state || 'disconnected';
            
            // Thông báo cho tất cả listeners về danh sách thiết bị mới
            this.deviceListeners.forEach((listener) => {
              listener({
                devices: deviceList,
                state: state
              });
            });
          } else if (deviceData.type === 'device') {
            // Xử lý thông tin của một thiết bị cụ thể
            const device = deviceData.data?.device;
            const state = device?.state || 'disconnected';
            
            // Thông báo cho tất cả listeners về thông tin thiết bị mới
            this.deviceListeners.forEach((listener) => {
              listener({
                devices: device ? [device] : [],
                state: state
              });
            });
          }
        } catch (e) {
          console.error("Error processing message:", e);
        }
      };

      // Xử lý sự kiện đóng kết nối
      this.ws.onclose = () => {
        console.log("Disconnected from server, attempting to reconnect...");
        this.isConnecting = false;
        this.scheduleReconnect(); // Lên lịch kết nối lại
      };

      // Xử lý sự kiện lỗi
      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
        this.scheduleReconnect(); // Lên lịch kết nối lại
      };
    } catch (error) {
      console.error("Failed to connect:", error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  // Lên lịch kết nối lại sau 3 giây
  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = window.setTimeout(() => {
      this.connect();
    }, 3000);
  }

  // Đăng ký callback để nhận thông tin thiết bị
  onDeviceList(callback: (state: DeviceState) => void) {
    this.deviceListeners.push(callback);
    // Trả về hàm cleanup để hủy đăng ký callback
    return () => {
      this.deviceListeners = this.deviceListeners.filter(
        (cb) => cb !== callback
      );
    };
  }

  // Ngắt kết nối WebSocket và dọn dẹp
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
