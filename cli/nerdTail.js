#!/usr/bin/env node
// @ts-check

import json5 from 'json5';
import yargs from 'yargs';
import namor from 'namor';
import debugLog from 'debug';
import split from "split";
import dgram from "dgram";

const debug = debugLog('nerdtail');
const debugSocket = debugLog('nerdtail:socket');
const options = await yargs(process.argv.slice(2))
  .scriptName("ntail")
  .usage('Usage: cmd | ntail Publisher Service [OPTIONS]')
  .example('server | ntail > server.log', 'localhost + file')
  .example('server | ntail --id api.domain.com', 'Name the log stream')
  .example('server | ntail --host example.com', 'Sends to example.com')
  .example('server | ntail --port 43567', 'Uses custom port')
  .example('server | ntail --mute', 'No stdout')
  .example('server | ntail --no-tty', 'Strips ansi colors')
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
  .help('help')
  .strict()
  .argv;

const logsSocket = dgram.createSocket({ type: 'udp4' });
let isClosed = false;
let isSending = 0;

logsSocket.bind(options.port, options.host, () => {
  logsSocket.setBroadcast(true);
  const address = logsSocket.address();
  debugSocket(`📝 Sending logs to socket: ${address.address}:${address.port}`);
  sendMessage({ subscriber: false, role: 'publisher' }, 'listening');
});

logsSocket.on('connect', () => {
  const address = logsSocket.address();
  debugSocket(`📝 Sending logs to socke (c)t: ${address.address}:${address.port}`);
  sendMessage({ subscriber: false, role: 'publisher' }, 'connect');
});

logsSocket.on('error', (err) => {
  // @ts-ignore
  if (err?.code === 'EADDRINUSE') return;
  debugSocket(`server error:\n${err.stack}`);
});

function logParse(line, type = 'log') {
  const message = { id: options.id, contentType: 'string', content: line, type };
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
  const message = logParse(data, type);
  const payload = Buffer.from(message);

  isSending++;
  logsSocket.send(payload, 0, payload.length, options.port, options.host, function (err) {
    if (err) { debugSocket(`ERROR SENDING:\n${err.stack}`); }
    else { debugSocket(`Broadcasted ${message}`); }
    isSending--;
    if (isClosed && !isSending) logsSocket.close();
  });
}

process.stdin
  .pipe(split(null, null, { trailing: false }))
  .on('data', sendMessage);


function closeConnection(event) {
  debug('stdin closed with event:${event}');
  sendMessage({ event }, 'close');
  isClosed = true;
  logsSocket.close();
}

process.stdin.on('end', () => closeConnection('end'));
process.stdin.on('unpipe', () => closeConnection('unpipe'));
process.stdin.on('finish', () => closeConnection('finish'));