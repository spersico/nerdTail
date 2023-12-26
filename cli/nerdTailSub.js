#!/usr/bin/env node

// @ts-check

'use strict';
import dgram from 'dgram';
import Koa from 'koa';
import WebSocket, { WebSocketServer } from 'ws';
import debugLog from 'debug';
import yargs from 'yargs/yargs';
import namor from 'namor';
import serve from "koa-static";
import { URL } from 'url';

const debugSocket = debugLog('nerdtail:socket');
const debugWebSocket = debugLog('nerdtail:websocket');
const options = await yargs(process.argv.slice(2))
  .scriptName("ntailSub")
  .usage('Usage: ntailSub [OPTIONS]')
  .option('host', {
    alias: 'uh',
    default: 'localhost',
    describe: 'The listening UDP hostname'
  })
  .option('port', {
    alias: 'up',
    default: 9999,
    describe: 'The listening UDP port'
  })
  .help('help')
  .alias('help', 'h')
  .strict()
  .argv;

/**
 * This is a pass-trough server, that translates UDP messages to websocket messages
 - We listen on the local socket for UDP messages.
 - We broadcast the messages to clients (frontend)
 - We re-send the streams list to the clients on connection 
 - TODO: implement rooms, so we can broadcast messages only to interested clients
 */
const logsSocket = dgram.createSocket({ type: 'udp4' });
const koaInstance = new Koa();
const bffServer = koaInstance.listen(options.port, options.host,
  () => console.log(`🚀 Listening Server live on http://${options.host}:${options.port}`)
);
/** @type {import('ws').WebSocketServer} */
const frontendWebsocketServer = new WebSocketServer({ server: bffServer });

/** Serve the built frontend. */
const __dirname = new URL('./nerdtailSub-frontend', import.meta.url).pathname;
koaInstance.use(serve(decodeURIComponent(__dirname), { index: 'index.html' }));



/** @ts-ignore @type {{ [key: string]: {last: number, subscribers: any[]} } & { _common_room: {subscribers: any[]} }}  */
const streams = { _common_room: { subscribers: [] } };

/** @type {{ [key: string]: any } } */
const clients = {};

/**
 * Prepares
 * @returns {WebSocketMessage}
 */
function prepareStreamsMessage() {
  return { type: 'streams', streams: Object.keys(streams) };
}

/**
 * Broadcasts the message to all the subscribed clients
 * @param {WebSocketMessage} data 
 */
function broadcastToFrontend(data) {
  if (data.type === 'streams') {
    debugWebSocket(`Broadcasting streams:`, data.streams);
  } else {
    debugWebSocket(`Broadcasting ${data.type} from ${data.streamid}:`, data.content);
  }
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  const clientsToSend = !data.streamid ? Object.keys(clients) : [...streams[data.streamid].subscribers, ...streams._common_room.subscribers];
  clientsToSend.forEach(function each(clientId) {
    const client = clients[clientId];
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });

}

function messageSocket(event) {
  const message = Buffer.from(JSON.stringify({ type: event, role: 'subscriber' }));
  logsSocket.send(message, 0, message.length, options.port, options.host, function (err) {
    if (err) { debugSocket(`ERROR SENDING:\n${err.stack}`); }
    else { debugSocket(`Broadcasted ${message}`); }
  });
}

/**
 * @typedef { { 
 * type: 'log'|'connected'|'listening'|'subscribe'|'close', 
* role?: 'publisher'|'subscriber', 
* id: string, 
* timestamp: string, 
* content: string, 
* contentType: string} } SocketMessage
 */

/**
 * @typedef { { 
 * type: string,
 * timestamp?: string,
 * streamid?: string,
 * content?: string,
 * contentType?: string,
 * streams?: string[] } } WebSocketMessage
 */

/**
 * Decodes the message and returns it in a structured format
 * @param {unknown} data 
 * @returns {null | SocketMessage}
 */
