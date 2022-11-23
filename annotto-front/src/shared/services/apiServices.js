import { startsWith } from 'lodash'
import axios from 'axios'

export const requestService = async (url, options = null, token = null) => {
	try {
		options = options || {
			method: 'GET',
			query: null,
			body: null,
			headers: {},
		}

		const headers = {
			...options.headers,
			Authorization: `Bearer ${token}`,
		}

		const response = await axios(url, {
			headers,
			method: options.method,
			data: options.body,
			params: options.query,
			responseType: options.responseType,
		})

		if (startsWith(response.status, 2)) {
			return {
				body: response.data,
				status: response.status,
				headers: response.headers,
			}
		} else {
			throw new HttpError(response.statusText, response)
		}
	} catch (err) {
		throw new HttpError(err, err?.response)
	}
}

class HttpError extends Error {
	constructor(body, response) {
		super(`HttpError: ${JSON.stringify(body)}`)
		this.body = body
		this.name = response?.data?.message
		this.status = response?.status
		this.infos = response?.data?.infos
	}

	toString() {
		return this.message
	}
}
