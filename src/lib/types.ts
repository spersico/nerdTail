type RawMessage = Record<string, unknown> & {
  type: 'streams' | 'log' | 'unknown';
};

export type RawLogMessage = {
  host: string;
  port: number;
  contentType: string;
  streamid: string;
  timestamp: Date;
  structured: boolean;
  content: string;
  type?: string;
};

export const isRawLogMessage = (message: unknown): message is RawLogMessage => {
  return (message as RawMessage).type === 'log';
};

export type StreamsStatusMessage = {
  type: 'streams';
  streams: string[];
};

export const isStreamsStatusMessage = (
  message: unknown
): message is StreamsStatusMessage => {
  return (message as RawMessage).type === 'streams';
};

export type LogMessage = {
  streamId: string;
  timestamp?: string;
  html: string;
};
