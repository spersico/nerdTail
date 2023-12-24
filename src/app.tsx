import { Suspense } from 'solid-js/web';

import './index.css';
import NavBar from './components/NavBar';
import { JSX } from 'solid-js';
import { streams } from './lib/store';

export function App(props: any): JSX.Element {
  console.log('App', streams());
  return (
    <Suspense>
      {props.children}
      <NavBar streams={streams} />
    </Suspense>
  );
}
