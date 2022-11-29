import {
  CommentOutlined,
  FileOutlined,
  HighlightOutlined,
  NodeIndexOutlined,
  SendOutlined,
  TagOutlined,
  ToolOutlined,
} from '@ant-design/icons'
import { Form, Radio, Tooltip } from 'antd'
import { isEmpty } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import TextArea from 'antd/lib/input/TextArea'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { navigateToItem, postProjectComment } from 'modules/project/actions/projectActions'
import { postItemComment } from 'modules/project/actions/annotationActions'
import logTabsTypes, { All } from 'shared/enums/logTabsTypes'
import logsTypes, {
  ANNOTATION_ADD,
  ANNOTATION_REMOVE,
  COMMENT_ADD,
  COMMENT_REMOVE,
  PREDICTION_ADD,
  PROJECT_ADD,
  RELATION_ADD,
  RELATION_REMOVE,
  TAGS_ADD,
  TAGS_REMOVE,
} from 'shared/enums/logsTypes'

import { sortLogsAndGroupByDate } from 'modules/project/utils/projectUtils'

import { selectProjectId } from 'modules/project/selectors/projectSelectors'

import * as Styled from 'modules/project/components/common/__styles__/LogsContainer.styles'

dayjs.extend(relativeTime)

const resolveIcon = (type) =>
  ({
    [TAGS_ADD]: <HighlightOutlined />,
    [TAGS_REMOVE]: <HighlightOutlined />,
    [ANNOTATION_ADD]: <TagOutlined />,
    [ANNOTATION_REMOVE]: <TagOutlined />,
    [COMMENT_ADD]: <CommentOutlined />,
    [COMMENT_REMOVE]: <CommentOutlined />,
    [RELATION_ADD]: <NodeIndexOutlined />,
    [RELATION_REMOVE]: <NodeIndexOutlined />,
    [PROJECT_ADD]: <FileOutlined />,
  }[type] || <ToolOutlined />)

const isComment = (type) => [COMMENT_ADD, COMMENT_REMOVE].includes(type)

