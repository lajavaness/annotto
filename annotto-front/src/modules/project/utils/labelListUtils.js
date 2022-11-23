export const findDependantTasks = (value, tasks) => {
	let allDependentTasks = []
	const findTasksFunction = (taskValue) => {
		tasks.forEach((task) => {
			if (task.conditions.includes(taskValue)) {
				allDependentTasks = [...allDependentTasks, task.value]
				findTasksFunction(task.value)
			}
		})
	}
	findTasksFunction(value)
	return allDependentTasks
}
