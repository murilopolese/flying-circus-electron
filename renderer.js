'use strict'
const fs = require('fs')

const SerialPort = require('serialport')
const EventEmitter = require('events')
const Board = require('./mpboard.js')
const bus = new EventEmitter()

let board

bus.on('connect', (options) => {
    if (!options) {
        return
    }
    board = new Board(options)
    // Events received by the board and proxied to front end
    board.on('connected', () => {
        bus.emit('connected')
        board.sendStop()
    })
    board.on('disconnected', () => {
        bus.emit('disconnected')
    })
    board.on('raw-repl-started', () => {
        bus.emit('raw-repl-started')
    })
    board.on('raw-repl-finished', () => {
        bus.emit('raw-repl-finished')
    })
    board.on('raw-exec-done', () => {
        bus.emit('raw-exec-done')
    })
    board.on('output', (data) => {
        bus.emit('output', data)
    })
})
bus.on('disconnect', (options) => {
    try {
        board.close()
    } catch (e) {
        console.log('error', e);
    }
    board = null
    bus.emit('device-disconnected')
    bus.emit('output', 'Disconected\n\r')
})

// Events received from the front end to call board functions
bus.on('enter-raw-repl', () => {
    board.enterRawRepl()
})
bus.on('exit-raw-repl', () => {
    board.exitRawRepl()
})
bus.on('exec-raw', (code) => {
    board.execRaw(code)
})
bus.on('send-stop', () => {
    board.sendStop()
})
bus.on('send-reset', () => {
    board.softReset()
})
bus.on('exec-from-string', (code) => {
    board.execFromString(code)
})
bus.on('exec', (command) => {
    board.exec(command)
})

bus.on('load-available-devices', () => {
    SerialPort.list().then((ports) => {
        bus.emit('available-devices', ports.filter((port) => {
            return !!port.vendorId
        }))
    })
})

bus.on('save-file', (data) => {
    console.log('save file', data)
    board.saveFile(data.filename, data.code)
})
bus.on('load-file', (filename) => {
    board.loadFile(filename)
})
bus.on('remove-file', (filename) => {
    board.removeFile(filename)
})

window.FlyingCircus = { bus }

window.onload = () => {
    const dragOverHandler = (e) => {
        e.preventDefault()
        return false
    }
    const dragLeaveHandler = (e) => {
        e.preventDefault()
        return false
    }

    const dropHandler = (e) => {
        e.preventDefault()
        if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) {
            return;
        }
        const path = e.dataTransfer.files[0].path
        if (path) {
            const code = fs.readFileSync(path)
            bus.emit('load-code', code.toString())
        }
        return false
    }

    window.ondragover = dragOverHandler
    window.ondragleave = dragLeaveHandler
    window.ondrop = dropHandler
}
