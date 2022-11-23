import { getFromStorageService, removeToStorageService, setToStorageService } from '../storageServices'

describe('storageServices', () => {
	describe('setToStorageService', () => {
		it('returns true', () => {
			const res = setToStorageService('foo', 'bar')
			expect(res).toBeTruthy()
		})

		it('returns false if no key', () => {
			const res = setToStorageService(null, 'bar')
			expect(res).toBeFalsy()
		})

		it('returns false if no value', () => {
			const res = setToStorageService('foo', null)
			expect(res).toBeFalsy()
		})
	})

	describe('getFromStorageService', () => {
		it('returns null if key does not exist', () => {
			const res = getFromStorageService('foo')
			expect(res).toBeNull()
		})

		it('returns null is value is null', () => {
			localStorage.setItem('foo', null)
			const res = getFromStorageService('foo')
			expect(res).toBeNull()
		})

		it('returns value', () => {
			localStorage.setItem('foo', 'bar')
			const res = getFromStorageService('foo')
			expect(res).toBe('bar')
		})
	})

	describe('removeToStorageService', () => {
		it('returns true if remove item successfully', () => {
			localStorage.setItem('foo', null)
			const res = removeToStorageService('foo')
			expect(res).toBeTruthy()
		})

		it('returns false if no key', () => {
			const res = removeToStorageService(null)
			expect(res).toBeFalsy()
		})

		it('returns false if not find item with key', () => {
			const res = removeToStorageService('foo')
			expect(res).toBeFalsy()
		})

		it('returns execution error', async () => {
			const localStorageMock = (() => {
				let store = {}
				return {
					getItem: (key) => store[key] || null,
					setItem: (key, value) => (store[key] = value ? value.toString() : null),
					clear: () => (store = {}),
				}
			})()
			Object.defineProperty(window, 'localStorage', { value: localStorageMock })

			localStorage.setItem('bar', 'bar')
			expect(() => removeToStorageService('bar')).toThrow()
		})
	})

	afterEach(() => {
		localStorage.clear()
	})
})
