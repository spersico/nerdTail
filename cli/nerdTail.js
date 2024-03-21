#!/usr/bin/env node
// @ts-check

import json5 from 'json5';
import yargs from 'yargs';
import namor from 'namor';
import debugLog from 'debug';
import split from "split";
import dgram from "dgram";

const debug = debugLog('nerdTail');
const debugSocket = debugLog('nerdTail:socket');
const options = await yargs(process.argv.slice(2))
  .scriptName("nerdTail")
  .usage('Usage: cmd | nerdTail Publisher Service [OPTIONS]')
  .example('server | nerdTail > server.log', 'localhost + file')
  .example('server | nerdTail --id api.domain.com', 'Name the log stream')
  .example('server | nerdTail --host example.com', 'Sends to example.com')
  .example('server | nerdTail --port 43567', 'Uses custom port')
  .example('server | nerdTail --mute', 'No stdout')
  .example('server | nerdTail --no-tty', 'Strips ansi colors')
  .option('host', {
    alias: 'h',
    type: 'string',
    default: 'localhost',
    describe: 'The server host'
  })
  .option('port', {
    alias: 'p',
    type: 'number',
    default: 9999,
    describe: 'The server port - Will use a random port if occupied'
  })
  .option('id', {
    alias: 'name',
    type: 'string',
    default: () => namor.generate(),
    describe: 'The log stream id - Will generate a random ID if not chosen'
  })
  .option('json', {
    alias: 's',
    type: 'boolean',
    describe: 'Attempt to parse JSON lines - Use when output is JSON or JSON5',
    default: false,
  })
  .option('timestamp', {
    type: 'boolean',
    default: false,
    describe: 'Adds a timestamp to each log line'
  })
  .option('mute', {
    alias: 'm',
    type: 'boolean',
    describe: 'Don\'t pipe stdin with stdout'
  })
  .help('help')
  .strict()
  .argv;

if (!options.mute) {
  process.stdin.pipe(process.stdout);
}

/** @type dgram.Socket */
let logsSocket;
/** @type {boolean} */
let isClosed;
/** @type {number} */
let isSending;
/** @type {boolean} */
let isReady;

function startSocketServer() {
  isClosed = false;
  isReady = false;
  isSending = 0;
  logsSocket = dgram.createSocket({ type: 'udp4' });
  logsSocket.bind(onBind);
  logsSocket.on('connect', onConnect);
  logsSocket.on('error', onError);
}

function onBind(eventName = 'bind') {
  const address = logsSocket.address();
  const logMessage = `
  🚀 Log Publisher binded to socket: ${address.address}:${address.port}.
  📝 Sending logs to socket: ${options.host}:${options.port}.
  `;

  debugSocket(logMessage);
  if (options.port === address.port) {
    const errorMessage = `🚨 Cannot bind to server port. Restarting this client's socket server to bind to another port.`;
    debugSocket(errorMessage);
    logsSocket.close(startSocketServer);
  } else {
    isReady = true;
    sendMessage({ subscriber: false, role: 'publisher' }, eventName);
  }
}

function onConnect() {
  return onBind('connect');
}

function onError(err) {
  // @ts-ignore
  if (err?.code === 'EADDRINUSE') return;
  debugSocket(`ERROR: ${err.stack}`);
}

function logParse(line, type = 'log') {
  const message = { id: options.id, contentType: 'plaintext', content: line, type };
  if (options.timestamp) {
    message.timestamp = new Date().toISOString();
  }
  if (options.json) {
    try {
      message.structured = json5.parse(line);
      message.contentType = 'json';
    } catch (err) {
      debug('Error parsing line', line);
    }
  }
  return JSON.stringify(message);
}

function sendMessage(data, type) {
  if (!isReady) return debugSocket(`ERROR SENDING: Socket not ready`);
  const message = logParse(data, type);
  const payload = Buffer.from(message);

  isSending++;
  logsSocket.send(payload, 0, payload.length, options.port, options.host, function (err) {
    if (err) { debugSocket(`ERROR SENDING: ${err.stack}`); }
    else { debugSocket(`Broadcasted ${message} `); }
    isSending--;
    if (isClosed && !isSending) logsSocket.close();
  });
}

function closeConnection(event) {
  debug('stdin closed with event:${event}');
  sendMessage({ event }, 'close');
  isClosed = true;
  logsSocket.close();
}



startSocketServer();
process.stdin.pipe(split(null, null, { trailing: false })).on('data', sendMessage);
process.stdin.on('end', () => closeConnection('end'));
process.stdin.on('unpipe', () => closeConnection('unpipe'));
process.stdin.on('finish', () => closeConnection('finish'));