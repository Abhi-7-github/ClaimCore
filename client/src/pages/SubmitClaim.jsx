import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { safeArray } from '../utils/constants'

const initialForm = {
  name: '',
  email: '',
  claimAmount: '',
  description: '',
}

const SubmitClaim = () => {
  const { id: claimId } = useParams()
  const [form, setForm] = useState(initialForm)
  const [documentFile, setDocumentFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingClaim, setLoadingClaim] = useState(Boolean(claimId))
  const [useProfileDetails, setUseProfileDetails] = useState(true)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const isEditMode = Boolean(claimId)
  const { user } = useAuth()

  useEffect(() => {
    if (!claimId) {
      if (user && useProfileDetails) {
        setForm((currentForm) => ({
          ...currentForm,
          name: user.name || '',
          email: user.email || '',
        }))
      } else {
        setForm(initialForm)
      }
      setDocumentFile(null)
      return
    }

    const loadClaim = async () => {
      try {
        setError('')
        setLoadingClaim(true)
        const response = await api.get('/claims/my')
        const foundClaim = safeArray(response.data?.data).find((item) => item._id === claimId || item.id === claimId)

        if (!foundClaim) {
          setError('Claim not found.')
          return
        }

        if (foundClaim.status !== 'Pending') {
          setError('Only pending claims can be edited.')
          return
        }

        setForm({
          name: foundClaim.name || '',
          email: foundClaim.email || '',
          claimAmount: foundClaim.claimAmount !== undefined ? String(foundClaim.claimAmount) : '',
          description: foundClaim.description || '',
        })
      } catch (requestError) {
        setError(requestError?.response?.data?.message || 'Unable to load the claim.')
      } finally {
        setLoadingClaim(false)
      }
    }

    loadClaim()
  }, [claimId, user, useProfileDetails])

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }))
  }

  const handleFileChange = (event) => {
    setDocumentFile(event.target.files?.[0] || null)
  }

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.claimAmount.trim() || !form.description.trim()) {
      return 'All fields are required.'
    }

    if (!isEditMode && !documentFile) {
      return 'Please upload a supporting document.'
    }

    return ''
  }

  const resetForm = () => {
    setForm(initialForm)
    setDocumentFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const validationError = validate()

    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setLoading(true)

      if (isEditMode) {
        await api.put(`/claims/${claimId}`, {
          name: form.name.trim(),
          email: form.email.trim(),
          claimAmount: form.claimAmount,
          description: form.description.trim(),
        })

        setSuccess('Claim updated successfully.')
        navigate(`/patient/claims/${claimId}`)
        return
      }

      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('claimAmount', form.claimAmount)
      formData.append('description', form.description)
      formData.append('document', documentFile)

      await api.post('/claims', formData)

      setSuccess('Claim submitted successfully.')
      resetForm()
    } catch (requestError) {
      setError(requestError?.response?.data?.message || (isEditMode ? 'Unable to update the claim.' : 'Unable to submit the claim.'))
    } finally {
      setLoading(false)
    }
  }

  if (loadingClaim && isEditMode) {
    return <Loader label="Loading claim details..." />
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Claim' : 'Submit Claim'}</h1>
          <p className="mt-1 text-sm text-gray-500">{isEditMode ? 'Update the pending claim details.' : 'Provide the claim details and upload one document.'}</p>
        </div>

        <Link to={isEditMode ? `/patient/claims/${claimId}` : '/patient'} className="text-sm font-medium text-gray-700 hover:text-gray-900">
          {isEditMode ? 'Back to claim' : 'Back to dashboard'}
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm" noValidate>
        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        {!isEditMode ? (
          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={useProfileDetails}
                onChange={(event) => setUseProfileDetails(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Use my profile details for this claim
            </label>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="John Doe"
            />
          </div>

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
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="claimAmount" className="mb-1 block text-sm font-medium text-gray-700">
              Claim Amount
            </label>
            <input
              id="claimAmount"
              name="claimAmount"
              type="number"
              min="0"
              step="0.01"
              value={form.claimAmount}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              placeholder="1000"
            />
          </div>

          {!isEditMode ? (
            <div>
              <label htmlFor="document" className="mb-1 block text-sm font-medium text-gray-700">
                Upload Document
              </label>
              <input
                id="document"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
              />
            </div>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
            placeholder="Describe the claim"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update Claim' : 'Submit Claim')}
          </button>

          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default SubmitClaim
