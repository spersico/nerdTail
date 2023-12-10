import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import { LogMessage, RawLogMessage } from './types';
hljs.registerLanguage('json', json);

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
  let formattedContent = log.content;

  if (log.contentType === 'json') {
    // for object just format JSON
    formattedContent = hljs.highlight(
      JSON.stringify(formattedContent, null, ''),
      {
        language: 'json',
      }
    ).value;
  }

  return {
    timestamp: log.timestamp && new Date(log.timestamp).toJSON(),
    html: formattedContent,
    streamId: log.streamid,
  };
}
