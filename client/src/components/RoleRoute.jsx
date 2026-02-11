import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading, token } = useSelector((state) => state.auth)

  // While we are resolving the current user (e.g., getMe in progress), avoid redirecting
  if (loading || (token && !user)) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleRoute
