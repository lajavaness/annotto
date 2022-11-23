import moment from 'moment'

export const isNowBeforeDateService = (now, date) => {
	if (!now || !date) {
		return false
	}
	return moment(new Date(now)).isBefore(new Date(date))
}
