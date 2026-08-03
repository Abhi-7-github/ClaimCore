import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import Loader from '../components/Loader'
import api from '../services/api'
import {
  formatCurrency,
  formatDate,
  getStatusMeta,
  safeArray,
} from '../utils/constants'

const ClaimDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClaim = async () => {
      try {
        setLoading(true)
        const response = await api.get('/claims/my')
        const foundClaim = safeArray(response.data?.data).find((item) => item._id === id || item.id === id)

        if (!foundClaim) {
          setError('Claim not found.')
          setClaim(null)
          return
        }

        setClaim(foundClaim)
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load claim details.')
      } finally {
        setLoading(false)
      }
    }

    loadClaim()
  }, [id])

  if (loading) {
    return <Loader label="Loading claim details..." />
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="mt-4 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const statusMeta = getStatusMeta(claim?.status)

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Claim Details</h1>
          <p className="mt-1 text-sm text-gray-500">Review the submitted claim information.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {claim?.status === 'Pending' ? (
            <button
              type="button"
              onClick={() => navigate(`/patient/claims/${id}/edit`)}
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Edit
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <DetailItem label="Name" value={claim?.name} />
          <DetailItem label="Email" value={claim?.email} />
          <DetailItem label="Amount" value={formatCurrency(claim?.claimAmount)} />
          <DetailItem
            label="Status"
            value={
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            }
          />
          <DetailItem label="Approved Amount" value={formatCurrency(claim?.approvedAmount)} />
          <DetailItem label="Submitted Date" value={formatDate(claim?.submittedAt)} />
        </div>

        <DetailItem label="Description" value={<p className="whitespace-pre-line text-gray-700">{claim?.description}</p>} />
        <DetailItem label="Insurer Comments" value={<p className="whitespace-pre-line text-gray-700">{claim?.insurerComments || '-'}</p>} />
        <DetailItem
          label="Uploaded Document"
          value={
            claim?.documentUrl ? (
              <a
                href={claim.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-gray-900 underline underline-offset-2"
              >
                View Document
              </a>
            ) : (
              '-'
            )
          }
        />
      </div>
    </div>
  )
}

const DetailItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{value}</div>
    </div>
  )
}

export default ClaimDetails
