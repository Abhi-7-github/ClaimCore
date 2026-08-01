import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import Loader from '../components/Loader'
import api from '../services/api'
import {
  TABLE_EMPTY_MESSAGE,
  formatCurrency,
  formatDate,
  getClaimId,
  getStatusMeta,
  safeArray,
} from '../utils/constants'

const PatientDashboard = () => {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClaims = async () => {
      try {
        setLoading(true)
        const response = await api.get('/claims/my')
        setClaims(safeArray(response.data?.data))
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load your claims.')
      } finally {
        setLoading(false)
      }
    }

    loadClaims()
  }, [])

  const summary = useMemo(() => {
    const totalClaims = claims.length
    const pending = claims.filter((claim) => claim.status === 'Pending').length
    const approved = claims.filter((claim) => claim.status === 'Approved').length
    const rejected = claims.filter((claim) => claim.status === 'Rejected').length

    return [
      { label: 'Total Claims', value: totalClaims },
      { label: 'Pending', value: pending },
      { label: 'Approved', value: approved },
      { label: 'Rejected', value: rejected },
    ]
  }, [claims])

  if (loading) {
    return <Loader label="Loading claims..." />
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patient Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">View your claims and submit a new request.</p>
        </div>

        <Link
          to="/patient/submit"
          className="inline-flex w-fit flex-none items-center justify-center rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm hover:opacity-90"
          style={{ backgroundColor: '#111827', color: '#ffffff', minWidth: '9.5rem' }}
        >
          Submit New Claim
        </Link>
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-base font-semibold text-gray-900">Claims</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">Claim ID</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submitted Date</th>
                <th className="px-4 py-3 font-medium">Approved Amount</th>
                <th className="px-4 py-3 font-medium">View</th>
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
                      <td className="px-4 py-3 font-medium text-gray-900">{getClaimId(claim)}</td>
                      <td className="px-4 py-3">{formatCurrency(claim.claimAmount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatDate(claim.submittedAt)}</td>
                      <td className="px-4 py-3">{formatCurrency(claim.approvedAmount)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/patient/claims/${getClaimId(claim)}`}
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

export default PatientDashboard
