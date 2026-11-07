// An item is { id, label, x, y, width, height } in photo pixels.
export const initialAnnotations = { items: [], selectedId: null, nextNumber: 1 }

/** Pure: ids come in with the action, so StrictMode's double call gives the same result. */
export function annotationsReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { x, y, width, height } = action.rect
      const item = { id: action.id, label: `Annotation ${state.nextNumber}`, x, y, width, height }
      return { items: [...state.items, item], selectedId: action.id, nextNumber: state.nextNumber + 1 }
    }
    case 'change': {
      const { x, y, width, height } = action.rect
      const items = state.items.map((item) => (item.id === action.id ? { ...item, x, y, width, height } : item))
      return { ...state, items }
    }
    case 'rename': {
      const items = state.items.map((item) => (item.id === action.id ? { ...item, label: action.label } : item))
      return { ...state, items }
    }
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
