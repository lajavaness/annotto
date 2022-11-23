export const importModuleService = async (modulePath) => {
	try {
		const module = await import(`../../${modulePath}`)
		return module.default
	} catch (error) {
		throw error
	}
}
