import { Accessor, createSignal } from 'solid-js';
import { BottomNavigation, BottomNavigationAction, Box } from '@suid/material';
import styles from './NavBar.module.css';
import { Home, Stream } from '@suid/icons-material';
import { useLocation, useNavigate } from '@solidjs/router';

export default function NavBar({ streams }: { streams: Accessor<string[]> }) {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname.split('/');
  const [active, setActive] = createSignal(path.length > 2 ? path[2] : 'home');

  const handleChange = (newActive: string) => {
    if (newActive === active()) return;
    setActive(newActive);
    if (newActive === 'home') return navigate('/');
    navigate(`/stream/${newActive}`);
  };

  return (
    <Box class={styles.root}>
      <BottomNavigation
        showLabels
        value={active()}
        onChange={(_, newValue) => {
          handleChange(newValue);
        }}
      >
        <BottomNavigationAction label={'Home'} value={'home'} icon={<Home />} />
        {streams().map((stream) => (
          <BottomNavigationAction
            label={stream}
            value={stream}
            icon={<Stream />}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
