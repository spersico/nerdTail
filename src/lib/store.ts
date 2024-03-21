import { createSignal } from 'solid-js';
import { parseLog } from './log-parser';
import { LogMessage, RawLogMessage } from './types';
import Dexie, { Table } from 'dexie';

export class Store extends Dexie {
  streams!: Table<{ id: string }, string>;
  logs!: Table<LogMessage, string>;

  constructor() {
    super('nerdTail');
    this.version(1).stores({
      streams: 'id',
      logs: 'id, streamId, timestamp, raw',
    });
  }

  async addLog(rawLog: RawLogMessage) {
    const { id, streamId, timestamp, raw } = parseLog(rawLog);
    await this.logs.add({ id, streamId, timestamp, raw });
  }

  async clearLogs() {
    await this.logs.clear();
  }

  async setStreams(backendStreams: string[]) {
    const streams = backendStreams
      .filter((stream) => stream !== '_common_room')
      .map((stream) => ({ id: stream }));
    await this.streams.clear();
    await this.streams.bulkAdd(streams);
  }
}

export const db = new Store();

export const [filters, setFilters] = createSignal<{
  streamId?: string;
  search?: string;
}>({});

export function logFilteringLogic() {
  const { streamId, search } = filters();

  if (typeof streamId !== 'string' && typeof search !== 'string')
    return db.logs.toArray();

  if (streamId)
    return db.logs
      .where('streamId')
      .equals(streamId)
      .filter((log) => {
        return typeof search === 'string' && search
          ? log.raw.includes(search)
          : true;
      })
      .toArray();

  return db.logs
    .filter((log) => {
      return typeof search === 'string' && search
        ? log.raw.includes(search)
        : true;
    })
    .toArray();
}
