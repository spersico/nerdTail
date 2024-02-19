import { Suspense } from 'solid-js/web';
import { createDexieArrayQuery } from 'solid-dexie';

import './index.css';
import NavBar from './components/NavBar';
import { For } from 'solid-js';
import { db, logFilteringLogic } from './lib/store';
import LogLine from './components/LogLine';

const EmptyMessage = () => (
  <p>
    Waiting for a stream of logs to show up.
    <br />
    <a href='https://github.com/kilianc/rtail' style={{ color: 'white' }}>
      Check out the original project docs to see how to pipe some streams.
    </a>
  </p>
);

export function App() {
  const logs = createDexieArrayQuery(logFilteringLogic);
  const streams = createDexieArrayQuery(() => db.streams.toArray());

  return (
    <Suspense>
      <main>
        <For each={logs} fallback={<EmptyMessage />}>
          {(msg) => <LogLine showStreamId={true} msg={msg} />}
        </For>
      </main>
      <NavBar streams={streams} />
    </Suspense>
  );
}
