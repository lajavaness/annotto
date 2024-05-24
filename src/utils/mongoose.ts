// valueToMongooseArraySelector
export const mongooseIn = (val?: string | string[]): { $in: string[] } | undefined => {
  if (typeof val === 'undefined') return undefined
  if (typeof val === 'string') return { $in: [val] }
  return {
    $in: val,
  }
}

// singleValueOrArrayToMongooseSelector
export const mongooseEq = (str?: string | string[]): undefined | string | { $in: string[] } => {
  if (typeof str === 'undefined') return undefined
  if (typeof str === 'string') return str
  return { $in: str }
}

// stringToRegExpOrUndefined
export const mongooseRegexp = (str?: string | string[]): undefined | string | { $in: string[] } => {
  if (typeof str === 'undefined') return undefined
  if (typeof str === 'string') return str
  return { $in: str }
}

// booleanStringToBooleanOrUndefined
export const mongooseBool = (str?: string | string[]): boolean | undefined => {
  if (str === 'true' || str === 'True') return true
  if (str === 'false' || str === 'False') return false
  return undefined
}