const LogsContainer = ({ logs, isProjectContext, hasMoreLogs, onFiltersChange, onLoadingMore }) => {
  const [form] = Form.useForm()

  const [currentFilter, setFilter] = useState('')

  const projectId = useSelector(selectProjectId)

  const dispatch = useDispatch()

  const { t } = useTranslation('project')

  const filters = logTabsTypes.map((type) => ({ label: t(`project:logs.${type}`), value: type !== All ? type : '' }))

  const _onItemClick = useCallback((itemId) => () => dispatch(navigateToItem(projectId, itemId)), [dispatch, projectId])

  const resolveItemLinkSpan = useCallback(
    (itemId) =>
      isProjectContext &&
      itemId && (
        <Styled.LogLinkSpan to={`/project/${projectId}/annotation/${itemId}`} onClick={_onItemClick(itemId)}>
          {`#...${itemId.substring(itemId.length - 6, itemId.length)}`}&nbsp;
        </Styled.LogLinkSpan>
      ),
    [projectId, _onItemClick, isProjectContext]
  )

  const resolveUser = (user) =>
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName.substring(0, 1)}` : user

  const resolveLogGroupTitle = useCallback(
    (label) => {
      if (dayjs(label).isSame(dayjs(), 'day')) {
        return t('project:logs.today')
      }

      if (dayjs(label).isSame(dayjs().subtract(1, 'day'), 'day')) {
        return t('project:logs.yesterday')
      }
      return dayjs(label).fromNow()
    },
    [t]
  )

  const resolveComment = useCallback(
    ({ item, type, user, value }) => {
      if (type === COMMENT_ADD) {
        return (
          <Styled.CommentContainer>
            <Styled.CommentContent>
              <Styled.IconContainer>{resolveIcon(type)}</Styled.IconContainer>
              <Styled.LogSpan $isBold={true}>{resolveUser(user)}</Styled.LogSpan>&nbsp;
              <Styled.LogSpan>
                {t(`project:comments.${type}${!isProjectContext || (isProjectContext && !item) ? '-current' : ''}`)}
              </Styled.LogSpan>
              &nbsp;
              {resolveItemLinkSpan(item)}
            </Styled.CommentContent>
            {(!isProjectContext || (isProjectContext && !item)) && (
              <Styled.MessageContent>{value}</Styled.MessageContent>
            )}
          </Styled.CommentContainer>
        )
      }
      return (
        <>
          <Styled.IconContainer>{resolveIcon(type)}</Styled.IconContainer>
          <Styled.LogSpan $isBold={true}>{resolveUser(user)}</Styled.LogSpan>&nbsp;
          <Styled.Log>
            <Styled.LogSpan>
              {t(`project:comments.${type}${!isProjectContext || (isProjectContext && !item) ? '-current' : ''}`)}
            </Styled.LogSpan>
            &nbsp;
            {resolveItemLinkSpan(item)}
          </Styled.Log>
        </>
      )
    },
    [isProjectContext, resolveItemLinkSpan, t]
  )

  const resolveLog = useCallback(
    ({ item, hasTaskText, type, value }, index) => {
      switch (true) {
        case type === ANNOTATION_ADD:
          return (
            <Styled.Log data-testid={`__log_${type}_${index}__`}>
              <Styled.LogSpan>{`${t(`project:logs.${type}${!isProjectContext ? '-current' : ''}`)} `}</Styled.LogSpan>
              {resolveItemLinkSpan(item)}
              {hasTaskText && value.length < 1 ? (
                <Styled.LogSpan>{`${t(`project:logs.${type}-text-end`)} `}</Styled.LogSpan>
              ) : (
                <>
                  <Styled.LogSpan>{`${t(
                    `project:logs.${type}-end${value.length > 1 ? '-plural' : ''}`
                  )} `}</Styled.LogSpan>
                  <Styled.LogSpan $isBold={true}>{value.join(',')}&nbsp;</Styled.LogSpan>
                  {hasTaskText && (
                    <Styled.LogSpan>{`${t(`project:logs.and`)} ${t(`project:logs.${type}-text-end`)} `}</Styled.LogSpan>
                  )}
                </>
              )}
            </Styled.Log>
          )
        case type === ANNOTATION_REMOVE: {
          return (
            <Styled.Log data-testid={`__log_${type}_${index}__`}>
              {hasTaskText && value.length < 1 ? (
                <Styled.LogSpan>{`${t(`project:logs.${type}-text`)} `}</Styled.LogSpan>
              ) : (
                <>
                  <Styled.LogSpan>{`${t(`project:logs.${type}${value.length > 1 ? '-plural' : ''}`)} `}</Styled.LogSpan>
                  <Styled.LogSpan $isBold={true}>{value}&nbsp;</Styled.LogSpan>
                  {hasTaskText && (
                    <Styled.LogSpan>{`${t(`project:logs.and`)} ${t(`project:logs.${type}-text-end`)} `}</Styled.LogSpan>
                  )}
                </>
              )}
              <Styled.LogSpan>
                {t(`project:logs.${type}-end${!isProjectContext ? '-current' : ''}`)}&nbsp;
              </Styled.LogSpan>
              {resolveItemLinkSpan(item)}
            </Styled.Log>
          )
        }
        case type === TAGS_ADD || type === TAGS_REMOVE: {
          return (
            <Styled.Log data-testid={`__log_${type}_${index}__`}>
              {!isProjectContext ? (
                <>
                  <Styled.LogSpan>{`${t(`project:logs.${type}-current`)} `}</Styled.LogSpan>
                  <Styled.LogSpan>{'"'}</Styled.LogSpan>
                  <Styled.LogSpan $isBold={true}>{value}</Styled.LogSpan>
                  <Styled.LogSpan>{'" '}</Styled.LogSpan>
                </>
              ) : (
                <>
                  <Styled.LogSpan>{`${t(`project:logs.${type}`)} `}</Styled.LogSpan>
                  <Styled.LogSpan>{`${t(`project:logs.${type}-end`)}`}&nbsp;</Styled.LogSpan>
                </>
              )}
              {resolveItemLinkSpan(item)}
            </Styled.Log>
          )
        }
        case type === PREDICTION_ADD || type === PROJECT_ADD: {
          return (
            <Styled.Log data-testid={`__log_${type}_${index}__`}>
              <Styled.LogSpan>{t(`project:logs.${type}`)}&nbsp;</Styled.LogSpan>
            </Styled.Log>
          )
        }
        case type === RELATION_ADD || type === RELATION_REMOVE: {
          return (
            <Styled.Log data-testid={`__log_${type}_${index}__`}>
              <Styled.LogSpan>{`${t(`project:logs.${type}${value.length > 1 ? '-plural' : ''}`)} `}</Styled.LogSpan>
              <Styled.LogSpan $isBold={true}>{value.join(',')}&nbsp;</Styled.LogSpan>
              <Styled.LogSpan>{`${t(
                `project:logs.${type}-end${!isProjectContext ? '-current' : ''}`
              )} `}</Styled.LogSpan>
              {resolveItemLinkSpan(item)}
            </Styled.Log>
          )
        }
        default: {
          return null
        }
      }
    },
    [isProjectContext, t, resolveItemLinkSpan]
  )

  const resolveLogs = useCallback(
    (logsToSortAndGroup) =>
      sortLogsAndGroupByDate(logsToSortAndGroup, dayjs()).map(({ label, values }, i) => (
        <Styled.LogWrapper key={`${label}_${i}`}>
          <Styled.LogDate>{resolveLogGroupTitle(label)}</Styled.LogDate>
          {values.map((item, index) => (
            <Styled.LogContainer key={`${label}_${index}`} data-testid={`__log_container_${index}__`}>
              {!isComment(item.type) ? (
                <Styled.LogContent>
                  <Styled.IconContainer>{resolveIcon(item.type)}</Styled.IconContainer>
                  <Styled.LogSpan data-testid={`__log_user_${index}__`} $isBold={true}>
                    {resolveUser(item.user)}
                  </Styled.LogSpan>
                  &nbsp;
                  {resolveLog(item, index)}
                </Styled.LogContent>
              ) : (
                <Styled.LogContent key={index}>{resolveComment(item)}</Styled.LogContent>
              )}
              {values.length - 1 !== index && <Styled.Divider />}
            </Styled.LogContainer>
          ))}
        </Styled.LogWrapper>
      )),
    [resolveComment, resolveLog, resolveLogGroupTitle]
  )

  const _onFormFinish = ({ comment }) => {
    if (comment) {
      if (isProjectContext) {
        dispatch(postProjectComment(comment))
      } else {
        dispatch(postItemComment(comment))
      }

      form.resetFields()
    }
  }

  const _onCommentsEnterPress = (e) => {
    if (e.key === 'Enter' && e.shiftKey && e.target.value) {
      form.submit()
    }
  }

  const _onRadioButtonChange = (e) => {
    setFilter(e.target.value)
    return onFiltersChange(e.target.value)
  }

  const _onLoadingMoreClick = useCallback(
    () => !!onLoadingMore && onLoadingMore(currentFilter),
    [onLoadingMore, currentFilter]
  )

  return (
    <Styled.Root>
      {isProjectContext ? (
        <Styled.Container $isProjectContext={isProjectContext}>
          <Styled.RadioGroup onChange={_onRadioButtonChange} defaultValue={filters[0].value}>
            {filters.map(({ label, value }) => (
              <Radio.Button value={value} key={value}>
                {label}
              </Radio.Button>
            ))}
          </Styled.RadioGroup>
          <Styled.ListLogContainer>{!!logs && resolveLogs(logs)}</Styled.ListLogContainer>
          {hasMoreLogs && (
            <Styled.LoadMoreButton onClick={_onLoadingMoreClick}>
              {t(`project:stats.table.loadMore`)}
            </Styled.LoadMoreButton>
          )}
        </Styled.Container>
      ) : (
        !isEmpty(logs) && (
          <Styled.Container $isProjectContext={isProjectContext}>
            {resolveLogs(logs)}
            {hasMoreLogs && (
              <Styled.LoadMoreButton onClick={_onLoadingMoreClick}>
                {t(`project:stats.table.loadMore`)}
              </Styled.LoadMoreButton>
            )}
          </Styled.Container>
        )
      )}
      <Styled.Divider $isBold={true} />
      <Styled.PostMessageForm form={form} onFinish={_onFormFinish} initialValues={{ comment: '' }}>
        <Styled.PostMessageFormItem name="comment">
          <TextArea
            autoSize
            allowClear
            placeholder={t('project:comments.placeholder')}
            onKeyPress={_onCommentsEnterPress}
          />
        </Styled.PostMessageFormItem>
        <Styled.PostMessageFormItem>
          <Tooltip placement="top" title={t('project:comments.tooltip')}>
            <Styled.SendButton htmlType="submit" type="default" icon={<SendOutlined />} />
          </Tooltip>
        </Styled.PostMessageFormItem>
      </Styled.PostMessageForm>
    </Styled.Root>
  )
}

export default LogsContainer

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

LogsContainer.propTypes = {
  /** Defines the log list that will be displayed. */
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      /** Defines a machine-readable key that identifies the log. */
      _id: PropTypes.string,
      /** Defines a machine-readable key that identifies a comment to display in the log list. */
      comment: PropTypes.string,
      /** Defines a machine-readable key that identifies the item  which the log belongs. */
      item: PropTypes.string,
      /** Defines the value of the log or the comment to display. */
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
      /** Defines the type of the log to manage the display of it . */
      type: PropTypes.oneOf(logsTypes),
      /** Defines the user who created the action to which the log belongs. */
      user: PropTypes.oneOfType([PropTypes.string, User]),
      /** Defines the log creation date. */
      createdAt: PropTypes.string,
      /** Defines the value of the comment message to display in the log list. */
      commentMessage: PropTypes.string,
      /** Does it in the log contain an annotation with a task of type TEXT ?.
       * Used to display the translation of text annotation. */
      hasTaskText: PropTypes.bool,
    })
  ),
  /** Defines if the container of logs is in project context.
   *Manage if the item id should be displayed.
   *Manage whether to display a link on the item id.
   *Manage the container has a color background and borders. */
  isProjectContext: PropTypes.bool,
  /** Defines if there are more logs available.
   * If so display the button to retrieve these logs. */
  hasMoreLogs: PropTypes.bool,
  /** Defines the handler called when the filter buttons is clicked. */
  onFiltersChange: PropTypes.func,
  /** Defines the handler called when the loading more button is clicked. */
  onLoadingMore: PropTypes.func,
}

LogsContainer.defaultProps = {
  logs: [],
  hasMoreLogs: false,
  isProjectContext: false,
  onFiltersChange: null,
  onLoadingMore: null,
}
