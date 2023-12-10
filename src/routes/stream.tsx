import { For, createResource } from 'solid-js';
import LogLine from '../components/LogLine';
import FloatingButtons from '../components/Tail';

import { messages, setMessages } from '../lib/store';
import { useParams } from '@solidjs/router';
import { webSocketServer } from '../lib/socket';

export default function Stream() {
  const params = useParams();
  createResource(
    () => params.id,
    () => {
      webSocketServer.send(
        JSON.stringify({ type: 'subscribe', id: params.id })
      );
      setMessages([]);
    }
  );

  return (
    <main>
      <For each={messages()}>{(msg) => <LogLine msg={msg} />}</For>

      {messages().length && <FloatingButtons />}
    </main>
  );
}
