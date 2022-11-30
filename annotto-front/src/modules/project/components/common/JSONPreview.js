import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'

import { BOOLEAN, NUMBER, OBJECT, STRING } from 'shared/enums/rawTypes'

import * as Styled from 'modules/project/components/common/__styles__/JSONPreview.styles'

const highlightedJSON = (jsonObj) =>
  Object.keys(jsonObj).map((key) => {
    const value = jsonObj[key]
    let valueType = typeof value

    const isSimpleValue = [STRING, NUMBER, BOOLEAN].includes(valueType) || !value
    if (isSimpleValue && valueType === 'object') {
      valueType = 'null'
    }

    let resolveNotationStart
    let resolveNotationEnd

    if (valueType === OBJECT) {
      resolveNotationStart = Array.isArray(value) ? '[' : '{'
      resolveNotationEnd = Array.isArray(value) ? ']' : '}'
    } else {
      resolveNotationStart = ''
      resolveNotationEnd = ''
    }

    if (!(valueType === OBJECT && isEmpty(value))) {
      return (
        <Styled.Container key={key}>
          <Styled.KeyLabel>{`${key}: ${resolveNotationStart}`}</Styled.KeyLabel>
          {isSimpleValue ? (
            <Styled.ValueLabel $valueType={valueType}>{JSON.stringify(value)}</Styled.ValueLabel>
          ) : (
            <Styled.ValueContent>{highlightedJSON(value)}</Styled.ValueContent>
          )}
          {`${resolveNotationEnd},`}
        </Styled.Container>
      )
    }
    return (
      <Styled.Container key={key}>
        <Styled.KeyLabel>{`${key}: ${resolveNotationStart}`}</Styled.KeyLabel>
        {null}
        {`${resolveNotationEnd},`}
      </Styled.Container>
    )
  })

const JSONPreview = ({ json }) => {
  return <Styled.Root>{highlightedJSON(json)}</Styled.Root>
}

export default JSONPreview

JSONPreview.propTypes = {
  /** The Json to display. */
  json: PropTypes.object,
}

JSONPreview.defaultProps = {
  json: {},
}
