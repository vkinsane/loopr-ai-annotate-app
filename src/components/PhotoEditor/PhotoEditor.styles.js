const HANDLE_PX = 44 // the touch area; the dot inside is smaller
const DOT_PX = 14

export const styles = {
  paper: { bgcolor: 'background.default', color: 'text.primary', backgroundImage: 'none' },
  top: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', pl: 0.5, pr: 1.5, py: 1 },
  close: { width: 44, height: 44 },
  title: { typography: 'h2' },
  done: { justifySelf: 'end', minHeight: 44, px: 2.5 },
  // Padding leaves room for the corner handles; the dimming outside the crop stops at this edge.
  viewport: {
    flexGrow: 1, minHeight: 0, p: 3, overflow: 'hidden', containerType: 'size',
    display: 'grid', placeItems: 'center', textAlign: 'center',
  },
  // The largest box with the photo's shape. Hidden until the photo is decoded.
  frame: (size, failed) => ({
    display: size && !failed ? 'block' : 'none', position: 'relative', touchAction: 'none', userSelect: 'none',
    ...(size && { aspectRatio: `${size.width} / ${size.height}`, width: `min(100cqw, 100cqh * ${size.width / size.height})` }),
  }),
  canvas: { display: 'block', width: '100%', height: '100%' },
  // The shadow dims everything outside the crop.
  crop: {
    position: 'absolute', border: 2, borderColor: 'common.white', cursor: 'move',
    boxShadow: (theme) => `0 0 0 100vmax ${theme.palette.brand.scrim}`,
  },
  handle: (vertical, horizontal) => ({
    position: 'absolute', [vertical]: -HANDLE_PX / 2, [horizontal]: -HANDLE_PX / 2, width: HANDLE_PX, height: HANDLE_PX,
    // Top-left and bottom-right resize along one diagonal, the other two along the other.
    cursor: (vertical === 'top') === (horizontal === 'left') ? 'nwse-resize' : 'nesw-resize',
    '&::after': {
      content: '""', position: 'absolute', inset: (HANDLE_PX - DOT_PX) / 2, borderRadius: '50%', bgcolor: 'common.white',
      boxShadow: (theme) => `0 0 4px ${theme.palette.brand.scrim}`, pointerEvents: 'none',
    },
  }),
  controls: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, px: 2, pt: 1, pb: 4 },
  // One row on any phone: icon above the label.
  tools: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, width: '100%', maxWidth: 400 },
  tool: {
    flexDirection: 'column', gap: 0.25, minHeight: 56, py: 0.75, borderRadius: 2, typography: 'caption', fontWeight: 600,
    bgcolor: 'background.paper', color: 'text.primary', '& .MuiButton-startIcon': { m: 0 },
    '&:hover': { bgcolor: 'brand.carbonBorder' }, '&[aria-pressed="true"]': { bgcolor: 'primary.main', color: 'primary.contrastText' },
  },
  hint: { typography: 'caption', color: 'text.secondary', textAlign: 'center' },
}
