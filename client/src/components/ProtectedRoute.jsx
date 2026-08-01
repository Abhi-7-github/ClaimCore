import { Navigate, Outlet, useLocation } from 'react-router-dom'

import Loader from './Loader'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isReady, role, homePath } = useAuth()
  const location = useLocation()

  if (!isReady) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={homePath} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
