import { render } from 'solid-js/web';
import { RouterHOC } from './routes';
import { App } from './app';

const root = document.getElementById('root');

render(() => <RouterHOC root={App} />, root!);
