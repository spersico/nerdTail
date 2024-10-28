import { createSignal } from 'solid-js';
import { parseLogMessage } from './log-parser';
import { LogMessage, RawLogMessage } from './types';
import Dexie, { Collection, Table } from 'dexie';

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
    const { id, streamId, timestamp, raw, formatted } = parseLogMessage(rawLog);
    await this.logs.add({ id, streamId, timestamp, raw, formatted });
  }

  async clearLogs() {
    await this.logs.clear();
  }

  async setStreams(backendStreams: string[]) {
    try {
      const currentStreams = await this.streams.toArray();
      const streamsToAdd = backendStreams
        .filter((stream) => !currentStreams.some((s) => s.id === stream))
        .map((stream) => ({ id: stream }));
      await this.streams.bulkAdd(streamsToAdd);
    } catch (error) {
      console.error(`setStreams:`, error, backendStreams);
    }
  }
}

export const db = new Store();

export const [filters, setFilters] = createSignal<{
  streamId?: string;
  search?: string;
}>({});

export async function logFilteringLogic(): Promise<LogMessage[]> {
  const { streamId, search } = filters();

  let collection = db.logs.toCollection();

  if (streamId) {
    collection = db.logs.where('streamId').equals(streamId);
  }

  if (typeof search === 'string' && !!search.trim()) {
    collection = collection.filter((log) => {
      return typeof search === 'string' && search
        ? log.raw.includes(search)
        : true;
    });
  }

  return collection.toArray();
}

export function clearLogs() {
  db.clearLogs();
}
