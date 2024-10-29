# Log Lens 🔍
Log Lens is a tool that allows you to see logs from your terminal in the browser, in real time. It lets you unify multiple log sources in the same place, and filter them as you wish.

It works by grabing every line **piped in** from a process, and broadcasting it over UDP to a (local) server that listens for the output and shows them in a frontend client.

> This is very much a work in progress, and it's **ABSOLUTELY NOT READY** for production use. It will probably never be, as the aim of this project is to have a better debugging tool for local development.

## 🚀 Quick Start
You can install it globally with npm:

```bash
npm install -g loglens
```

Then you can run `logLensPub` and `logLensSub` from anywhere in your system.

You can open the listener by running in a terminal. A browser window should open automatically with the (for now) very basic UI:
```bash
logLensSub
```

And now you can run the following command in another terminal tab/pane to see the logs in the browser:

```bash
echo "Hello, World!" | logLensPub
# replace `echo "Hello, World!"` with any command that outputs logs, like your server (`npm run dev`), or a test suite (`npm test`), etc.
```

## How does it work?

![Diagram showing Log Lens simplified architecture](https://i.imgur.com/rWMpZpx.png)

The way it works is that you pipe the output of a process to `logLensPub`, then you open `logLensSub` (in another terminal tab/pane) and then you open the browser to `http://localhost:9999` (or whatever port you specify).



 - `logLensPub` expects to be piped a stream of logs from a process, and when that happens, it will send those logs through a UDP socket that `logLensSub` listens.
  ```bash
 # Example:
  YOUR_APP 2>&1 | logLensPub <OTHER OPTIONS>
 ```
 - `logLensSub` listens for logs that were sent, and sends them to a frontend client (through websocket). The client (a SolidJS SPA) displays the logs on the browser.

## ☑ TODO LIST:
 - [x] Make it so that the logLensSub runs both the frontend and the BFF server at the same time
 - [ ] Fix the performance issues with the frontend
 - [ ] Add filtering for logs in the UI, improve storing and handling data.
 - [ ] Add lots of styling improvements
 - [ ] Add tests
 - [ ] Add more documentation
 - [ ] Figure out if this works across networks

## 🧑🏻‍💻 Development Instructions

There are 3 scripts in the `package.json` file that should help:
  - `dev:server`: runs the server that acts as the subscriber to the publishers
  - `dev:client`: runs the frontend server, that connects to the subscriber server (you only need to run this while developing).
  - `test-util:publisher`: runs a test publisher that sends a bunch of logs to the server constantly (`test-util:publisher:json` to send JSON formatted logs)

## 🙋🏻 FAQ
>#### Why do you have separate server for the frontend and the subscriber-backend?
> Because a browser app can't interact with UDP sockets directly. So we need to have a separate server that can receive the UDP packets and then broadcast them to the browser (through websockets, but it could be anything really).

>#### Why use UDP?
> It should not have that much overhead, and it's supposed to be faster than TCP. I'm not sure if it's the best choice, but it's what I'm trying now.

>#### Why use Solid?
> It's supposed to be very fast, and I want this to be able to handle large loads of data

--- 
This project was **heavily inspired** by [rtail](https://github.com/kilianc/rtail).
