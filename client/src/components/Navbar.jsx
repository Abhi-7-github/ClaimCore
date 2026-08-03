import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { role, logout, user, login } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const handleProfileOpen = () => {
    setProfileForm({ name: user?.name || '', email: user?.email || '' })
    setProfileError('')
    setProfileSuccess('')
    setIsProfileOpen(true)
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setProfileError('Name and email are required.')
      return
    }

    try {
      setSavingProfile(true)
      const response = await api.put('/auth/profile', {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      })

      const updatedUser = response.data?.data?.user || null
      login({
        token: localStorage.getItem('claimcore_token') || '',
        role: role || 'patient',
        user: updatedUser || user,
      })
      setProfileSuccess('Profile updated successfully.')
    } catch (requestError) {
      setProfileError(requestError?.response?.data?.message || 'Unable to update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-gray-900">ClaimCore</p>
          <p className="text-sm text-gray-500">Claims management platform</p>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={handleProfileOpen}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"
            aria-label="Open profile"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
              <path
                fill="currentColor"
                d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 3a3.25 3.25 0 1 1-3.25 3.25A3.254 3.254 0 0 1 12 5Zm0 14.2a7.49 7.49 0 0 1-5.85-2.82 6.58 6.58 0 0 1 11.7 0A7.49 7.49 0 0 1 12 19.2Z"
              />
            </svg>
          </button>
        </div>
      </div>

      {isProfileOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">Update your personal information.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileOpen(false)}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {profileError ? (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {profileError}
              </div>
            ) : null}

            {profileSuccess ? (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {profileSuccess}
              </div>
            ) : null}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false)
                  handleLogout()
                }}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
