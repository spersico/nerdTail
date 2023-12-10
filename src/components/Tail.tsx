import ExpandCircleDownIcon from '@suid/icons-material/ExpandCircleDown';
import { Box, Fab } from '@suid/material';
import styles from './Tail.module.css';

export default function FloatingButtons() {
  return (
    <Box class={styles.root}>
      <Fab color='primary' aria-label='tail'>
        <ExpandCircleDownIcon />
      </Fab>
    </Box>
  );
}
