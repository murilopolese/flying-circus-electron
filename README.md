# Flying Circus - MicroPython IDE

Flying Circus is a MicroPython Integrated Development Environment (fancy name for a fancy editor) very much inspired by the [Processing IDE](https://processing.org/).

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

- Easy way to install MicroPython to your hardware (You will have to [download the firmware yourself](http://micropython.org/download))

## Known bugs:

- Relies on MicroPython's module `binascii` that is not available on some MicroPython firmwares by default. Currently I'm focusing my efforts on using it with the firmware for ESP32 which comes with the module already. For the ESP8266 firmware we have to send the module ourselfes using `ampy` or tool alike.
- Minor UI improvements such as updating the UI when board disconnects, the list of ports not updating automatically or the app sometimes getting stuck on a "running" state are a mix of bug and "that doesn't bother me too much". If there is something that bothers you, get in touch and fork me gently.

## Download

Check the [releases](https://github.com/murilopolese/flying-circus/releases).
