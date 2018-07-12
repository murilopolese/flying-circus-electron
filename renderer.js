'use strict'
const fs = require('fs')
const WebsocketConnection = require('flying-circus-connection-websocket')
const SerialConnection = require('flying-circus-connection-serial')

window.onload = () => {
    // CREATE FLYING CIRCUS COMPONENT
    let flyingCircus = document.createElement('flying-circus-ide')

    // CONFIGURING CONNECTIONS
    WebsocketConnection.prototype._saveAs = (path, data) => {
        flyingCircus.set('code', new TextDecoder('utf-8').decode(data))
    }

    flyingCircus.WebsocketConnection = WebsocketConnection
    flyingCircus.SerialConnection = SerialConnection


    // LOAD FILES BY DRAGGING IT INTO ELECTRON WINDOW
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
            flyingCircus.set('code', code.toString())
        }
        return false
    }
    window.ondragover = dragOverHandler
    window.ondragleave = dragLeaveHandler
    window.ondrop = dropHandler


    // APPENDING FLYING CIRCUS UI TO DOCUMENT
    document.body.appendChild(flyingCircus)

}
