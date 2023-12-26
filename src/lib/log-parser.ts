import hljs from 'highlight.js';
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
  const parsedLog: LogMessage = {
    timestamp: log.timestamp && new Date(log.timestamp).toJSON(),
    html: undefined,
    raw: log.content,
    streamId: log.streamid,
  };

  try {
    if (log.contentType === 'json') {
      parsedLog.raw = `${JSON.stringify(JSON.parse(log.content), null, 2)}`;
    }
    parsedLog.html = hljs.highlight(parsedLog.raw, {
      language: log.contentType,
      ignoreIllegals: true,
    }).value;
  } catch (error) {
    console.error(`🐛 | parseLog | error:`, error);
  }

  return parsedLog;
}
