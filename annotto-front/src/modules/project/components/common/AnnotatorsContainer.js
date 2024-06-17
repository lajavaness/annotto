import { Tooltip } from 'antd'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import { useMemo } from 'react'

import * as Styled from './__styles__/AnnotatorsContainer.styles'

const AnnotatorsContainer = ({ annotators, currentUser }) => {
  const { t } = useTranslation('project')

  const resolvedAnnotators = useMemo(
    () => (!isEmpty(annotators) ? [currentUser, ...annotators.filter(({ email }) => email !== currentUser.email)] : []),
    [currentUser, annotators]
  )

  return (
    <Styled.Root>
      {!isEmpty(resolvedAnnotators) ? (
        resolvedAnnotators.map(
          ({ email, firstName, lastName }) =>
            firstName &&
            lastName && (
              <Tooltip placement="top" title={`${firstName} ${lastName}`} key={email}>
                <Styled.Avatar shape="circle" size={35} $isSelected={email === currentUser.email}>
                  {`${firstName.charAt(0)}${lastName.charAt(0)}`}
                </Styled.Avatar>
              </Tooltip>
            )
        )
      ) : (
        <Styled.Span>{t('project:annotators.noAnnotators')}</Styled.Span>
      )}
    </Styled.Root>
  )
}

export default AnnotatorsContainer

const User = PropTypes.shape({
  /** Defines a machine-readable key that identifies the user. */
  _id: PropTypes.string,
  /** Defines the firstName of an user. */
  firstName: PropTypes.string,
  /** Defines the lastName of an user. */
  lastName: PropTypes.string,
  /** Defines the email of an user. */
  email: PropTypes.string,
})

AnnotatorsContainer.propTypes = {
  /** Defines annotators to display. */
  annotators: PropTypes.arrayOf(User),
  currentUser: User,
}

AnnotatorsContainer.defaultProps = {
  annotators: [],
  currentUser: null,
}
