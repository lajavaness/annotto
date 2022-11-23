import { isArray, isEmpty } from 'lodash'

/**
 * Groups tasks by categories.
 * All tasks with the same category will be grouped together in one object.
 * Tasks without category (or containing an empty string)
 * will be added to the returned array after grouped tasks.
 *
 * @param  {Array.<object>}  tasks The tasks that will be grouped together.
 * @returns {Array.<object>} Returns grouped tasks with this format
 * [category : String , children : [task], ...otherProperties].
 */
export const groupTasksByCategories = (tasks) => {
	if (!isArray(tasks) || isEmpty(tasks)) {
		return []
	}

	const taskWithoutCategories = tasks.filter(({ category }) => isEmpty(category))
	const tasksWithCategories = tasks.filter(({ category }) => !isEmpty(category))

	const groupedTasks = tasksWithCategories.reduce((acc, { category, ...others }, index) => {
		const categoryIndex = acc.findIndex(({ category: accCategory }) => accCategory === category)
		const child = others

		if (categoryIndex < 0) {
			acc.push({ category, children: [child] })
		} else {
			acc[categoryIndex] = {
				...acc[categoryIndex],
				children: [...acc[categoryIndex].children, child],
			}
		}
		return acc
	}, [])

	const mappedTasksWithoutCategories = taskWithoutCategories.map(({ category, ...others }, index) => ({
		...others,
		category: null,
		children: [],
	}))

	return [...groupedTasks, ...mappedTasksWithoutCategories]
}
