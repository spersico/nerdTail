import { createReconnectingWS } from '@solid-primitives/websocket';

export const webSocketServer = createReconnectingWS('ws://localhost:9999');
