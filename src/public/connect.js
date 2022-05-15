let text;
let person = prompt("Please enter your name:", "Harry Potter");
if (person == null || person == "") {
    text = "User cancelled the prompt. Reload the page to try again.";
} else {

    const socket = new WebSocket(location.origin.replace(/^http/, 'ws'));

    socket.addEventListener('message', (message) => {
        const json = JSON.parse(message.data)

        if (json.type === "connected") {
            document.getElementById('status').innerHTML = "Connected with id: " + json.id;
            socket.send(JSON.stringify({
                type: "connected",
                id: json.id,
                name: person
            }));

            document.getElementById('status').innerHTML = `Access platform with room id ${json.id} or <a href=${location.origin}/platform?roomId=${json.id}>this url</a>`;

            initAbsoluteOrientationSensor(json.id, socket);
        }

        if (json.type === "platform_disconnected") {
            document.getElementById('status').innerHTML += "Platform disconnected. Reload the page to try again.";
        }
    })

    socket.onerror = function(error) {
        alert(`[Error] ${error.message}`);
        document.getElementById('status').innerHTML = "Disconnected";
    };

}

function initAbsoluteOrientationSensor(id, socket) {
    const sensor = new RelativeOrientationSensor({
        frequency: 60,
        referenceFrame: 'device'
    });

    Promise.all([navigator.permissions.query({
                name: "accelerometer"
            }),
            navigator.permissions.query({
                name: "magnetometer"
            }),
            navigator.permissions.query({
                name: "gyroscope"
            })
        ])
        .then(results => {
            if (results.every(result => result.state === "granted")) {

                sensor.onreading = () => {

                    const message = JSON.stringify({
                        type: "sensor",
                        id,
                        quaternion: sensor.quaternion
                    });

                    document.getElementById('sensor_status').innerHTML = `
                    <tr>
                        <td>${sensor.quaternion[0]}</td>
                    </tr>
                    <tr>
                        <td>${sensor.quaternion[1]}</td>
                    </tr>
                    <tr>
                        <td>${sensor.quaternion[2]}</td>
                    </tr>
                    <tr>
                        <td>${sensor.quaternion[3]}</td>
                    </tr>`;

                    socket.send(message);
                };
                sensor.onerror = (event) => {
                    if (event.error.name == 'NotReadableError') {
                        console.log('Sensor is not available.');
                        document.getElementById('status').innerHTML += "Sensor is not available.";
                    } else {
                        document.getElementById('status').innerHTML += "Sensor error. " + error.message;
                    }
                };

                sensor.start();

            } else {
                alert("No permissions to use RelativeOrientationSensor.");
            }
        });
}