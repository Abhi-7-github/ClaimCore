import { useNavigate } from 'react-router-dom'

import { getRoleLabel } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { role, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-gray-900">ClaimCore</p>
          <p className="text-sm text-gray-500">Claims management platform</p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
            {getRoleLabel(role)}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
