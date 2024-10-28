import { onMount } from 'solid-js';
import styles from './NavBar.module.scss';
import { subscribeToRoom } from '../lib/socket';
import { clearLogs, filters, setFilters } from '../lib/store';

export default function NavBar({ streams }: { streams: { id: string }[] }) {
  onMount(() => {
    subscribeToRoom();
  });

  const handleStreamSelection = (event: Event) => {
    const { streamId: oldStreamId, search } = filters();

    const newValue = (event.target as HTMLSelectElement).value;
    if (newValue === oldStreamId) return;
    const streamId = newValue === '_common_room' ? undefined : newValue;
    setFilters(() => ({ streamId, search }));
  };

  return (
    <nav class={styles.root}>
      <select onChange={handleStreamSelection}>
        <option value='_common_room'>All Sources</option>
        {streams.map(({ id: stream }: { id: string }) => (
          <option
            class={[
              styles.item,
              filters().streamId === stream ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
            value={stream}
          >
            {stream}
          </option>
        ))}
      </select>
      <button onClick={clearLogs}>Clear Logs</button>

      <input
        type='text'
        placeholder='Search'
        onInput={(event) => {
          setFilters(() => ({
            ...filters(),
            search: (event.target as HTMLInputElement).value,
          }));
        }}
      ></input>
    </nav>
  );
}
