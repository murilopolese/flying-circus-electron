# Flying Circus Electron - MicroPython IDE

Flying Circus Electron is an Electron "wrapper" for Flying Circus, a MicroPython IDE (Integrated Development Environment, fancy name for editor). It is very much inspired by the simplicity of [Processing IDE](https://processing.org/).

## Features

- Connect to your board via USB serial
- REPL console ([Read-eval-print-loop](https://en.wikipedia.org/wiki/Read–eval–print_loop))
- Run code from the text editor on your board
- Stop the execution of code (simulate keyboard interrupts)
- Soft reboot the board
- List files on the board (prints on console)
- Save current code on editor to a file on the board
- Get contents from a file on board (prints on console)
- Delete file from board

## Roadmap

- Connect to your board via WebSocket/WebREPL
- Easy way to install MicroPython to your hardware (You will have to [download the firmware yourself](http://micropython.org/download))

## Known bugs:

- Relies on MicroPython's module `binascii` that is not available on some MicroPython firmwares by default. Currently I'm focusing my efforts on using it with the firmware for ESP32 which comes with the module already. For the ESP8266 firmware we have to send the module ourselves using `ampy` or tool alike.

## Download

Check the [releases](https://github.com/murilopolese/flying-circus-electron/releases).

## Building yourself

### In theory

1. Install bower dependencies: `bower install`
1. Install npm dependencies: `yarn install`
1. Package for your OS: `yarn run package`

### In reality

Make sure you have the following software installed:

- Nodejs and NPM (because of Electron)
- Yarn package manager (not necessary but better than npm)
- Bower installed globally (to install front-end dependencies)
- Python 2.7 (not sure if it's required but it's good for you anyway)

**If you are using Windows:**

As Flying Circus uses the `nodeserial` package and it requires sometimes to be built while installing, you should install [Visual Studio 2017 Community Edition](https://www.visualstudio.com/vs/) and because you will go through this pain, install [Debugging Tools for Windows](https://msdn.microsoft.com/en-us/library/windows/hardware/ff551063.aspx) as well.
