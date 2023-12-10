# ntail (nerdTail)
## A simple tool to see logs in the browser 🐛
ntail is a command line utility that grabs every line in stdin from a process, and broadcasts it over UDP. 
Tail log files, app output, or whatever you wish. See multiple streams in the browser, in realtime.

**Heavily inspired** by [rtail](https://github.com/kilianc/rtail) (we copied a lot of the implementation from there).

The way it works is that you pipe the output of a process to `ntail`, then you open `ntailServer` and then you open the browser to `http://localhost:8888` (or whatever port you specify).

This is very much a work in progress, and it's ABSOLUTELY NOT READY for production use.

## ⚙️ The way it works:

 - `nTail` expects to be piped a stream of logs from a process, it will then parse them and send them through a socket to the `nerdTail` server.
  ```bash
 # Example:
  YOUR_APP 2>&1 | rtail --noTimestamp <OTHER OPTIONS>
 ```
 
 - `nTailServer` will then broadcast the logs to a frontend (or many). The clients display the logs in the browser.

# ☑ TODO LIST (in order of priority):
 - [ ] Make it so that the nTailServer runs both the frontend and the BFF server at the same time (prefferably in the same process) (right now you've got to run `ntailServer` and `npm run:dev`)
 - [ ] Add filtering for logs in the UI
 - [ ] Add tests
 - [ ] Add more documentation
 - [ ] Figure out if this works across networks

## 🧑🏻‍💻 Developing Locally

There are 3 scripts in the `package.json` file that should help:
 - `test:publisher`: runs a test publisher that sends a bunch of logs to the server constantly
  - `test:server`: runs the server
  - `dev`: runs the frontend server
  
### Running it locally
You can use the test:publisher and test:server scripts to test it locally, or install this locally and use it as a CLI tool:

```bash
$ npm install
```
And then

```bash
$ npm link
```

Then you can run `ntail` and `ntailServer` from anywhere in your system.

## 🙋🏻 FAQ

  
>### Why a a separate server for the frontend and the backend?
> Because a browser app can't interact with UDP sockets directly. So we need to have a separate server that can receive the UDP packets and then broadcast them to the browser (through websockets, but it could be anything really).
>### Why use Solid?
> IDK, I regret it already, the server it's pretty slow. 
> I just wanted to give it another go. We might switch to something else.