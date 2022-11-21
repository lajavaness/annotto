export class FileError extends Error {
  lineNumber?: number
}

export const generateFileError = (errorObj: { message: string; lineNumber: number }) => {
  const err = new FileError()
  err.message = errorObj.message
  err.lineNumber = errorObj.lineNumber
  return err
}
