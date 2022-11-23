import { importModuleService } from '../moduleServices'

describe('moduleServices', () => {
	describe('importModuleService', () => {
		it('returns result', async () => {
			const res = await importModuleService(`shared/services/__tests__/module.json`)
			expect(res).toEqual({ foo: 'bar' })
		})

		it('returns execution error', async () => {
			try {
				await importModuleService()
			} catch (err) {
				expect(err).toBeDefined()
			}
		})
	})
})
