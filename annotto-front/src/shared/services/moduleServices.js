export const importModuleService = async (modulePath) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const module = await import(`../../${modulePath}`)
    return module.default
  } catch (error) {
    throw error
  }
}
