import styles from './LogLine.module.scss';
import { LogMessage } from '../lib/types';

export default function LogLine({ msg }: { msg: LogMessage }) {
  return (
    <div
      class={`${styles.line} ${!msg.timestamp && styles.lineWithoutTimestamp}`}
    >
      <div class={styles.streamId}>{msg.streamId}</div>
      {msg.timestamp && <div class={styles.timestamp}>{msg.timestamp}</div>}
      <pre
        class={`${styles.content} ${
          !msg.timestamp && styles.contentWithoutTimestamp
        }`}
        innerHTML={msg.formatted ?? msg.raw}
      />
    </div>
  );
}
