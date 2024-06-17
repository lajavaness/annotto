import PropTypes from 'prop-types'

import * as Styled from 'shared/components/page/__styles__/Page.styles'

const Page = ({ id, children }) => <Styled.Root data-testid={`__${id}-page__`}>{children}</Styled.Root>

Page.propTypes = {
  /** Id of the page. */
  id: PropTypes.string,
  /** The content of the page. */
  children: PropTypes.node,
}

Page.defaultProps = {
  id: null,
  children: null,
}

export default Page
