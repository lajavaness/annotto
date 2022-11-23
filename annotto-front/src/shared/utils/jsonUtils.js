export const isJsonString = (string) => {
	try {
		return !!JSON.parse(string)
	} catch (e) {
		return false
	}
}
