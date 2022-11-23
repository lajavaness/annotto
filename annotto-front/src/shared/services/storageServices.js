export const getFromStorageService = (key) => {
	try {
		let value = localStorage.getItem(key)
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
