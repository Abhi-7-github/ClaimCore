import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import Loader from '../components/Loader'
import api from '../services/api'
import {
  formatCurrency,
  formatDate,
  getStatusMeta,
} from '../utils/constants'

/* ─── Icons ─────────────────────────────────────────────────── */
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
)

/* ─── Detail item ────────────────────────────────────────────── */
const ReviewItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
      {label}
    </p>
    <div style={{ fontSize: '14px', color: '#0d2e22', fontWeight: '500' }}>{value ?? '-'}</div>
  </div>
)

/* ─── Component ─────────────────────────────────────────────── */
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
      } catch (e) {
        setError(e?.response?.data?.message || 'Unable to load the claim.')
      } finally { setLoading(false) }
    }
    loadClaim()
  }, [id])

  const submitReview = async (status) => {
    try {
      setSaving(true); setError(''); setMessage('')
      const fallbackAmount = status === 'Rejected' ? 0 : Number(claim?.claimAmount || 0)
      const payload = {
        status,
        approvedAmount: approvedAmount === '' ? fallbackAmount : Number(approvedAmount),
        insurerComments: comments,
      }
      const response = await api.put(`/claims/${id}`, payload)
      setClaim(response.data?.data)
      setMessage(`Claim ${status.toLowerCase()} successfully.`)
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to update the claim.')
    } finally { setSaving(false) }
  }

  if (loading) return <Loader label="Loading claim review..." />

  if (error && !claim) {
    return (
      <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #d4e8e0', borderRadius: '14px', padding: '32px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#991b1b', fontSize: '14px', margin: '0 0 16px' }}>{error}</p>
          <Link to="/insurer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '13px', fontWeight: '600', textDecoration: 'none' }}>
            <IconBack /> Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusMeta = getStatusMeta(claim?.status)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .rc-back:hover    { background:#f0faf6!important; border-color:#2aa882!important; }
        .rc-approve:hover { background:#15803d!important; }
        .rc-reject:hover  { background:#b91c1c!important; }
        .rc-input:focus, .rc-textarea:focus {
          border-color:#2aa882!important; box-shadow:0 0 0 3px rgba(42,168,130,0.12)!important; outline:none;
        }
        .rc-doc-link:hover { color:#1a7a5e!important; }
      `}</style>

      <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#f5f7f6', minHeight: '100vh' }}>

        {/* Banner */}
        <div style={{ background: 'linear-gradient(125deg,#155e47 0%,#1e8f6e 50%,#52c4a0 100%)', padding: '28px 44px 24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#90dfc4', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            ClaimCore &nbsp;/&nbsp; Insurer Portal &nbsp;/&nbsp; Review Claim
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0 }}>Review Claim</h1>
          <p style={{ color: '#b8ecdd', fontSize: '13px', margin: '6px 0 0' }}>Approve or reject the submitted claim after review.</p>
        </div>

        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 28px 48px' }}>

          {/* Back */}
          <div style={{ marginBottom: '20px' }}>
            <Link to="/insurer" className="rc-back"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '13px', fontWeight: '600', textDecoration: 'none', transition: 'all 0.18s' }}>
              <IconBack /> Back to Dashboard
            </Link>
          </div>

          {/* Error / Success banners */}
          {error && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '13px', fontWeight: '500' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ marginBottom: '16px', padding: '12px 16px', background: '#f0faf5', border: '1px solid #86efad', borderRadius: '8px', color: '#15803d', fontSize: '13px', fontWeight: '500' }}>
              {message}
            </div>
          )}

          {/* Main card */}
          <div style={{ background: '#fff', border: '1px solid #d4e8e0', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Card header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #dff0e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7fbf9' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0d2e22', margin: 0 }}>Claim Information</h2>
                <p style={{ fontSize: '12px', color: '#6b9e8c', margin: '2px 0 0' }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{id}</span></p>
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            </div>

            <div style={{ padding: '24px' }}>
              {/* Detail grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '24px', marginBottom: '24px' }}>
                <ReviewItem label="Patient Name" value={claim?.name} />
                <ReviewItem label="Email" value={claim?.email} />
                <ReviewItem label="Claim Amount" value={formatCurrency(claim?.claimAmount)} />
                <ReviewItem label="Approved Amount" value={formatCurrency(claim?.approvedAmount)} />
                <ReviewItem label="Submitted Date" value={formatDate(claim?.submittedAt)} />
                <ReviewItem label="Current Status" value={
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </span>
                } />
              </div>

              <div style={{ borderTop: '1px solid #dff0e8', margin: '0 0 24px' }} />

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Description</p>
                <p style={{ fontSize: '14px', color: '#0d2e22', whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0 }}>{claim?.description || '-'}</p>
              </div>

              {/* Document */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Supporting Document</p>
                {claim?.documentUrl ? (
                  <a href={claim.documentUrl} target="_blank" rel="noreferrer" className="rc-doc-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '600', color: '#1e8f6e', textDecoration: 'none', padding: '8px 14px', border: '1px solid #b0dfd0', borderRadius: '7px', background: '#f0faf6', transition: 'color 0.18s' }}>
                    <IconDoc /> View Document
                  </a>
                ) : (
                  <p style={{ fontSize: '14px', color: '#8ab4a4', fontStyle: 'italic', margin: 0 }}>No document uploaded.</p>
                )}
              </div>

              <div style={{ borderTop: '1px solid #dff0e8', margin: '0 0 24px' }} />

              {/* Review inputs */}
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#0d2e22', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '11px', color: '#3d7a62' }}>
                Review Decision
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label htmlFor="approvedAmount" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    Approved Amount (₹)
                  </label>
                  <input id="approvedAmount" type="number" min="0" step="0.01"
                    value={approvedAmount} onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="0.00" className="rc-input"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #c0ddd4', fontSize: '14px', color: '#0d2e22', background: '#fafcfb', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label htmlFor="comments" style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                    Insurer Comments
                  </label>
                  <textarea id="comments" rows="4"
                    value={comments} onChange={(e) => setComments(e.target.value)}
                    placeholder="Enter your review comments…" className="rc-textarea"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '7px', border: '1px solid #c0ddd4', fontSize: '14px', color: '#0d2e22', background: '#fafcfb', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button type="button" disabled={saving} onClick={() => submitReview('Approved')} className="rc-approve"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.18s', opacity: saving ? 0.65 : 1 }}>
                  <IconCheck /> {saving ? 'Saving…' : 'Approve Claim'}
                </button>
                <button type="button" disabled={saving} onClick={() => submitReview('Rejected')} className="rc-reject"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.18s', opacity: saving ? 0.65 : 1 }}>
                  <IconX /> {saving ? 'Saving…' : 'Reject Claim'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ReviewClaim
