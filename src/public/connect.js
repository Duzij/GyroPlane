try {
    const sensor = new RelativeOrientationSensor({
        frequency: 60,
        referenceFrame: 'device'
    });
} catch (error) {
    document.getElementById('sensor_status').innerHTML = "RelativeOrientationSensor is not supported by your browser.";
    throw new Error("RelativeOrientationSensor is not supported by your browser.");
}

const permissions = await Promise.all([navigator.permissions.query({
    name: "accelerometer"
}),
navigator.permissions.query({
    name: "magnetometer"
}),
navigator.permissions.query({
    name: "gyroscope"
})
]);

const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

socket.addEventListener('message', (message) => {
    const json = JSON.parse(message.data)

    if (json.type === "connected") {
        document.getElementById('status').innerHTML = "Connected with id: " + json.id;
        socket.send(JSON.stringify({
            type: "connected",
            id: json.id
        }));

        document.getElementById('status').innerHTML = `Access platform with room id ${json.id} or <a href=${location.origin}/platform?roomId=${json.id}>this url</a>`;

        initAbsoluteOrientationSensor(json.id, socket);
    }

    if (json.type === "platform_disconnected") {
        document.getElementById('status').innerHTML += "Platform disconnected. Reload the page to try again.";
    }
})

socket.onerror = function (error) {
    alert(`[Error] ${error.message}`);
    document.getElementById('status').innerHTML = "Disconnected";
};

function initAbsoluteOrientationSensor(id, socket) {

    if (permissions.some(permission => permission.state !== "granted")) {
        document.getElementById('status').innerHTML = "No permissions to use RelativeOrientationSensor.";
        return;
    }

    const sensor = new RelativeOrientationSensor({
        frequency: 60,
        referenceFrame: 'device'
    });


    sensor.onreading = () => {

        const quaternion = preprocessBeforeSending(sensor.quaternion);

        document.getElementById('sensor_data').innerHTML = `
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

        if (socket && socket.readyState === WebSocket.OPEN &&
            isNotSameAsPreviousReading(quaternion, sensor.previousQuaternion)
        ) {
            socket.send(JSON.stringify({
                type: "sensor",
                id,
                quaternion
            }));
        }
    };

    sensor.onerror = (event) => {
        if (event.error.name == 'NotReadableError') {
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close(1000, "Sensor error occurred");
                console.log('WebSocket connection closed due to sensor error');
            }
            sensor.stop();
            document.getElementById('status').innerHTML += "Sensor is not available.";
        } else {
            document.getElementById('status').innerHTML += "Sensor error. " + error.message;
        }
    };

    sensor.start();
}
