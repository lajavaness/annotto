import { projectConfigV2Schema } from '../router/validation/project'

import validConfig1 from '../../tests/integration/seed/config/valid/config1.json'
import validConfig2 from '../../tests/integration/seed/config/valid/config2.json'
import validConfig3 from '../../tests/integration/seed/config/valid/config3.json'
import validConfig4 from '../../tests/integration/seed/config/valid/config4.json'
import validConfig5 from '../../tests/integration/seed/config/valid/config5.json'

import invalidConfig1 from '../../tests/integration/seed/config/invalid/config1.json'
import invalidConfig2 from '../../tests/integration/seed/config/invalid/config2.json'
import invalidConfig3 from '../../tests/integration/seed/config/invalid/config3.json'
import invalidConfig4 from '../../tests/integration/seed/config/invalid/config4.json'
import invalidConfig5 from '../../tests/integration/seed/config/invalid/config5.json'
import invalidConfig6 from '../../tests/integration/seed/config/invalid/config6.json'

const valids = [validConfig1, validConfig2, validConfig3, validConfig4, validConfig5]
const invalids = [invalidConfig1, invalidConfig2, invalidConfig3, invalidConfig4, invalidConfig5, invalidConfig6]

describe('valid configs', () => {
  test.each(valids)('Should validate config', (config) => {
    expect(projectConfigV2Schema.validate(config).error).toBe(undefined)
  })
})

describe('invalid configs', () => {
  test.each(invalids)('Should reject invalid config', (config) => {
    expect(projectConfigV2Schema.validate(config).error).toBeTruthy()
  })
})
