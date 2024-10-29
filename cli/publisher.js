#!/usr/bin/env node
// @ts-check

import json5 from 'json5';
import yargs from 'yargs';
import namor from 'namor';
import debugLog from 'debug';
import split from "split";
import dgram from "dgram";

const debug = debugLog('logLens');
const debugSocket = debugLog('logLens:socket');
const options = await yargs(process.argv.slice(2))
  .scriptName("logLensPub")
  .usage('Usage: cmd | logLensPub [OPTIONS]')
  .example('server | logLensPub', 'This will pipe the output of the server and send it to the subscriber')
  .example('cat logs.txt | logLensPub', 'This will pipe the output of the command and send it to the subscriber')
  .example('server | logLensPub --id api.domain.com', 'Name the log stream')
  .example('server | logLensPub --mute', 'No stdout')
  .example('server | logLensPub > server.log', 'localhost + file - You can redirect the output to a file (as long as you don\'t use --mute)')
  .example('server | logLensPub --port 43567', 'Uses custom port')
  .example('server | logLensPub --host example.com', 'Sends to example.com')
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
  .option('contentType', {
    alias: 'ct',
    choices: ['plaintext', 'json'],
    describe: 'Used to give hints to the server on how to parse the log line',
    default: 'plaintext',
  })
  .option('timestamp', {
    alias: 't',
    type: 'boolean',
    describe: 'Adds a timestamp to each log line',
    default: false,
  })
  .option('mute', {
    alias: 'm',
    type: 'boolean',
    describe: 'Don\'t pipe stdin with stdout',
    default: false,
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
  if (err?.code === 'EADDRINUSE') return;
  debugSocket(`ERROR: ${err.stack}`);
}


function logParse(line, type = 'log') {
  let message = { id: options.id, content: line, contentType: options.contentType, type };
  if (options.timestamp) {
    message.timestamp = new Date().toISOString();
  }

  // MAYBE?: use another stringifier here. Can this fail?
  return JSON.stringify(message);
}

async function sendMessage(data, type) {
  if (!isReady) return debugSocket(`ERROR SENDING: Socket not ready`);
  const payload = Buffer.from(logParse(data, type));

  isSending++;
  logsSocket.send(payload, 0, payload.length, options.port, options.host, function (err) {
    if (err) { debugSocket(`ERROR SENDING: ${err.stack}`); }
    else { debugSocket(`Broadcasted ${payload.toString()} `); }
    isSending--;
    if (isClosed && !isSending) logsSocket.close();
  });
}

function closeConnection(event) {
  if (isClosed) return;
  debug('stdin closed with event:${event}');
  sendMessage({ event }, 'close');
  isClosed = true;
}

// Listen for the SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  closeConnection('SIGINT');
});

startSocketServer();
process.stdin.pipe(split(null, null, { trailing: false })).on('data', sendMessage);
process.stdin.on('end', () => closeConnection('end'));
process.stdin.on('exit', () => closeConnection('exit'));
process.stdin.on('unpipe', () => closeConnection('unpipe'));
process.stdin.on('finish', () => closeConnection('finish'));