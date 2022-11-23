import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { ADMIN, DEFAULT } from 'shared/enums/rolesTypes'
import { PRIVILEGES, PROJECT_PRIVILEGES } from 'shared/enums/privilegesTypes'

import { selectConfigProjectUsersByRole } from 'modules/configurationProject/selectors/configurationProjectSelectors'
import { selectUserInfo } from 'modules/root/selectors/authSelectors'

import { selectProjectUsersByRole } from 'modules/project/selectors/projectSelectors'

const useProjectPrivileges = (isConfigProjectContext = false) => {
	const [privileges, setPrivileges] = useState([])

	const user = useSelector(selectUserInfo)

	const projectUsersByRole = useSelector(
		!isConfigProjectContext ? selectProjectUsersByRole : selectConfigProjectUsersByRole
	)

	const resolvedProjectRoleByEmail = useCallback(
		(userEmail) => {
			const usersByRoles = {}

			Object.entries(projectUsersByRole).forEach(([role, value]) => {
				if (!value) {
					usersByRoles[role] = []
				} else {
					usersByRoles[role] = value
				}
			})

			if (!Object.values(usersByRoles).every((value) => isEmpty(value))) {
				const [role] = Object.entries(usersByRoles).find(([_, values]) => {
					return values.includes(userEmail)
				}) || [null]
				if (role) {
					return role
				} else {
					return DEFAULT
				}
			}
		},
		[projectUsersByRole]
	)

	useEffect(() => {
		if (user) {
			const roles = user?.profile?.roles
			if (roles?.includes(ADMIN)) {
				setPrivileges(PRIVILEGES[ADMIN])
			} else {
				if (user.email) {
					const projectRole = resolvedProjectRoleByEmail(user.email)
					if (projectRole && projectRole !== DEFAULT) {
						setPrivileges(PROJECT_PRIVILEGES[projectRole])
					} else if (projectRole === DEFAULT && roles) {
						let userPrivileges = []
						Object.keys(PRIVILEGES).forEach((role) => {
							if (roles.includes(role)) {
								userPrivileges = [...userPrivileges, ...PRIVILEGES[role]]
							}
						})
						setPrivileges(userPrivileges)
					}
				}
			}
		}
	}, [user, resolvedProjectRoleByEmail])

	return useCallback((privilege) => !isEmpty(privileges) && privilege && privileges?.includes(privilege), [privileges])
}

export default useProjectPrivileges
