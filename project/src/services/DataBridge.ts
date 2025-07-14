import { dataTranslator } from './DataTranslator';

export class DataBridge {
  private static instance: DataBridge;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;

  static getInstance(): DataBridge {
    if (!DataBridge.instance) {
      DataBridge.instance = new DataBridge();
    }
    return DataBridge.instance;
  }

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.websocket = new WebSocket('ws://localhost:4000');
      
      this.websocket.onopen = () => {
        console.log('🔗 Connected to NEXUS data bridge');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emitConnectionEvent('connected');
      };

      this.websocket.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data);
          
          // Translate the incoming data
          const translatedData = dataTranslator.translateData(rawData);
          
          if (translatedData) {
            console.log('📊 Data translated and distributed:', translatedData.source);
          }
        } catch (error) {
          console.error('❌ Error processing incoming data:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('🔌 Disconnected from NEXUS data bridge');
        this.isConnected = false;
        this.emitConnectionEvent('disconnected');
        this.handleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
        this.emitConnectionEvent('error');
      };

    } catch (error) {
      console.error('❌ Failed to connect to data bridge:', error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emitConnectionEvent('failed');
    }
  }

  private emitConnectionEvent(status: 'connected' | 'disconnected' | 'error' | 'failed') {
    window.dispatchEvent(new CustomEvent('bridgeConnectionChange', {
      detail: { status, isConnected: this.isConnected }
    }));
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
  }

  public sendCommand(command: any) {
    if (this.websocket && this.isConnected) {
      this.websocket.send(JSON.stringify(command));
    } else {
      console.warn('⚠️ Cannot send command: Bridge not connected');
    }
  }
}

// Initialize the data bridge
export const dataBridge = DataBridge.getInstance();