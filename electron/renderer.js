'use strict';
const fs = require('fs');

const SerialPort = require('serialport');
const EventEmitter = require('./libs/EventEmitter.js');
const ipcBus = new EventEmitter();

let serialConnection;

ipcBus.on('connect', (options) => {
    if (!options) {
        return;
    }
    serialConnection = SerialPort(options, {
        autoOpen: false,
        baudRate: 115200
    });
    serialConnection.open((err) => {
        if (err) {
            return;
        }
        serialConnection.on('data', function (data) {
            ipcBus.emit('console-out', {
                data: data.toString()
            });
        });
        serialConnection.on('close', function (data) {
            ipcBus.emit('device-diconnected');
        });
        ipcBus.emit('device-connected');
    });
    serialConnection.on('error', function(err) {
        console.log('Error: ', err.message);
        ipcBus.emit('device-disconnected');
    });

});
ipcBus.on('disconnect', (options) => {
    serialConnection.close();
    serialConnection = null;
    ipcBus.emit('device-disconnected');
    ipcBus.emit('console-out', {
        data: 'Disconected\n'
    });
});

ipcBus.on('enter-paste-mode', () => {
    // CTRL-E
    serialConnection.write('\r\x05');
});
ipcBus.on('exit-paste-mode', () => {
    // CTRL-D
    serialConnection.write('\r\x04');
});
ipcBus.on('paste', (code) => {
    serialConnection.write(code);
});

ipcBus.on('run', (code) => {
    // http://digital.ni.com/public.nsf/allkb/D7EAC53664164D8E86256F23005CFF8F
    // Enter paste mode: CTRL-E
    serialConnection.write('\r\x05');
    // Paste raw code
    serialConnection.write(code);
    // Finish paste mode: CTRL-D
    serialConnection.write('\r\x04');
});
ipcBus.on('soft-reset', () => {
    // CTRL-D
    serialConnection.write('\x04');
});
ipcBus.on('stop', () => {
    // CTRL-C twice
    serialConnection.write('\r\x03\x03');
});
ipcBus.on('load-available-devices', () => {
    SerialPort.list().then((ports) => {
        ipcBus.emit('available-ports', {
            data: ports
        });
    });
});

window.bus = ipcBus;

window.onload = () => {
    const dragOverHandler = (e) => {
        e.preventDefault();
        return false;
    }
    const dragLeaveHandler = (e) => {
        e.preventDefault();
        return false;
    }

    const dropHandler = (e) => {
        e.preventDefault();
        const path = event.dataTransfer.files[0].path;
        if (path) {
            const code = fs.readFileSync(path);
            ipcBus.emit('load-code', {
                data: code.toString()
            });
        }
        return false;
    }

    window.ondragover = dragOverHandler;
    window.ondragleave = dragLeaveHandler;
    window.ondrop = dropHandler;
}
