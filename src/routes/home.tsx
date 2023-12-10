import { For, onMount } from 'solid-js';
import { webSocketServer } from '../lib/socket';
import { messages, setMessages } from '../lib/store';
import LogLine from '../components/LogLine';
import FloatingButtons from '../components/Tail';

export default function Home() {
  onMount(() => {
    webSocketServer.send(JSON.stringify({ type: 'subscribe' }));
    setMessages([]);
  });

  return (
    <main>
      <h1>Nerd Pipe</h1>
      {!messages().length && (
        <p>
          Choose a stream from the bottom navigation bar to start watching. Or
          go to the{' '}
          <a href='https://github.com/kilianc/rtail' style={{ color: 'white' }}>
            to see how to pipe some streams here
          </a>
        </p>
      )}

      <For each={messages()}>
        {(msg) => <LogLine showStreamId={true} msg={msg} />}
      </For>

      {messages().length && <FloatingButtons />}
    </main>
  );
}
