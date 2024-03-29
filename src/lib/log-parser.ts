import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { LogMessage, RawLogMessage } from './types';

export function parseMessage(message: unknown): RawLogMessage | null {
  let parsedMessage: RawLogMessage;
  try {
    parsedMessage = JSON.parse(message as string);
  } catch (error) {
    console.error(`🐛 | parseMessage | error:`, error);
    return null;
  }

  return parsedMessage;
}

export function parseLog(log: RawLogMessage): LogMessage {
  const timestamp = log.timestamp ? new Date(log.timestamp) : new Date();
  const parsedLog: LogMessage = {
    id: `${timestamp.getTime()}-${log.streamid}-${Math.random()
      .toString(36)
      .substring(5)}`,
    timestamp: timestamp.toJSON(),
    formatted: log.content,
    raw: log.content,
    streamId: log.streamid,
  };

  try {
    if (log.contentType === 'json') {
      parsedLog.raw = `${JSON.stringify(JSON.parse(log.content), null, 2)}`;
    }
    parsedLog.formatted = hljs.highlight(parsedLog.raw, {
      language: log.contentType,
      ignoreIllegals: true,
    }).value;
  } catch (error) {
    console.error(`🐛 | parseLog | error:`, error);
  }

  return parsedLog;
}
