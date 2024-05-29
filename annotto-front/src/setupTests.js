/* eslint-disable import/no-extraneous-dependencies */
/** If you want to add setup code to your Jest tests, write them to
 * `src/setupTestsLocal.js`, and they'll be automatically included.
 * Please note that React Apps use a different setupTests file structure.
 * than other projects due to tooling limitations. */
import '@testing-library/jest-dom'
import 'jest-extended'
import './setupTestsLocal'

/**
 * Utility to skip steps in a Saga, so that a specific step may be tested.
 * @param {object} saga The saga to step through.
 * @param {number} n    The number of steps to perform.
 * @returns {object} Saga The saga, so that this function may be chained.
 */
export const sagaNextN = (saga, n) => {
  for (let i = 0; i < n; i += 1) {
    saga.next()
  }

  return saga
}

/* resizeWindow */
export const resizeWindow = (x, y) => {
  window.innerWidth = x
  window.innerHeight = y
  window.dispatchEvent(new Event('resize'))
}
/* END resizeWindow */
