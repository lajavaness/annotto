import { isJsonString } from 'shared/utils/jsonUtils'

describe('isJsonString', () => {
	it('returns true if JSON string', () => {
		const string = '{"foo":true, "bar":42}'
		expect(isJsonString(string)).toBeTruthy()
	})

	it('returns false if not JSON string', () => {
		const string = '"foo":true, "bar":42'
		expect(isJsonString(string)).toBeFalsy()
	})

	it('returns false if sting is undefined', () => {
		const string = void 0
		expect(isJsonString(string)).toBeFalsy()
	})

	it('returns false if sting is null', () => {
		const string = null
		expect(isJsonString(string)).toBeFalsy()
	})
})
