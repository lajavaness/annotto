import { isEmpty } from 'lodash'

import moment from 'moment'

export const sortByCreatedAt = (arr) => {
	if (isEmpty(arr)) {
		return {}
	}
	return arr.sort((a, b) => moment(b.createdAt) - moment(a.createdAt))
}
