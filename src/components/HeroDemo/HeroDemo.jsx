import { Box, Typography } from '@mui/material'
import samplePart from '../../assets/sample-part.jpg'
import { styles } from './HeroDemo.styles.js'

const CORNERS = [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']]
const STEPS = ['Capture', 'Check', 'Annotate']

/** A 6-second CSS loop of the app's flow. With reduced motion it shows the last frame only. */
export default function HeroDemo() {
  return (
    <Box
      role="img"
      aria-label="Demo: a photo is captured, passes the quality check, then two annotations are added"
      sx={styles.root}
    >
      <Box sx={styles.frame}>
        <Box component="img" src={samplePart} alt="" sx={styles.photo} />
        <Box sx={styles.guides}>
          {CORNERS.map(([vertical, horizontal]) => (
            <Box key={vertical + horizontal} component="span" sx={styles.corner(vertical, horizontal)} />
          ))}
        </Box>
        <Box sx={styles.flash} />
        <Box sx={styles.boxSelected}>
          <Box component="span" sx={styles.labelSelected}>
            Annotation 1
          </Box>
        </Box>
        <Box sx={styles.boxOther}>
          <Box component="span" sx={styles.labelOther}>
            Annotation 2
          </Box>
        </Box>
        <Typography component="span" sx={styles.pill}>
          ✓ Photo quality good
        </Typography>
      </Box>

      <Box component="ol" aria-hidden sx={styles.steps}>
        {STEPS.map((step, index) => (
          <Box component="li" key={step} sx={styles.step(index)}>
            <Box component="span" sx={styles.stepNumber}>
              {index + 1}
            </Box>
            {step}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
