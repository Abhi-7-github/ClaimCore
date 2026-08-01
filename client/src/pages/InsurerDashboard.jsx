import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Loader from '../components/Loader'
import api from '../services/api'
import {
  TABLE_EMPTY_MESSAGE,
  formatCurrency,
  formatDate,
  getClaimEmail,
  getClaimId,
  getClaimPatient,
  getStatusMeta,
  safeArray,
} from '../utils/constants'

const initialFilters = {
  status: '',
  minAmount: '',
  maxAmount: '',
  search: '',
}

const InsurerDashboard = () => {
  const [filters, setFilters] = useState(initialFilters)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState(null)

  const fetchClaims = async (activeFilters = filters) => {
    try {
      setLoading(true)

      const params = {
        limit: 100,
      }

      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value !== '') {
          params[key] = value
        }
      })

      const response = await api.get('/claims', { params })
      setClaims(safeArray(response.data?.data?.items))
      setPagination(response.data?.data?.pagination || null)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load claims.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true)

        const params = { limit: 100 }

        Object.entries(initialFilters).forEach(([key, value]) => {
          if (value !== '') {
            params[key] = value
          }
        })

        const response = await api.get('/claims', { params })
        setClaims(safeArray(response.data?.data?.items))
        setPagination(response.data?.data?.pagination || null)
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load claims.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const summary = useMemo(() => {
    const totalClaims = pagination?.total ?? claims.length
    const pending = claims.filter((claim) => claim.status === 'Pending').length
    const approved = claims.filter((claim) => claim.status === 'Approved').length
    const rejected = claims.filter((claim) => claim.status === 'Rejected').length

    return [
      { label: 'Total Claims', value: totalClaims },
      { label: 'Pending', value: pending },
      { label: 'Approved', value: approved },
      { label: 'Rejected', value: rejected },
    ]
  }, [claims, pagination?.total])

  const handleFilterChange = (event) => {
    const { name, value } = event.target

    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    setSubmitting(true)
    await fetchClaims(filters)
    setSubmitting(false)
  }

  const handleReset = async () => {
    setFilters(initialFilters)
    setError('')
    await fetchClaims(initialFilters)
  }

  if (loading) {
    return <Loader label="Loading claims..." />
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Insurer Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Review claims and apply simple filters.</p>
      </div>

      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => (
          <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="minAmount" className="mb-1 block text-sm font-medium text-gray-700">
              Min Amount
            </label>
            <input
              id="minAmount"
              name="minAmount"
              type="number"
              min="0"
              step="0.01"
              value={filters.minAmount}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="maxAmount" className="mb-1 block text-sm font-medium text-gray-700">
              Max Amount
            </label>
            <input
              id="maxAmount"
              name="maxAmount"
              type="number"
              min="0"
              step="0.01"
              value={filters.maxAmount}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="10000"
            />
          </div>

          <div>
            <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700">
              Search by Name
            </label>
            <input
              id="search"
              name="search"
              type="text"
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="Patient name"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? 'Applying...' : 'Apply Filters'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Claims</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white text-gray-700">
              {claims.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    {TABLE_EMPTY_MESSAGE}
                  </td>
                </tr>
              ) : (
                claims.map((claim) => {
                  const statusMeta = getStatusMeta(claim.status)

                  return (
                    <tr key={getClaimId(claim)}>
                      <td className="px-4 py-3 font-medium text-gray-900">{getClaimPatient(claim)}</td>
                      <td className="px-4 py-3">{getClaimEmail(claim)}</td>
                      <td className="px-4 py-3">{formatCurrency(claim.claimAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(claim.submittedAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/insurer/claims/${getClaimId(claim)}`}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InsurerDashboard
