import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-900">404</h1>
        <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}

export default NotFound
