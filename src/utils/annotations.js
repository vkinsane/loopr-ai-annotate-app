// An item is { id, label, x, y, width, height } in photo pixels.
export const initialAnnotations = { items: [], selectedId: null, nextNumber: 1 }

const LABEL_BELOW_FROM_TOP = 0.08

export const boxLabel = (item) => item.label || 'Untitled'
/** A box at the very top has no room for its label above it. */
export const labelGoesBelow = (item, size) => item.y / size.height < LABEL_BELOW_FROM_TOP

const updateItem = (state, id, changes) => ({ ...state, items: state.items.map((item) => (item.id === id ? { ...item, ...changes } : item)) })

/** Pure: ids come in with the action, so StrictMode's double call gives the same result. */
export function annotationsReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const item = { id: action.id, label: `Annotation ${state.nextNumber}`, ...action.rect }
      return { items: [...state.items, item], selectedId: action.id, nextNumber: state.nextNumber + 1 }
    }
    case 'change':
      return updateItem(state, action.id, action.rect)
    case 'rename':
      return updateItem(state, action.id, { label: action.label })
    case 'remove':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.id),
        selectedId: state.selectedId === action.id ? null : state.selectedId,
      }
    case 'select':
      return { ...state, selectedId: action.id }
    case 'reset':
      return initialAnnotations
    default:
      throw new Error(`Unknown annotation action: ${action.type}`)
  }
}
