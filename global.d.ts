declare global {
  interface Window {
    previousQuaternion: number[];
  }

   type SensorPermissionName = Extract<
        PermissionName,
        "accelerometer" | "gyroscope" | "magnetometer"
    >;

  type SensorMessage = {
    type: SensorMessageType,
    id: string,
    quaternion: THREE.Quaternion
  }

  export enum SensorMessageType {
    SERVER_ACK = "server_ack",
    GYRO_CONNECTED = "gyro_connected",
    GYRO_DISCONNECTED = "gyro_disconnected",
    SENSOR_DATA = "sensor_data",
    SET_ORIENTATION = "set_orientation",
    PLATFORM_CONNECTED = "platform_connected",
    PLATFORM_DISCONNECTED = "platform_disconnected"
  }
  
}

export {};