import { selectIsAuthenticated, selectKeycloakInstance, selectUserInfo } from 'modules/root/selectors/authSelectors'

describe('authSelectors', () => {
	describe('selectUserInfo', () => {
		it('returns default value', () => {
			const result = selectUserInfo()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				auth: {
					userInfo: 'user',
				},
			}
			const result = selectUserInfo(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectKeycloakInstance', () => {
		it('returns default value', () => {
			const result = selectKeycloakInstance()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				auth: {
					keycloakInstance: 'instance',
				},
			}
			const result = selectKeycloakInstance(state)
			expect(result).toBeTruthy()
		})
	})

	describe('selectIsAuthenticated', () => {
		it('returns default value', () => {
			const result = selectIsAuthenticated()
			expect(result).toBeFalsy()
		})

		it('returns state value', () => {
			const state = {
				auth: {
					keycloakInstance: {
						authenticated: true,
					},
				},
			}
			const result = selectIsAuthenticated(state)
			expect(result).toBeTruthy()
		})
	})
})
