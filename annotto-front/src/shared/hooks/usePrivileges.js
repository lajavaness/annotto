import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { PRIVILEGES } from 'shared/enums/privilegesTypes'
import roles from 'shared/enums/rolesTypes'

import { selectUserInfo } from 'modules/root/selectors/authSelectors'

const usePrivileges = () => {
  const [privileges, setPrivileges] = useState([])

  const user = useSelector(selectUserInfo)

  useEffect(() => {
    if (user) {
      const userRoles = user?.profile?.roles
      if (userRoles) {
        setPrivileges(PRIVILEGES.admin)
        let userPrivileges = []
        roles
          .filter((role) => userRoles.includes(role))
          .forEach((role) => {
            userPrivileges = [...userPrivileges, ...PRIVILEGES[role]]
          })
        setPrivileges([...new Set(userPrivileges)])
      }
    }
  }, [user])

  return useCallback((privilege) => !isEmpty(privileges) && privilege && privileges.includes(privilege), [privileges])
}

export default usePrivileges
