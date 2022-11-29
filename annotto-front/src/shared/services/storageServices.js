export const getFromStorageService = (key) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const value = localStorage.getItem(key)
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  } catch (error) {
    throw error
  }
}

export const setToStorageService = (key, value) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (!key || !value) {
      return false
    }
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    throw error
  }
}

export const removeToStorageService = (key) => {
  // eslint-disable-next-line no-useless-catch
  try {
    if (!key || localStorage.getItem(key) === null) {
      return false
    }
    localStorage.removeItem(key)
    return true
  } catch (error) {
    throw error
  }
}
