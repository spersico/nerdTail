import { webSocketServer } from './socket';
import { parseLog, parseMessage } from './log-parser';
import { LogMessage, isRawLogMessage, isStreamsStatusMessage } from './types';
import { createSignal } from 'solid-js';

export const [streams, setStreams] = createSignal<string[]>([]);

export const [messages, setMessages] = createSignal<LogMessage[]>([]);

webSocketServer.addEventListener('connect', (ev) => {
  console.log('Connected', ev);
});

webSocketServer.addEventListener('open', (ev) => {
  console.log(`🐛 | open:`, ev);
});

webSocketServer.addEventListener('message', (ev) => {
  const parsedMessage = parseMessage(ev.data);
  if (isStreamsStatusMessage(parsedMessage)) {
    setStreams(
      parsedMessage.streams.filter((stream) => stream !== '_common_room')
    );
  } else if (isRawLogMessage(parsedMessage)) {
    const parsedLog = parseLog(parsedMessage);
    console.log(
      `🐛 | got log from ${parsedLog.streamId}: ${parsedMessage.content.slice(
        0,
        20
      )}...`
    );
    setMessages((prev) => [...prev, parsedLog]);
  }
});
