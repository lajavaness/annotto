import { Button, Dropdown, Menu, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { isEmpty, isNumber } from 'lodash'
import { navigate } from '@reach/router'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import {
	deleteProject,
	fetchProjectItems,
	fetchProjectItemsAndLogs,
	fetchProjectLogs,
	fetchProjectStatsTasks,
	navigateToItem,
	openFilterModal,
	openGuideModal,
} from 'modules/project/actions/projectActions'

import {
	selectProjectAnnotators,
	selectProjectFilter,
	selectProjectId,
	selectProjectItems,
	selectProjectItemsIndex,
	selectProjectItemsTotal,
	selectProjectLogs,
	selectProjectLogsIndex,
	selectProjectLogsTotal,
	selectProjectStatsTasks,
	selectProjectStatsTasksIndex,
	selectProjectStatsTasksTotal,
} from 'modules/project/selectors/projectSelectors'
import { selectUserInfo } from 'modules/root/selectors/authSelectors'

import { DELETE_PROJECT, EDIT_PROJECT, EDIT_PROJECT_EXPORT } from 'shared/enums/privilegesTypes'
import { ITEMS } from 'shared/enums/projectStatsTypes'
import { PROJECT_ITEMS_SIZE, PROJECT_LOGS_SIZE, PROJECT_STATS_TASKS_SIZE } from 'shared/enums/paginationTypes'

import useProjectPrivileges from 'shared/hooks/useProjectPrivileges'

import AnnotatorsContainer from 'modules/project/components/common/AnnotatorsContainer'
import Card from 'shared/components/card/Card'
import Col from 'shared/components/grid/Col'
import LogsContainer from 'modules/project/components/common/LogsContainer'
import Page from 'shared/components/page/Page'
import Row from 'shared/components/grid/Row'
import WarningMessage from 'shared/components/warning/WarningMessage'

import { groupTasksByCategories } from 'shared/utils/tasksUtils'
import { isHTML } from 'shared/utils/htmlUtils'

import * as Styled from 'modules/project/components/pages/__styles__/HomeProjectPage.styles'
import { TASKS } from 'shared/enums/projectStatsTypes'

// eslint-disable-next-line react/prop-types
const HomeProjectPage = ({ setHeaderActions }) => {
	const [selectedStatsDisplay, setSelectedStatsDisplay] = useState(ITEMS)

	const projectId = useSelector(selectProjectId)
	const filter = useSelector(selectProjectFilter)
	const items = useSelector(selectProjectItems)
	const itemsIndex = useSelector(selectProjectItemsIndex)
	const totalItems = useSelector(selectProjectItemsTotal)
	const tasks = useSelector(selectProjectStatsTasks)
	const tasksIndex = useSelector(selectProjectStatsTasksIndex)
	const totalTasks = useSelector(selectProjectStatsTasksTotal)
	const logs = useSelector(selectProjectLogs)
	const logsIndex = useSelector(selectProjectLogsIndex)
	const totalLogs = useSelector(selectProjectLogsTotal)
	const annotators = useSelector(selectProjectAnnotators)
	const currentUser = useSelector(selectUserInfo)

	const dispatch = useDispatch()

	const { t } = useTranslation(['root', 'project'])

	const hasPrivilege = useProjectPrivileges()

	useEffect(() => {
		/**
		 * We dispatch the action to trigger the fetch of items and logs here rather than in the startup saga.
		 * Because we need to retrieve this data each time this page is mounted and not when the module is mounted.
		 * When we are on the annotation page and when we navigate to this component,
		 * this data is not fetched since we are in the same module and the startup saga is not triggered.
		 */
		dispatch(fetchProjectItemsAndLogs(projectId))
	}, [projectId, dispatch])

	dayjs.extend(relativeTime)

	const itemsData = useMemo(
		() =>
			items?.map(({ _id, body, logCount, velocity, annotated, annotationValues, annotatedAt }, index) => ({
				key: index,
				body,
				logCount,
				velocity,
				annotated,
				annotationValues,
				annotatedAt,
				_id,
			})) || [],
		[items]
	)

	const resolveTasksByCategories = useMemo(
		() =>
			groupTasksByCategories(tasks).map(({ category, children, ...others }, index) => ({
				key: index,
				value: category,
				children: children.map((child, index) => ({ key: `category_child_${index}`, ...child })),
			})),
		[tasks]
	)

	const _onEditProjectClick = useCallback(
		(e) => {
			e.stopPropagation()
			return navigate(`/edit_project/${projectId}/config`)
		},
		[projectId]
	)

	const _onExportProjectClick = useCallback(
		(e) => {
			e.stopPropagation()
			return navigate(`/edit_project/${projectId}/export`)
		},
		[projectId]
	)

	const _onDeleteProjectClick = useCallback(
		(e) => {
			e.stopPropagation()
			Modal.confirm({
				icon: <ExclamationCircleOutlined />,
				title: t(`project:menu.confirmDelete.title`),
				content: t(`project:menu.confirmDelete.content`),
				okText: t(`project:menu.confirmDelete.ok`),
				cancelText: t(`project:menu.confirmDelete.cancel`),
				onOk() {
					dispatch(deleteProject(projectId))
				},
			})
		},
		[dispatch, projectId, t]
	)

	const resolvedMenu = useMemo(
		() => (
			<Menu>
				{hasPrivilege(EDIT_PROJECT) && (
					<Menu.Item key={1}>
						<Styled.MenuButton onClick={_onEditProjectClick}> {t('project:menu.edit')}</Styled.MenuButton>
					</Menu.Item>
				)}
				{hasPrivilege(EDIT_PROJECT_EXPORT) && (
					<Menu.Item key={2}>
						<Styled.MenuButton onClick={_onExportProjectClick}> {t('project:menu.export')}</Styled.MenuButton>
					</Menu.Item>
				)}
				{hasPrivilege(DELETE_PROJECT) && (
					<Menu.Item key={3}>
						<Styled.MenuButton onClick={_onDeleteProjectClick}> {t('project:menu.delete')}</Styled.MenuButton>
					</Menu.Item>
				)}
			</Menu>
		),
		[hasPrivilege, _onEditProjectClick, _onExportProjectClick, _onDeleteProjectClick, t]
	)

	const _onItemClick = useCallback((itemId) => () => dispatch(navigateToItem(projectId, itemId)), [dispatch, projectId])

	const tasksColumns = [
		{ title: t('project:stats.table.name'), dataIndex: 'value', fixed: 'left' },
		{
			title: <Styled.TextRight>{t('project:stats.table.annotationPourcent')}</Styled.TextRight>,
			dataIndex: 'annotationPourcent',
			width: 125,
			render: (data) => (
				<Styled.TextRight>{isNumber(data) && t('root:units.percentLabel', { count: data })}</Styled.TextRight>
			),
		},
		{
			title: <Styled.TextRight>{t('project:stats.table.annotationCount')}</Styled.TextRight>,
			dataIndex: 'annotationCount',
			width: 125,
			render: (data) => <Styled.TextRight>{data}</Styled.TextRight>,
		},
		{
			title: <Styled.TextRight>{t('project:stats.table.velocity')}</Styled.TextRight>,
			dataIndex: 'velocity',
			width: 125,
			render: (data) => <Styled.TextRight>{data && t('root:units.secondLabel', { count: data })}</Styled.TextRight>,
		},
	]

	const itemsColumns = useMemo(
		() => [
			{
				title: t(`project:stats.table.name`),
				fixed: 'left',
				render: ({ _id, body }) => (
					<Styled.Link to={`/project/${projectId}/annotation/${_id}`} onClick={_onItemClick(_id)}>
						{!body || isHTML(body) ? `#...${_id.substring(_id.length - 6, _id.length)}` : `${body.substring(0, 30)}...`}
					</Styled.Link>
				),
			},
			{
				title: <Styled.TextRight>{t('project:stats.table.logCount')}</Styled.TextRight>,
				dataIndex: 'logCount',
				width: 125,
				render: (data) => <Styled.TextRight>{data}</Styled.TextRight>,
			},
			{
				title: <Styled.TextRight>{t('project:stats.table.velocity')}</Styled.TextRight>,
				dataIndex: 'velocity',
				width: 125,
				render: (data) => <Styled.TextRight>{data && t('root:units.secondLabel', { count: data })}</Styled.TextRight>,
			},
			{
				title: t('project:stats.table.annotated'),
				dataIndex: 'annotated',
				width: 125,
				render: (data) => (data ? t('project:stats.table.isAnnotated') : t('project:stats.table.isNotAnnotated')),
			},
			{
				title: t('project:stats.table.annotationValues'),
				dataIndex: 'annotationValues',
				width: 100,
				render: (data) => (!isEmpty(data) && data.length > 3 ? `${data.slice(0, 3).toString()}...` : data.toString()),
			},
			{
				title: t('project:stats.table.annotatedAt'),
				dataIndex: 'annotatedAt',
				width: 200,
				render: (date) => date && dayjs(date).fromNow(),
			},
		],
		[projectId, _onItemClick, t]
	)

	const tabList = useMemo(
		() => [
			{
				key: ITEMS,
				tab: t(`project:stats.table.${totalItems < 2 ? 'totalItems' : 'totalPluralItems'}`, {
					count: totalItems,
				}),
			},
			{
				key: TASKS,
				tab: t(`project:stats.table.${totalTasks < 2 ? 'totalTask' : 'totalPluralTasks'}`, {
					count: totalTasks,
				}),
			},
		],
		[t, totalTasks, totalItems]
	)

	const _onGuideClick = useCallback(() => dispatch(openGuideModal()), [dispatch])

	useEffect(
		() =>
			setHeaderActions &&
			setHeaderActions(
				<>
					<Styled.StartAnnotationButton to={`/project/${projectId}/annotation`} className="ant-btn ant-btn-primary">
						{t('project:annotation.start')}
					</Styled.StartAnnotationButton>
					{(hasPrivilege(EDIT_PROJECT) || hasPrivilege(EDIT_PROJECT_EXPORT) || hasPrivilege(DELETE_PROJECT)) && (
						<Dropdown overlay={resolvedMenu}>
							<Styled.MoreOutlined />
						</Dropdown>
					)}
					<Styled.Divider type={'vertical'} />
					<Styled.QuestionCircleOutlined onClick={_onGuideClick} />
				</>
			),
		[projectId, _onGuideClick, hasPrivilege, resolvedMenu, setHeaderActions, t]
	)

	const _onLoadingMoreClick = useCallback(
		() =>
			selectedStatsDisplay === ITEMS
				? dispatch(fetchProjectItems(projectId, itemsIndex + 1, PROJECT_ITEMS_SIZE))
				: dispatch(fetchProjectStatsTasks(projectId, tasksIndex + 1, PROJECT_STATS_TASKS_SIZE)),
		[selectedStatsDisplay, itemsIndex, tasksIndex, projectId, dispatch]
	)

	const _onEditFilterClick = useCallback(() => dispatch(openFilterModal()), [dispatch])

	const _onLogsFiltersChange = useCallback(
		(param) => dispatch(fetchProjectLogs(projectId, 0, PROJECT_LOGS_SIZE, param)),
		[dispatch, projectId]
	)

	const _onLoadingMore = useCallback(
		(type) => dispatch(fetchProjectLogs(projectId, logsIndex + 1, PROJECT_LOGS_SIZE, type)),
		[dispatch, projectId, logsIndex]
	)

	const _onTabChange = (key) => {
		if (!!key) {
			setSelectedStatsDisplay(key)
		}
	}

	return (
		<Page id={'homeProject'}>
			<Styled.Root>
				<Row gutter={['12', '12']}>
					<Col md={14} sm={24}>
						<Styled.LeftContainer>
							<Styled.ActionsContainer>
								<Styled.FunnelPlotOutlinedIcon />
								{filter?.total > 0 && <Styled.Badge count={`x${filter?.total}`} />}
								<Styled.EditButton type="link" onClick={_onEditFilterClick}>
									{t(`project:filter.editButton`)}
								</Styled.EditButton>
							</Styled.ActionsContainer>
							<Card
								activeTabKey={selectedStatsDisplay} //passer par le state activeTabKey /
								onTabChange={_onTabChange} //au click, setActiveTabeKey, setSelectedStatsDisplay
								isContentFullSize={true}
								tabList={tabList}
								tabProps={{ size: 'small' }}
							>
								{!isEmpty(selectedStatsDisplay === ITEMS ? itemsData : resolveTasksByCategories) ? (
									<Styled.Table
										expandIcon={() => null}
										expandRowByClick={true}
										defaultExpandAllRows={true}
										columns={selectedStatsDisplay === ITEMS ? itemsColumns : tasksColumns}
										dataSource={selectedStatsDisplay === ITEMS ? itemsData : resolveTasksByCategories}
										footer={
											(selectedStatsDisplay === ITEMS ? totalItems !== items.length : totalTasks !== tasks.length) &&
											(() => <Button onClick={_onLoadingMoreClick}>{t(`project:stats.table.loadMore`)}</Button>)
										}
									/>
								) : (
									<WarningMessage message={t(`project:warning.${!!filter?.total ? 'filter' : 'dataset'}`)} />
								)}
							</Card>
						</Styled.LeftContainer>
					</Col>
					<Col md={10} sm={24}>
						<Styled.RightContainer>
							<Card title={t('project:annotators.title')}>
								<AnnotatorsContainer annotators={annotators} currentUser={currentUser} />
							</Card>
							<Card title={t('project:logs.title')}>
								<LogsContainer
									logs={logs?.data || []}
									isProjectContext={true}
									onFiltersChange={_onLogsFiltersChange}
									onLoadingMore={_onLoadingMore}
									hasMoreLogs={totalLogs > logs?.data.length}
								/>
							</Card>
						</Styled.RightContainer>
					</Col>
				</Row>
			</Styled.Root>
		</Page>
	)
}

export default HomeProjectPage
