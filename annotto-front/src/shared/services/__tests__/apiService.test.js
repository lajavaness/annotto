import axios from 'axios'

import { requestService } from 'shared/services/apiServices'

jest.mock('axios')

describe('apiServices', () => {
	it('should return users', async () => {
		axios.mockResolvedValue({ data: [{ userId: 1 }], status: 200 })
		const response = await requestService('/users')

		expect(response).toEqual({ body: [{ userId: 1 }], headers: undefined, status: 200 })
	})

	it('should return error when failed', async () => {
		axios.mockResolvedValue({ statusText: 'bad request', status: 400 })
		try {
			await requestService('/users')
		} catch (err) {
			expect(err.toString()).toBe('HttpError: {"body":"bad request","status":400}')
		}
	})
})
