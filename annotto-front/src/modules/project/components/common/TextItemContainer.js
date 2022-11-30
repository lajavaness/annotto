import { isEmpty } from 'lodash'
import PropTypes from 'prop-types'
import React, { useMemo } from 'react'

import { sanitizer } from 'shared/utils/htmlUtils'

import * as Styled from './__styles__/TextItemContainer.styles'

const TextItemContainer = ({ content, highlights }) => {
  const resolveContentWithHighlight = useMemo(() => {
    const result = [{ value: content, isHighlight: false }]
    let lastEnd = 0

    highlights.forEach(({ start, end, text }) => {
      const lastValue = result[result.length - 1].value
      result[result.length - 1] = { value: lastValue.slice(0, start - lastEnd), isHighlight: false }
      result.push({ value: text, isHighlight: true })
      result.push({ value: lastValue.slice(end - lastEnd), isHighlight: false })
      lastEnd = end
    })

    return result
  }, [highlights, content])

  const sanitizedHtml = useMemo(() => sanitizer(content), [content])

  return (
    <Styled.Root>
      {!isEmpty(highlights) ? (
        <Styled.Content>
          {resolveContentWithHighlight.map(({ value, isHighlight }, index) =>
            isHighlight ? (
              <Styled.Mark data-testid={'__mark__'} key={index}>
                {value}
              </Styled.Mark>
            ) : (
              <span key={index}>{value}</span>
            )
          )}
        </Styled.Content>
      ) : (
        <Styled.Content dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </Styled.Root>
  )
}

export default TextItemContainer

TextItemContainer.propTypes = {
  /** Defines the content of the item. */
  content: PropTypes.string,
  /** Defines the highlights of the item. */
  highlights: PropTypes.arrayOf(
    PropTypes.shape({
      /** Defines the character where the highlight begins. */
      start: PropTypes.number,
      /** Defines the character where the highlight ends. */
      end: PropTypes.number,
      /** Defines the text of the highlight. */
      text: PropTypes.string,
      /** Defines the score of the highlight. The value is between 0 and 1. */
      score: PropTypes.number,
    })
  ),
}

TextItemContainer.defaultProps = {
  content: null,
  highlights: [],
}
