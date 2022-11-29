import { isNowBeforeDateService } from 'modules/root/services/rootServices'

describe('rootServices', () => {
  describe('isDateValid', () => {
    const now = new Date('14 Oct 2020')
    const otherFormatOfNow = '2020-03-02T09:55:01.978Z'
    const date = new Date('15 Nov 2020')

    const truthyCases = [
      ['returns true if now is before expirationDate', now, date],
      ['returns true if other date format are sent', otherFormatOfNow, date],
    ]
    it.each(truthyCases)('%s', (title, input1, input2) => {
      expect(isNowBeforeDateService(input1, input2)).toBeTruthy()
    })

    const falsyCases = [
      ['returns false if no date is provided', null, date],
      ['returns false if no expiration date is provided', date, null],
      ['returns false if expiry date is sent before now date', date, now],
      ['returns false if no date and no expiry date are provided', null, null],
      ['returns false if a string is passed instead of date', 'foo', date],
      ['returns false if a string is passed instead of expiration date', now, 'bar'],
    ]
    it.each(falsyCases)('%s', (title, input1, input2) => {
      expect(isNowBeforeDateService(input1, input2)).toBeFalsy()
    })
  })
})
