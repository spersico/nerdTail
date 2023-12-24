import styles from './LogLine.module.scss';
import { LogMessage } from '../lib/types';

export default function LogLine({
  msg,
  showStreamId = false,
}: {
  msg: LogMessage;
  showStreamId?: boolean;
}) {
  return (
    <div
      class={`${styles.line} ${!msg.timestamp && styles.lineWithoutTimestamp}`}
    >
      {showStreamId && <div class={styles.timestamp}>{msg.streamId}</div>}

      {msg.timestamp && (
        <div class={styles.timestamp}>{new Date(msg.timestamp).toJSON()}</div>
      )}
      <pre
        class={`${styles.content} ${
          !msg.timestamp && styles.contentWithoutTimestamp
        }`}
      >
        {msg.html}
      </pre>
    </div>
  );
}