function decodeSocketMessage(data) {
  // try to decode JSON
  try {
    // @ts-ignore
    data = JSON.parse(data);
    // @ts-ignore
    return data;
  }
  catch (err) {
    debugSocket('Error parsing line - message will be dropped', data, err);
    return null;
  }
}



logsSocket.bind(options.port, options.host, () => {
  logsSocket.setBroadcast(true);
  const address = logsSocket.address();
  debugSocket(`📝 Listening to logs on socket: ${address.address}:${address.port}`);
  messageSocket('listening');
});


logsSocket.on('connect', () => {
  logsSocket.setBroadcast(true);
  const address = logsSocket.address();
  debugSocket(`📝  Connected to logs on socket: ${address.address}:${address.port}`);
  messageSocket('connected');
});

logsSocket.on('error', (err) => {
  debugSocket(`Log socket error:\n${err.stack}`);

  // @ts-ignore
  if (err?.code === 'EADDRINUSE') {
    console.error('\x1b[41m%s\x1b[0m', 'CRITICAL ERROR: The socket port is already in use');
    console.error('\x1b[31m%s\x1b[0m', `\nThis means that some other process is already listening on port ${options.port} on ${options.host}.\n
    Please check if you have another instance of ntail running, or if you have another process listening on that port.
    OR set another port in both publishers and subscribers, using the --port option.`);
    process.exit(1);
  }
});

logsSocket.on('close', (err) => {
  debugSocket(`Log socket closed:\n${err.stack}`);
});

logsSocket.on('message', function (rawData, origin) {
  debugSocket(`Received message from ${origin.address}:${origin.port}`, rawData.toString());
  const data = decodeSocketMessage(rawData);
  if (!data || (data.type === 'listening' && data.role === 'subscriber')) return;
  if (!streams[data.id]) {
    debugSocket(`New stream id: ${data.id}`);
    // if the stream wasn't present before, add it to the list
    streams[data.id] = { last: Date.now(), subscribers: [] };
    broadcastToFrontend(prepareStreamsMessage());
  };

  // and broadcast the new list to the clients
  const message = {
    timestamp: data.timestamp,
    streamid: data.id,
    content: data.content,
    contentType: typeof data.content,
    type: 'log',
  };
  streams[data.id].last = Date.now();
  broadcastToFrontend(message);
});

/** @type {import('ws').WebSocketServer} */
frontendWebsocketServer.on('connection', function (clientWS) {
  const clientId = namor.generate();
  clients[clientId] = clientWS;
  streams._common_room.subscribers.push(clientId);
  debugWebSocket(`New client connected (named it ${clientId}) - Added to common room`);

  const streamsMessage = prepareStreamsMessage();
  debugWebSocket(`Sending welcome streams list to ${clientId}: ${streamsMessage.streams}`);
  clientWS.send(JSON.stringify(streamsMessage));

  clientWS.on('message', function (message) {
    debugWebSocket(`Received message from ${clientId}`, message.toString());

    /** @type {WebSocketMessage } */
    const decodedMessage = JSON.parse(message.toString());
    if (!decodedMessage?.type) return;
    if (decodedMessage.type === 'subscribe') {
      debugWebSocket(`Client ${clientId} wants to subscribe to ${decodedMessage.streamid}`);
      if (decodedMessage.streamid && !streams[decodedMessage.streamid]) {
        debugWebSocket(`Stream ${decodedMessage.streamid} not found, dropping message`);
        return;
      }

      Object.keys(streams).forEach((streamRoom) => {
        streams[streamRoom].subscribers = streams[streamRoom].subscribers.filter((id) => id !== clientId);
      });

      if (decodedMessage.streamid) {
        streams[decodedMessage.streamid].subscribers.push(clientId);
        debugWebSocket(`Moved ${clientId} to ${decodedMessage.streamid} subscribers`);
        return;
      } else {
        streams._common_room.subscribers.push(clientId);
        debugWebSocket(`Moved ${clientId} to common room`);
        return;
      }
    }

  });

  clientWS.on('close', function close() {
    clients[clientId] = null;
    debugWebSocket(`Closed connection from ${clientId}`);
  });
});




