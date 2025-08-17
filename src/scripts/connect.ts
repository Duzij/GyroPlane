export function getElementByIdOrThrow<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id '${id}' not found`);
    }
    return element as T;
}

async function requestPermissions(): Promise<PermissionStatus[]> {
    return await Promise.all([
        navigator.permissions.query({
            name: "accelerometer" as SensorPermissionName,
        }),
        navigator.permissions.query({
            name: "magnetometer" as SensorPermissionName,
        }),
        navigator.permissions.query({
            name: "gyroscope" as SensorPermissionName,
        }),
    ]);
}

interface SensorData {
    type: string;
    id: string;
    quaternion?: number[];
}

try {
    const sensor = new RelativeOrientationSensor({
        frequency: 60,
        referenceFrame: 'device'
    });
} catch (error: unknown) {
    const sensorStatus = getElementByIdOrThrow<HTMLElement>('sensor_status');
    sensorStatus.innerHTML = "RelativeOrientationSensor is not supported by your browser.";
    throw new Error("RelativeOrientationSensor is not supported by your browser.");
}

(async () => {
    const permissions = await requestPermissions();
    
    const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

    socket.addEventListener('message', (message: MessageEvent) => {
        const json: SensorData = JSON.parse(message.data);

        if (json.type === "connected") {
            const status = getElementByIdOrThrow<HTMLElement>('status');
            status.innerHTML = `Connected with id: ${json.id}`;
            socket.send(JSON.stringify({
                type: "connected",
                id: json.id
            }));

            status.innerHTML = `Access platform with room id ${json.id} or <a href=${location.origin}/platform?roomId=${json.id}>this url</a>`;

            initAbsoluteOrientationSensor(json.id, socket);
        }

        if (json.type === "platform_disconnected") {
            const status = getElementByIdOrThrow<HTMLElement>('status');
            status.innerHTML += "Platform disconnected. Reload the page to try again.";
        }
    });

    socket.onerror = function (error: Event) {
        alert(`[Error] ${(error as ErrorEvent).message}`);
        const status = getElementByIdOrThrow<HTMLElement>('status');
        status.innerHTML = "Disconnected";
    };
})();

function initAbsoluteOrientationSensor(id: string, socket: WebSocket): void {
    requestPermissions().then(permissions => {
        if (permissions.some(permission => permission.state !== "granted")) {
            const status = getElementByIdOrThrow<HTMLElement>('status');
            status.innerHTML = "No permissions to use RelativeOrientationSensor.";
            return;
        }

        const sensor = new RelativeOrientationSensor({
            frequency: 60,
            referenceFrame: 'device'
        });

        sensor.onreading = () => {
            const quaternion: number[] = sensor.quaternion ?? [];
            const sensorData = getElementByIdOrThrow<HTMLElement>('sensor_data');
            sensorData.innerHTML = `
                <tr>
                    <td>${quaternion[0]}</td>
                </tr>
                <tr>
                    <td>${quaternion[1]}</td>
                </tr>
                <tr>
                    <td>${quaternion[2]}</td>
                </tr>
                <tr>
                    <td>${quaternion[3]}</td>
                </tr>`;

            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: "sensor",
                    id,
                    quaternion: sensor.quaternion
                }));
            }
        };

        sensor.onerror = (event: SensorErrorEvent) => {
            if (event.error.name === 'NotReadableError') {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.close(1000, "Sensor error occurred");
                    console.log('WebSocket connection closed due to sensor error');
                }
                sensor.stop();
                const status = getElementByIdOrThrow<HTMLElement>('status');
                status.innerHTML += "Sensor is not available.";
            } else {
                const status = getElementByIdOrThrow<HTMLElement>('status');
                status.innerHTML += `Sensor error. ${event.error.message}`;
            }
        };

        sensor.start();
    });
}

function preprocessBeforeSending(quaternion: number[]): number[] {
    // Convert from phone space to Three.js space
    // This might need adjustment based on your phone's orientation
    return [
        -quaternion[0], // x
        -quaternion[2], // y
        quaternion[1],  // z
        quaternion[3]   // w
    ];
}

function isNotSameAsPreviousReading(current: number[], previous: number[] | undefined): boolean {
    if (!previous) return true;

    // Increase threshold to reduce noise
    const threshold = 0.03; // Increased from 0.01
    
    // Apply low-pass filter
    const alpha = 0.8; // Smoothing factor (0-1)
    return Math.abs((current[0] * alpha + previous[0] * (1 - alpha)) - previous[0]) > threshold ||
           Math.abs((current[1] * alpha + previous[1] * (1 - alpha)) - previous[1]) > threshold ||
           Math.abs((current[2] * alpha + previous[2] * (1 - alpha)) - previous[2]) > threshold ||
           Math.abs((current[3] * alpha + previous[3] * (1 - alpha)) - previous[3]) > threshold;
}