import { CenterFocusStrongOutlined, LockOutlined } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import HeroDemo from '../components/HeroDemo/HeroDemo.jsx'
import ScrollThumb from '../components/ScrollThumb/ScrollThumb.jsx'
import { styles } from './LandingScreen.styles.js'

export default function LandingScreen({ onNext }) {
  return (
    <Box sx={styles.root}>
      <ScrollThumb />
      <Box component="header" sx={styles.bar}>
        <Box sx={styles.header}>
          <Box sx={styles.logo}>
            <CenterFocusStrongOutlined sx={styles.logoIcon} />
          </Box>
          <Typography component="span" sx={styles.brand}>
            Loopr Annotate
          </Typography>
        </Box>
      </Box>

      <Box component="main" sx={styles.main}>
        <Box sx={styles.copy}>
          <Typography sx={styles.overline}>Photo inspection</Typography>
          <Typography component="h1" sx={styles.headline}>
            Check every photo.
            <br />
            <Box component="span" sx={styles.highlight}>
              Annotate every detail.
            </Box>
          </Typography>
          <Typography sx={styles.intro}>
            Take a photo, check that it is clear, and annotate what you find.
          </Typography>
        </Box>

        <Box sx={styles.demo}>
          <HeroDemo />
        </Box>

        <Box sx={styles.cta}>
          <Typography sx={styles.privacy}>
            <LockOutlined sx={styles.privacyIcon} />
            Works in the browser. Photos stay on this device.
          </Typography>
          <Button variant="contained" size="large" fullWidth onClick={onNext} sx={styles.button}>
            Start inspection
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
