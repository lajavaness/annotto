export const booleanStringToBooleanOrUndefined = (str?: string): boolean | undefined => {
  if (str === 'true' || str === 'True') return true
  if (str === 'false' || str === 'False') return false
  return undefined
}
