import { isBoolean, isEmpty, isNull, isNumber, omit, pickBy } from 'lodash'
import moment from 'moment'

import { ANNOTATED, ANNOTATE_AT, ANNOTATE_BY, TAGS, UUID } from 'shared/enums/fieldTypes'
import {
	ANNOTATION_ADD,
	ANNOTATION_REMOVE,
	COMMENT_ADD,
	COMMENT_REMOVE,
	RELATION_ADD,
	RELATION_REMOVE,
	TAGS_ADD,
	TAGS_REMOVE,
} from 'shared/enums/logsTypes'

import { TEXT } from 'shared/enums/annotationTypes'
import { mapFilterJsonToFilterForm } from 'shared/utils/filterUtils'
import { sortByCreatedAt } from 'shared/utils/dateUtils'

export const mapFilterResponseService = (data) => {
	if (isEmpty(data)) return data

	let updateData = data.payload || []

	if (!isEmpty(data.payload)) {
		updateData = data.payload.map((filter) => {
			return filter.field === ANNOTATE_AT ? { ...filter, value: [filter.value.from, filter.value.to] } : filter
		})
	}

	const { annotated, annotatedAt, annotatedBy, tags, similarTo, filters } = mapFilterJsonToFilterForm(updateData)

	return pickBy(
		{
			form: { annotated, annotatedAt, annotatedBy, tags, similarTo, filters } || null,
			total: data?.payload?.length || 0,
			id: data._id || null,
		},
		(value) => isNumber(value) || !isEmpty(value)
	)
}

export const mapFilterRequestService = (data) => {
	if (isEmpty(data)) return []

	return data.map((filter) =>
		filter.field === ANNOTATE_AT
			? {
					...filter,
					value: { from: moment(filter.value.from).toISOString(), to: moment(filter.value.to).toISOString() },
			  }
			: filter
	)
}

export const mapOperatorResponseService = (input) => {
	if (isEmpty(input)) return input

	let { fields, operators } = input

	fields = omit(fields, [ANNOTATED, ANNOTATE_BY, ANNOTATE_AT, UUID, TAGS])

	return { fields, operators }
}

export const mapAndSortLogsService = (logs) => {
	if (isEmpty(logs)) return logs

	return sortByCreatedAt(logs).map((log) =>
		pickBy(
			{
				_id: log._id || null,
				value: resolveLogValueService(log) || null,
				item: log.item || null,
				type: log.type || null,
				hasTaskText: log?.annotations?.some(({ task: { type } }) => type === TEXT) || null,
				user:
					!isEmpty(log.user) && log.user?.firstName && log.user?.lastName
						? `${log.user.firstName} ${log.user.lastName.substring(0, 1)}.`
						: null,
				createdAt: log.createdAt || null,
				comment: log.comment || null,
			},
			(value) => isNumber(value) || !isNull(value) || isBoolean(value)
		)
	)
}

/*
 * Filter the duplicated Log.
 * It is possible that the logs are duplicated, in particular the comment logs.
 * When a comment is posted, it is added to the list of logs, it must not be added a second time to this list
 * if we re-request to get all the logs. It is possible that the back returns us a log which is already present
 * in this list.
 */
export const filterDuplicateLogEntries = (oldLogs, newLogs) => {
	if (isEmpty(oldLogs) || isEmpty(newLogs)) return newLogs

	return newLogs.filter(({ _id }) => !oldLogs.some((log) => log._id === _id))
}

export const resolveLogValueService = (log) => {
	if (isEmpty(log) || !log.type) return null

	switch (log.type) {
		case ANNOTATION_ADD:
		case ANNOTATION_REMOVE: {
			return (
				log.annotations?.filter(({ task }) => !!task?.label && task?.type !== TEXT).map(({ task }) => task?.label) ||
				null
			)
		}
		case TAGS_ADD:
		case TAGS_REMOVE: {
			return log.tags[0]
		}
		case COMMENT_ADD:
		case COMMENT_REMOVE: {
			return log.commentMessage
		}
		case RELATION_ADD:
		case RELATION_REMOVE: {
			return log.relations?.map(({ entitiesRelation }) => entitiesRelation?.label).filter((label) => !!label) || null
		}
		default: {
			return null
		}
	}
}

export const mapPostCommentResponseService = (input) => {
	if (isEmpty(input)) return input

	return pickBy(
		{
			_id: input._id || null,
			value: input.comment || null,
			type: COMMENT_ADD,
			comment: input._id || null,
			user:
				!isEmpty(input.user) && input.user.firstName && input.user.lastName
					? `${input.user.firstName} ${input.user.lastName.substring(0, 1)}.`
					: null,
			createdAt: input.createdAt || null,
		},
		(value) => isNumber(value) || !isNull(value) || isBoolean(value)
	)
}
