// Color palette for player/group selection
export const COLOR_PALETTE = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#14B8A6', // teal
  '#F59E0B', // amber
  '#6366F1', // indigo
  '#D946EF', // fuchsia
]

export const getColorName = (hex) => {
  const colorMap = {
    '#EF4444': 'Red',
    '#F97316': 'Orange',
    '#EAB308': 'Yellow',
    '#22C55E': 'Green',
    '#3B82F6': 'Blue',
    '#8B5CF6': 'Purple',
    '#EC4899': 'Pink',
    '#06B6D4': 'Cyan',
    '#14B8A6': 'Teal',
    '#F59E0B': 'Amber',
    '#6366F1': 'Indigo',
    '#D946EF': 'Fuchsia',
  }
  return colorMap[hex] || 'Unknown'
}

export function calculatePoints(rank) {
  if (rank === 11) return -2
  if (rank === 12) return -5
  return rank
}
