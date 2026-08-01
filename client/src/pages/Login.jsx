import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { ROLE_HOME_PATH } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  email: '',
  password: '',
}

const Login = () => {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { login, isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_HOME_PATH[role] || '/patient', { replace: true })
    }
  }, [isAuthenticated, navigate, role])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const validate = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return 'Email and password are required.'
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      const response = await api.post('/auth/login', form)
      const payload = response.data?.data

      login({
        token: payload?.token,
        role: payload?.user?.role,
        user: payload?.user,
      })

      const destination = ROLE_HOME_PATH[payload?.user?.role] || '/patient'

      navigate(destination, { replace: true })
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to sign in. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">ClaimCore</h1>
          <p className="mt-2 text-sm text-gray-500">Access the ClaimCore platform.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="user@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
