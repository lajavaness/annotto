import { fork } from 'redux-saga/effects'

import apiSaga from 'shared/sagas/apiSagas'
import i18nSaga from 'shared/sagas/i18nSagas'
import logsSaga from 'shared/sagas/logsSagas'
import storageSaga from 'shared/sagas/storageSagas'

export default function* () {
	yield fork(i18nSaga)
	yield fork(apiSaga)
	yield fork(storageSaga)
	yield fork(logsSaga)
}
