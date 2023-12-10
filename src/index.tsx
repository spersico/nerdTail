/* @refresh reload */
import { Suspense, render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';

import './index.css';
import NavBar from './components/NavBar';
import { CssBaseline, ThemeProvider, createTheme } from '@suid/material';
import Stream from './routes/stream';
import Home from './routes/home';
import { JSX } from 'solid-js';
import { streams } from './lib/store';

const root = document.getElementById('root');

const darkTheme = createTheme({ palette: { mode: 'dark' } });

function Root(props: any): JSX.Element {
  console.log('Root', streams());
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Suspense>
        {props.children}
        <NavBar streams={streams} />
      </Suspense>
    </ThemeProvider>
  );
}

render(
  () => (
    <Router root={Root}>
      <Route path='/stream/:id' component={Stream} />
      <Route path='/' component={Home} />
    </Router>
  ),
  root!
);
