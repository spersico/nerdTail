import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { LogMessage, RawLogMessage } from './types';

export function parseRawMessage(message: unknown): RawLogMessage | null {
  let parsedMessage: RawLogMessage;
  try {
    parsedMessage = JSON.parse(message as string);
  } catch (error) {
    console.error(`🐛 | parseMessage | error:`, error);
    return null;
  }

  return parsedMessage;
}

const Strategies: Record<
  'plaintext' | 'json',
  (message: LogMessage) => LogMessage
> = {
  json(message: LogMessage) {
    try {
      const nicerJson = `${JSON.stringify(JSON.parse(message.raw), null, 2)}`;

      message.formatted = hljs.highlight(nicerJson, {
        language: 'json',
        ignoreIllegals: true,
      }).value;
      return message;
    } catch (error) {
      return this.plaintext(message);
    }
  },
  plaintext(message: LogMessage) {
    try {
      if (typeof message.raw !== 'string') {
        message.raw = JSON.stringify(message.raw, null, 2);
      }
      message.formatted = hljs.highlightAuto(message.raw).value;
      return message;
    } catch (error) {
      console.error(`🐛 | Strategies.plaintext | error:`, error);
      return message;
    }
  },
};

export function parseLogMessage(log: RawLogMessage): LogMessage {
  const timestamp = log.timestamp ? new Date(log.timestamp) : new Date();
  const message: LogMessage = {
    id: `${timestamp.getTime()}-${log.streamid}-${Math.random()
      .toString(36)
      .substring(5)}`,
    timestamp: timestamp.toJSON(),
    formatted: log.content,
    raw: log.content,
    streamId: log.streamid,
  };
  return Strategies[log.contentType](message);
}
