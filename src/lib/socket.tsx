import { createReconnectingWS } from '@solid-primitives/websocket';
import { parseMessage } from './log-parser';
import {
  SubscriptionMessage,
  isRawLogMessage,
  isStreamsStatusMessage,
} from './types';
import { db } from './store';

export const webSocketServer = createReconnectingWS('ws://localhost:9999');

webSocketServer.addEventListener('message', (ev) => {
  const parsedMessage = parseMessage(ev.data);
  if (isStreamsStatusMessage(parsedMessage)) {
    db.setStreams(parsedMessage.streams);
  } else if (isRawLogMessage(parsedMessage)) {
    db.addLog(parsedMessage);
  }
});

export function subscribeToRoom(streamId?: string) {
  const message: SubscriptionMessage = { type: 'subscribe' };
  if (streamId) {
    message['streamid'] = streamId;
  }

  webSocketServer.send(JSON.stringify(message));
}
