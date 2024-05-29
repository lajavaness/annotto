import { Button } from 'antd'
import { isEmpty } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import PropTypes from 'prop-types'

import { CREATE_PROJECT } from 'shared/enums/privilegesTypes'
import { PROJECTS_SIZE } from 'shared/enums/projectsTypes'

import { fetchProjects } from 'modules/projects/actions/projectsActions'

import usePrivileges from 'shared/hooks/usePrivileges'

import {
  selectIndexProjects,
  selectIsReady,
  selectProjects,
  selectTotalProjects,
} from 'modules/projects/selectors/projectsSelectors'
import { selectProjectClients } from 'modules/root/selectors/rootSelectors'

import EllipsisTableTooltip from 'shared/components/table/EllipsisTableTooltip'
import Loader from 'shared/components/loader/Loader'
import Table from 'shared/components/table/Table'

import * as Styled from 'modules/projects/components/__styles__/HomePage.styles'

const HomePage = ({ setHeaderActions }) => {
  const tableRef = useRef(null)

  const isReady = useSelector(selectIsReady)
  const projects = useSelector(selectProjects)
  const index = useSelector(selectIndexProjects)
  const total = useSelector(selectTotalProjects)
  const clients = useSelector(selectProjectClients)

  const dispatch = useDispatch()

  const { t } = useTranslation(['root', 'projects'])

  const hasPrivilege = usePrivileges()

  dayjs.extend(relativeTime)

  const columns = [
    {
      title: t('projects:table.name'),
      fixed: 'left',
      textWrap: 'word-break',
      ellipsis: true,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 175,
          },
        }
      },
      // eslint-disable-next-line react/display-name
      render: ({ _id, name }) => (
        <EllipsisTableTooltip title={name}>
          <Styled.Link to={`/project/${_id}`}>{name}</Styled.Link>,
        </EllipsisTableTooltip>
      ),
    },
    {
      title: <Styled.TextRight>{t('projects:table.client')}</Styled.TextRight>,
      dataIndex: 'client',
      width: 100,
      textWrap: 'word-break',
      ellipsis: true,
      // eslint-disable-next-line react/display-name
      render: ({ name }) => <Styled.TextRight>{name}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.users')}</Styled.TextRight>,
      dataIndex: 'users',
      width: 70,
      textWrap: 'word-break',
      ellipsis: true,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.items')}</Styled.TextRight>,
      dataIndex: 'items',
      width: 100,
      textWrap: 'word-break',
      ellipsis: true,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.progress')}</Styled.TextRight>,
      dataIndex: 'progress',
      width: 100,
      textWrap: 'word-break',
      ellipsis: true,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data && t('root:units.percentLabel', { count: data })}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.velocity')}</Styled.TextRight>,
      dataIndex: 'velocity',
      width: 100,
      onCell: () => {
        return {
          style: {
            whiteSpace: 'nowrap',
            maxWidth: 100,
          },
        }
      },
      textWrap: 'word-break',
      ellipsis: true,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data && t('root:units.secondLabel', { count: data })}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.remaining_time')}</Styled.TextRight>,
      dataIndex: 'remaining_time',
      width: 150,
      // eslint-disable-next-line react/display-name
      render: (date) => (
        <Styled.TextRight>
          {date && t('root:units.hourLabel', { count: dayjs(date).diff(dayjs(), 'hour') })}
        </Styled.TextRight>
      ),
    },
    {
      title: <Styled.TextRight>{t('projects:table.remaining_work')}</Styled.TextRight>,
      dataIndex: 'remaining_work',
      textWrap: 'word-break',
      ellipsis: true,
      width: 150,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data && t('root:units.hourLabel', { count: data })}</Styled.TextRight>,
    },
    {
      title: <Styled.TextRight>{t('projects:table.notes')}</Styled.TextRight>,
      dataIndex: 'notes',
      textWrap: 'word-break',
      ellipsis: true,
      width: 70,
      // eslint-disable-next-line react/display-name
      render: (data) => <Styled.TextRight>{data}</Styled.TextRight>,
    },
    { title: t('projects:table.update'), dataIndex: 'update', render: (date) => date && dayjs(date).fromNow() },
    {
      width: 100,
      fixed: 'right',
      // eslint-disable-next-line react/display-name
      render: (id) => <Styled.Link to={`/project/${id}/annotation`}>{t('projects:table.annotate')}</Styled.Link>,
      dataIndex: '_id',
    },
  ]

  const data = useMemo(
    () =>
      projects?.map(
        (
          {
            _id,
            name,
            client: clientId,
            users,
            itemCount,
            progress,
            velocity,
            remainingWork,
            deadline,
            commentCount,
            updatedAt,
          },
          keyIndex
        ) => ({
          key: keyIndex,
          name,
          client: clients.data.find(({ _id: id }) => id === clientId),
          users: !isEmpty(users) ? users.length : 0,
          items: itemCount,
          progress,
          velocity,
          remaining_time: deadline,
          remaining_work: remainingWork,
          notes: commentCount,
          update: updatedAt,
          _id,
        })
      ) || [],
    [projects, clients]
  )

  const _onLoadingMoreClick = () => dispatch(fetchProjects(index + 1, PROJECTS_SIZE))

  useEffect(() => {
    if (setHeaderActions) {
      if (hasPrivilege(CREATE_PROJECT)) {
        setHeaderActions(
          <Styled.CreateButtonLink className="ant-btn ant-btn-primary" to={'/create_project/config'}>
            <span>{t('projects:createButton')}</span>
          </Styled.CreateButtonLink>
        )
      } else {
        setHeaderActions(null)
      }
    }
  }, [setHeaderActions, hasPrivilege, t])

  return isReady ? (
    <Styled.Root>
      <Styled.TableContainer ref={tableRef}>
        <Table
          columns={columns}
          dataSource={data}
          footer={
            total !== projects.length &&
            (() => <Button onClick={_onLoadingMoreClick}>{t(`projects:button.loadMore`)}</Button>)
          }
        />
      </Styled.TableContainer>
    </Styled.Root>
  ) : (
    <Loader />
  )
}

HomePage.propTypes = {
  setHeaderActions: PropTypes.func,
}

export default HomePage
