'use strict'

const SerialPort = require('serialport')
const fs = require('fs')
const EventEmiter = require('events')

class MPBoard extends EventEmiter {
    constructor(port) {
        super()
        this.rawRepl = false
        this.port = new SerialPort(port, {
            baudRate: 115200,
            autoOpen: false
        })
        this.port.on('open', () => {
            this.emit('connected')
        })
        this.port.on('data', (data) => this.eventHandler(data))
        this.port.open()
    }
    close() {
        this.emit('disconnected')
        this.port.close()
    }
    eventHandler(buffer) {
        const data = buffer.toString()
        this.emit('output', data)

        if (this.rawRepl && data.indexOf('>>>') != -1) {
            this.emit('raw-repl-finished')
            this.rawRepl = false
        }

        if (!this.rawRepl && data.indexOf('raw REPL;') != -1) {
            this.emit('raw-repl-started')
            this.rawRepl = true
        }

        if (this.rawRepl && data.indexOf('OK') != -1) {
            this.emit('exec-raw-done')
        }
    }
    sendStop() {
        this.port.write('\r\x03\x03') // CTRL-C 2x
    }
    softReset() {
        this.sendStop();
        this.port.write('\r\x04') // CTRL-D
    }
    enterRawRepl() {
        this.sendStop();
        this.port.write('\r\x01') // CTRL-A
    }
    exitRawRepl() {
        this.port.write('\r\x04') // CTRL-D
        this.port.write('\r\x02') // CTRL-B
    }
    execRaw(command) {
        this.port.write(Buffer.from(command))
        if (command.indexOf('\n') == -1) {
            this.port.write('\n')
        }
    }
    execFromFile(filename) {
        this.enterRawRepl()
        const code = fs.readFileSync(filename).toString()
        this.execRaw(code)
        this.exitRawRepl()
    }
    execFromString(code) {
        this.sendStop()
        this.enterRawRepl()
        this.execRaw(code)
        this.exitRawRepl()
    }
}

module.exports = MPBoard;
