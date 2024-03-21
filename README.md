# nerdTail
## A simple tool to see logs in the browser 🐛
nerdTail is a command line utility that grabs every line in stdin from a process, and broadcasts it over UDP. 
Tail log files, app output, or whatever you wish. See multiple streams in the browser, in realtime.

**Heavily inspired** by [rtail](https://github.com/kilianc/rtail) (we copied a lot of the implementation from there).

The way it works is that you pipe the output of a process to `nerdTail`, then you open `nerdTailServer` and then you open the browser to `http://localhost:9999` (or whatever port you specify).

This is very much a work in progress, and it's ABSOLUTELY NOT READY for production use.

## ⚙️ The way it works:

 - `nerdTail` expects to be piped a stream of logs from a process, and when that happens, it will send those logs through a UDP socket that `nerdTailServer` listens.
  ```bash
 # Example:
  YOUR_APP 2>&1 | nerdTail <OTHER OPTIONS>
 ```
 - `nerdTailServer` listens for logs that were sent, and sends them to a frontend client (through websocket). The client (a SolidJS SPA) displays the logs on the browser.

# ☑ TODO LIST (in order of priority):
 - [x] Make it so that the nerdTailServer runs both the frontend and the BFF server at the same time (prefferably in the same process) (right now you've got to run `nerdTailServer` and `npm run:dev`)
 - [ ] Add filtering for logs in the UI, improve storing and handling data.
 - [ ] Add lots of styling improvements
 - [ ] Add tests
 - [ ] Add more documentation
 - [ ] Figure out if this works across networks

## 🧑🏻‍💻 Developing Locally

There are 3 scripts in the `package.json` file that should help:
 - `test:publisher`: runs a test publisher that sends a bunch of logs to the server constantly (`test:publisher:json` to send JSON logs)
  - `dev:server`: runs the server that acts as the subscriber to the publishers
  - `dev:client`: runs the frontend server, that connects to the subscriber server (you only need to run this while developing).
  
### Running it locally as if it were installed on your machine
You can use the test:publisher and test:server scripts to test some log source locally, or install this locally and use it as a CLI tool:

```bash
$ npm install
```
And then

```bash
$ npm link
```

Then you can run `nerdTail` and `nerdTailServer` from anywhere in your system.

## 🙋🏻 FAQ

  
>### Why do you have separate server for the frontend and the subscriber-backend?
> Because a browser app can't interact with UDP sockets directly. So we need to have a separate server that can receive the UDP packets and then broadcast them to the browser (through websockets, but it could be anything really).
>### Why use Solid?
> It's supposed to be very fast, and I want this to be able to handle large loads of data
