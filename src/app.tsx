import { Suspense } from 'solid-js/web';

import './index.css';
import NavBar from './components/NavBar';
import { CssBaseline, ThemeProvider, createTheme } from '@suid/material';
import { JSX } from 'solid-js';
import { streams } from './lib/store';

const darkTheme = createTheme({ palette: { mode: 'dark' } });

export function App(props: any): JSX.Element {
  console.log('App', streams());
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
