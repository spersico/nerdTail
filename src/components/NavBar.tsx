import { Accessor, createSignal } from 'solid-js';
import styles from './NavBar.module.scss';

import { useLocation, useNavigate } from '@solidjs/router';

export default function NavBar({ streams }: { streams: Accessor<string[]> }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/');
  const [active, setActive] = createSignal(path.length > 2 ? path[2] : 'home');

  const handleChange = (destination: string) => {
    if (destination === active()) return;
    setActive(destination);
    if (destination === 'home') return navigate('/');
    navigate(`/stream/${destination}`);
  };

  return (
    <nav class={styles.root}>
      <ul class={styles.ul}>
        {['home', ...streams()].map((stream) => (
          <li
            class={[styles.item, active() === stream ? styles.active : '']
              .filter(Boolean)
              .join(' ')}
          >
            <button onClick={() => handleChange(stream)}>{stream}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
