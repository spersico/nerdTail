import { For, onMount } from 'solid-js';
import { webSocketServer } from '../lib/socket';
import { messages, setMessages } from '../lib/store';
import LogLine from '../components/LogLine';

const EmptyMessage = () => (
  <p>
    Waiting for a stream of logs to show up.
    <br />
    <a href='https://github.com/kilianc/rtail' style={{ color: 'white' }}>
      Check out the original project docs to see how to pipe some streams.
    </a>
  </p>
);

export default function Home() {
  onMount(() => {
    webSocketServer.send(JSON.stringify({ type: 'subscribe' }));
    setMessages([]);
  });

  return (
    <main>
      <For each={messages()} fallback={<EmptyMessage />}>
        {(msg) => <LogLine showStreamId={true} msg={msg} />}
      </For>
    </main>
  );
}
