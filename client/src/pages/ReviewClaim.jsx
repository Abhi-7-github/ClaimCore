import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Loader from '../components/Loader'
import api from '../services/api'
import {
  formatCurrency,
  formatDate,
  getStatusMeta,
} from '../utils/constants'

const ReviewClaim = () => {
  const { id } = useParams()
  const [claim, setClaim] = useState(null)
  const [approvedAmount, setApprovedAmount] = useState('')
  const [comments, setComments] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadClaim = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/claims/${id}`)
        const claimData = response.data?.data

        setClaim(claimData)
        setApprovedAmount(claimData?.approvedAmount !== undefined ? String(claimData.approvedAmount) : '')
        setComments(claimData?.insurerComments || '')
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load the claim.')
      } finally {
        setLoading(false)
      }
    }

    loadClaim()
  }, [id])

  const submitReview = async (status) => {
    try {
      setSaving(true)
      setError('')
      setMessage('')

      const fallbackAmount = status === 'Rejected' ? 0 : Number(claim?.claimAmount || 0)
      const payload = {
        status,
        approvedAmount: approvedAmount === '' ? fallbackAmount : Number(approvedAmount),
        insurerComments: comments,
      }

      const response = await api.put(`/claims/${id}`, payload)
      setClaim(response.data?.data)
      setMessage(`Claim ${status.toLowerCase()} successfully.`)
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to update the claim.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader label="Loading claim review..." />
  }

  if (error && !claim) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-red-700">{error}</p>
          <Link
            to="/insurer"
            className="mt-4 inline-flex rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </Link>
        </div>
      </div>
    )
  }

  const statusMeta = getStatusMeta(claim?.status)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Review Claim</h1>
          <p className="mt-1 text-sm text-gray-500">Approve or reject the submitted claim.</p>
        </div>

        <Link to="/insurer" className="text-sm font-medium text-gray-700 hover:text-gray-900">
          Back
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <ReviewItem label="Name" value={claim?.name} />
          <ReviewItem label="Email" value={claim?.email} />
          <ReviewItem label="Amount" value={formatCurrency(claim?.claimAmount)} />
          <ReviewItem
            label="Status"
            value={
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            }
          />
          <ReviewItem label="Submitted Date" value={formatDate(claim?.submittedAt)} />
          <ReviewItem label="Approved Amount" value={formatCurrency(claim?.approvedAmount)} />
        </div>

        <ReviewItem label="Description" value={<p className="whitespace-pre-line text-gray-700">{claim?.description}</p>} />
        <ReviewItem label="Uploaded Document" value={claim?.documentUrl ? <a href={claim.documentUrl} target="_blank" rel="noreferrer" className="font-medium text-gray-900 underline underline-offset-2">View Document</a> : '-'} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="approvedAmount" className="mb-1 block text-sm font-medium text-gray-700">
              Approved Amount
            </label>
            <input
              id="approvedAmount"
              type="number"
              min="0"
              step="0.01"
              value={approvedAmount}
              onChange={(event) => setApprovedAmount(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="0"
            />
          </div>

          <div>
            <label htmlFor="comments" className="mb-1 block text-sm font-medium text-gray-700">
              Comments
            </label>
            <textarea
              id="comments"
              rows="4"
              value={comments}
              onChange={(event) => setComments(event.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="Enter review comments"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => submitReview('Approved')}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Approve'}
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => submitReview('Rejected')}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

const ReviewItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-1 text-sm text-gray-900">{value}</div>
    </div>
  )
}

export default ReviewClaim
