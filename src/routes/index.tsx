import { Router, Route } from '@solidjs/router';
import { type JSX } from 'solid-js';

import Stream from './stream';
import Home from './home';

export function RouterHOC({
  root: RootElement,
}: {
  root: JSX.Element | any;
}): JSX.Element {
  return (
    <Router root={RootElement}>
      <Route path='/stream/:id' component={Stream} />
      <Route path='/' component={Home} />
    </Router>
  );
}
