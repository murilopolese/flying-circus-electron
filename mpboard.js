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
    exec(command) {
        this.port.write(Buffer.from(command))
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
    saveFile(filename, code) {
        if (!filename || !code) {
            return
        }
        let pCode = `import binascii
f = open('${filename}', 'w')
`
        // `code` is what comes from the editor. We want to write its
        // line one by one on a file so we split by `\n`
        code.split('\n').forEach((line) => {
            if (line) {
                // To avoid the string escaping with weirdly we encode
                // the line plus the `\n` that we just removed to base64
                const l = Buffer.from(`${line}\n`).toString('base64')
                pCode += `f.write(binascii.a2b_base64("${l}"))\n`
            }
        })
        pCode += 'f.close()\n'
        this.execFromString(pCode)
    }
    loadFile(filename) {
        const pCode = `print(' ')
with open('${filename}', 'r') as f:
    for line in f.readlines():
        print(line.replace('\\n', ''))`
        this.execFromString(pCode)
    }
    removeFile(filename) {
        const pCode = `from os import remove
remove('${filename}')`
        this.execFromString(pCode)
    }
}

module.exports = MPBoard;
