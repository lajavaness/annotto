import { isEmpty, merge, omit } from 'lodash'
import { message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useMemo } from 'react'

import {
	selectIsFilterModalOpen,
	selectIsGuideModalOpen,
	selectIsReady,
	selectIsSuccessPosted,
	selectProjectAdmins,
	selectProjectDatascientists,
	selectProjectDefaultTags,
	selectProjectEntitiesRelationsGroup,
	selectProjectFilter,
	selectProjectFilterFields,
	selectProjectFilterOperators,
	selectProjectGuideLines,
	selectProjectId,
	selectProjectItemsTags,
	selectProjectTasks,
	selectProjectUsers,
} from 'modules/project/selectors/projectSelectors'
import { selectIsSimilarityAllowed } from 'modules/root/selectors/rootSelectors'

import { closeFilterModal, closeGuideModal } from 'modules/project/actions/projectActions'
import { postProjectFilter } from 'modules/project/actions/filterActions'

import FilterForm from 'modules/project/components/common/FilterForm'
import GuideModal from 'modules/project/components/common/GuideModal'
import Loader from 'shared/components/loader/Loader'
import Page from 'shared/components/page/Page'

import * as Styled from 'modules/project/components/pages/__styles__/ProjectPage.styles'

const ProjectPage = ({ children }) => {
	const isReady = useSelector(selectIsReady)
	const filter = useSelector(selectProjectFilter)
	const projectId = useSelector(selectProjectId)
	const isSuccessPosted = useSelector(selectIsSuccessPosted)
	const filterOperators = useSelector(selectProjectFilterOperators)
	const filterFields = useSelector(selectProjectFilterFields)
	const isFilterModalOpen = useSelector(selectIsFilterModalOpen)
	const isGuideModalOpen = useSelector(selectIsGuideModalOpen)
	const guidelines = useSelector(selectProjectGuideLines)
	const tasks = useSelector(selectProjectTasks)
	const entitiesRelationsGroup = useSelector(selectProjectEntitiesRelationsGroup)
	const users = useSelector(selectProjectUsers)
	const datascientists = useSelector(selectProjectDatascientists)
	const admins = useSelector(selectProjectAdmins)
	const isSimilarityAllowed = useSelector(selectIsSimilarityAllowed)
	const defaultTags = useSelector(selectProjectDefaultTags)
	const itemTags = useSelector(selectProjectItemsTags)

	const dispatch = useDispatch()

	const { t } = useTranslation('project')

	useEffect(() => {
		if (isSuccessPosted) {
			dispatch(closeFilterModal())
			message.success(t('project:filter.successMessage'))
		}
	}, [isSuccessPosted, dispatch, t])

	const tags = merge(defaultTags, itemTags)

	const sortedUsers = useMemo(
		() =>
			[
				...(!isEmpty(users) ? users : []),
				...(!isEmpty(admins) ? admins : []),
				...(!isEmpty(datascientists) ? datascientists : []),
			].sort(),
		[admins, datascientists, users]
	)

	const _onFilterModalCloseClick = useCallback(() => dispatch(closeFilterModal()), [dispatch])

	const _onGuideModalCloseClick = useCallback(() => dispatch(closeGuideModal()), [dispatch])

	const _onSubmitFilterClick = useCallback(
		(value) => dispatch(postProjectFilter(projectId, value)),
		[dispatch, projectId]
	)

	const _onCancelClick = useCallback(() => dispatch(closeFilterModal()), [dispatch])

	return (
		<Page id={'project'}>
			{isReady ? (
				<Styled.Root>
					{children}
					<Styled.Modal
						width={'100%'}
						destroyOnClose={true}
						getContainer={false}
						footer={null}
						visible={isFilterModalOpen}
						onCancel={_onFilterModalCloseClick}
					>
						<FilterForm
							tags={tags}
							formData={filter?.form}
							isSimilarityAllowed={isSimilarityAllowed}
							filterOperators={filterOperators}
							filterFields={isSimilarityAllowed ? filterFields : omit(filterFields, 'uuid')}
							users={sortedUsers}
							tasks={tasks}
							onSubmitFilterClick={_onSubmitFilterClick}
							onCancelClick={_onCancelClick}
						/>
					</Styled.Modal>
					<Styled.Modal
						width={'100%'}
						destroyOnClose={true}
						getContainer={false}
						footer={null}
						visible={isGuideModalOpen}
						onCancel={_onGuideModalCloseClick}
					>
						<GuideModal guidelines={guidelines} tasks={tasks} entitiesRelationsGroup={entitiesRelationsGroup} />
					</Styled.Modal>
				</Styled.Root>
			) : (
				<Loader />
			)}
		</Page>
	)
}

export default ProjectPage
