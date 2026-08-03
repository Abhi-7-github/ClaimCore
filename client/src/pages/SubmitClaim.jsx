import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Loader from '../components/Loader'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { safeArray } from '../utils/constants'

const initialForm = { name: '', email: '', claimAmount: '', description: '' }

/* ─── Icons ─────────────────────────────────────────────────── */
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
)
const IconEmail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
  </svg>
)
const IconCurrency = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)
const IconUpload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)
const IconText = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="17" y1="10" x2="3" y2="10" /><line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" /><line x1="17" y1="18" x2="3" y2="18" />
  </svg>
)
const IconSend = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

/* ─── Shared field style ─────────────────────────────────────── */
const fieldStyle = {
  width: '100%',
  padding: '10px 12px 10px 38px',
  borderRadius: '8px',
  border: '1px solid #c0ddd4',
  fontSize: '14px',
  color: '#0d2e22',
  background: '#fafcfb',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '700',
  color: '#3d7a62',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  marginBottom: '6px',
}

const iconWrap = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#8ab4a4',
  display: 'flex',
  pointerEvents: 'none',
}

/* ─── Component ─────────────────────────────────────────────── */
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
        setForm((f) => ({ ...f, name: user.name || '', email: user.email || '' }))
      } else {
        setForm(initialForm)
      }
      setDocumentFile(null)
      return
    }

    const loadClaim = async () => {
      try {
        setError(''); setLoadingClaim(true)
        const response = await api.get('/claims/my')
        const foundClaim = safeArray(response.data?.data).find((item) => item._id === claimId || item.id === claimId)
        if (!foundClaim) { setError('Claim not found.'); return }
        if (foundClaim.status !== 'Pending') { setError('Only pending claims can be edited.'); return }
        setForm({
          name: foundClaim.name || '',
          email: foundClaim.email || '',
          claimAmount: foundClaim.claimAmount !== undefined ? String(foundClaim.claimAmount) : '',
          description: foundClaim.description || '',
        })
      } catch (e) {
        setError(e?.response?.data?.message || 'Unable to load the claim.')
      } finally { setLoadingClaim(false) }
    }
    loadClaim()
  }, [claimId, user, useProfileDetails])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }
  const handleFileChange = (e) => { setDocumentFile(e.target.files?.[0] || null) }

  const validate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.claimAmount.trim() || !form.description.trim()) {
      return 'All fields are required.'
    }
    if (!isEditMode && !documentFile) return 'Please upload a supporting document.'
    return ''
  }

  const resetForm = () => {
    setForm(initialForm); setDocumentFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    try {
      setLoading(true)
      if (isEditMode) {
        await api.put(`/claims/${claimId}`, {
          name: form.name.trim(), email: form.email.trim(),
          claimAmount: form.claimAmount, description: form.description.trim(),
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
    } catch (e) {
      setError(e?.response?.data?.message || (isEditMode ? 'Unable to update the claim.' : 'Unable to submit the claim.'))
    } finally { setLoading(false) }
  }

  if (loadingClaim && isEditMode) return <Loader label="Loading claim details..." />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .sc-input:focus, .sc-textarea:focus, .sc-file:focus {
          border-color:#2aa882!important; box-shadow:0 0 0 3px rgba(42,168,130,0.12)!important; outline:none; background:#fff!important;
        }
        .sc-back:hover   { background:#f0faf6!important; border-color:#2aa882!important; }
        .sc-submit:hover { background:#17755a!important; box-shadow:0 4px 14px rgba(21,95,71,0.3)!important; }
        .sc-cancel:hover { background:#f0faf6!important; border-color:#2aa882!important; }
        .sc-checkbox:checked { accent-color:#1e8f6e; }
      `}</style>

      <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#f5f7f6', minHeight: '100vh' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(125deg,#155e47 0%,#1e8f6e 50%,#52c4a0 100%)', padding: '28px 44px 24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#90dfc4', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            ClaimCore &nbsp;/&nbsp; Patient Portal &nbsp;/&nbsp; {isEditMode ? 'Edit Claim' : 'Submit Claim'}
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0 }}>
            {isEditMode ? 'Edit Claim' : 'Submit a New Claim'}
          </h1>
          <p style={{ color: '#b8ecdd', fontSize: '13px', margin: '6px 0 0' }}>
            {isEditMode ? 'Update the pending claim details below.' : 'Provide your claim details and upload a supporting document.'}
          </p>
        </div>

        <div style={{ maxWidth: '840px', margin: '0 auto', padding: '28px 28px 48px' }}>

          {/* Back link */}
          <div style={{ marginBottom: '20px' }}>
            <Link to={isEditMode ? `/patient/claims/${claimId}` : '/patient'} className="sc-back"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.18s' }}>
              <IconBack /> {isEditMode ? 'Back to Claim' : 'Back to Dashboard'}
            </Link>
          </div>

          {/* Form card */}
          <div style={{ background: '#fff', border: '1px solid #d4e8e0', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid #dff0e8', background: '#f7fbf9' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0d2e22', margin: 0 }}>
                {isEditMode ? 'Edit Claim Details' : 'Claim Details'}
              </h2>
              <p style={{ fontSize: '12px', color: '#6b9e8c', margin: '2px 0 0' }}>All fields are required.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Alerts */}
              {error && (
                <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '13px', fontWeight: '500' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ padding: '12px 16px', background: '#f0faf5', border: '1px solid #86efad', borderRadius: '8px', color: '#15803d', fontSize: '13px', fontWeight: '500' }}>
                  {success}
                </div>
              )}

              {/* Profile auto-fill toggle */}
              {!isEditMode && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#f0faf6', border: '1px solid #c0ddd4', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#0d2e22', fontWeight: '500' }}>
                  <input
                    type="checkbox"
                    checked={useProfileDetails}
                    onChange={(e) => setUseProfileDetails(e.target.checked)}
                    className="sc-checkbox"
                    style={{ width: '16px', height: '16px', accentColor: '#1e8f6e', cursor: 'pointer' }}
                  />
                  Auto-fill my profile details (name &amp; email)
                </label>
              )}

              {/* Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '16px' }}>
                <div>
                  <label htmlFor="name" style={labelStyle}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconWrap}><IconUser /></span>
                    <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
                      placeholder="John Doe" className="sc-input" style={fieldStyle} />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconWrap}><IconEmail /></span>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="john@example.com" className="sc-input" style={fieldStyle} />
                  </div>
                </div>
              </div>

              {/* Amount + File */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: '16px' }}>
                <div>
                  <label htmlFor="claimAmount" style={labelStyle}>Claim Amount (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconWrap}><IconCurrency /></span>
                    <input id="claimAmount" name="claimAmount" type="number" min="0" step="0.01"
                      value={form.claimAmount} onChange={handleChange}
                      placeholder="e.g. 15000" className="sc-input" style={fieldStyle} />
                  </div>
                </div>

                {!isEditMode && (
                  <div>
                    <label htmlFor="document" style={labelStyle}>Supporting Document</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ ...iconWrap, top: '50%' }}><IconUpload /></span>
                      <input id="document" ref={fileInputRef} type="file" onChange={handleFileChange}
                        className="sc-file sc-input"
                        style={{ ...fieldStyle, padding: '9px 12px 9px 38px', color: documentFile ? '#0d2e22' : '#8ab4a4', cursor: 'pointer' }} />
                    </div>
                    {documentFile && (
                      <p style={{ fontSize: '12px', color: '#1e8f6e', margin: '5px 0 0', fontWeight: '500' }}>
                        Selected: {documentFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" style={labelStyle}>Description</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ ...iconWrap, top: '14px', transform: 'none' }}><IconText /></span>
                  <textarea id="description" name="description" rows="5"
                    value={form.description} onChange={handleChange}
                    placeholder="Provide a detailed description of your claim…"
                    className="sc-textarea"
                    style={{ ...fieldStyle, padding: '10px 12px 10px 38px', resize: 'vertical' }} />
                </div>
              </div>

              {/* Submit / Cancel */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <button type="submit" disabled={loading} className="sc-submit"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 26px', borderRadius: '8px', border: 'none', background: '#1e8f6e', color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', opacity: loading ? 0.65 : 1 }}>
                  <IconSend />
                  {loading ? (isEditMode ? 'Updating…' : 'Submitting…') : (isEditMode ? 'Update Claim' : 'Submit Claim')}
                </button>
                <button type="button" onClick={() => navigate('/patient')} className="sc-cancel"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '11px 22px', borderRadius: '8px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.18s' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default SubmitClaim
