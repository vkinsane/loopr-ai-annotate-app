import { useState } from 'react'
import { Cameraswitch, Check } from '@mui/icons-material'
import { IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import { styles } from './CameraMenu.styles.js'

/** Lists the cameras from useCameraList and marks the one in use. With one camera, it shows which camera that is. */
export default function CameraMenu({ cameras, currentId, disabled, onSelect }) {
  const [anchor, setAnchor] = useState(null)
  if (cameras.length === 0) return null

  function choose(id) {
    setAnchor(null)
    if (id !== currentId) onSelect(id)
  }

  return (
    <>
      <IconButton
        aria-label="Choose camera"
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        disabled={disabled}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={styles.button}
      >
        <Cameraswitch />
      </IconButton>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {cameras.map((camera) => (
          <MenuItem key={camera.id} selected={camera.id === currentId} onClick={() => choose(camera.id)} sx={styles.item}>
            <ListItemIcon>{camera.id === currentId && <Check fontSize="small" />}</ListItemIcon>
            {camera.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
