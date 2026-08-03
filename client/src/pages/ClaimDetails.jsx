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

/* ─── Icons ─────────────────────────────────────────────────── */
const IconBack = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
)
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
)

/* ─── Detail item ────────────────────────────────────────────── */
const DetailItem = ({ label, value }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
      {label}
    </p>
    <div style={{ fontSize: '14px', color: '#0d2e22', fontWeight: '500' }}>{value ?? '-'}</div>
  </div>
)

/* ─── Component ─────────────────────────────────────────────── */
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
        if (!foundClaim) { setError('Claim not found.'); setClaim(null); return }
        setClaim(foundClaim)
      } catch (e) {
        setError(e?.response?.data?.message || 'Unable to load claim details.')
      } finally { setLoading(false) }
    }
    loadClaim()
  }, [id])

  if (loading) return <Loader label="Loading claim details..." />

  if (error) {
    return (
      <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #d4e8e0', borderRadius: '14px', padding: '32px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ color: '#991b1b', fontSize: '14px', margin: '0 0 16px' }}>{error}</p>
          <button type="button" onClick={() => navigate('/patient')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            <IconBack /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const statusMeta = getStatusMeta(claim?.status)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .cd-back-btn:hover  { background:#f0faf6!important; border-color:#2aa882!important; }
        .cd-edit-btn:hover  { background:#17755a!important; }
        .cd-doc-link:hover  { color:#1a7a5e!important; }
      `}</style>

      <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: '#f5f7f6', minHeight: '100vh' }}>

        {/* Page header */}
        <div style={{ background: 'linear-gradient(125deg,#155e47 0%,#1e8f6e 50%,#52c4a0 100%)', padding: '28px 44px 24px' }}>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#90dfc4', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 8px' }}>
            ClaimCore &nbsp;/&nbsp; Patient Portal &nbsp;/&nbsp; Claim Details
          </p>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#fff', margin: 0 }}>Claim Details</h1>
          <p style={{ color: '#b8ecdd', fontSize: '13px', margin: '6px 0 0' }}>Review the submitted claim information below.</p>
        </div>

        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 28px 48px' }}>

          {/* Action bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <button type="button" onClick={() => navigate('/patient')} className="cd-back-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: '1px solid #b0dfd0', background: '#fff', color: '#1a7a5e', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.18s' }}>
              <IconBack /> Back to Dashboard
            </button>

            {claim?.status === 'Pending' && (
              <button type="button" onClick={() => navigate(`/patient/claims/${id}/edit`)} className="cd-edit-btn"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '7px', border: 'none', background: '#1e8f6e', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.18s' }}>
                <IconEdit /> Edit Claim
              </button>
            )}
          </div>

          {/* Main card */}
          <div style={{ background: '#fff', border: '1px solid #d4e8e0', borderRadius: '14px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>

            {/* Card title bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #dff0e8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f7fbf9' }}>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#0d2e22', margin: 0 }}>Claim Information</h2>
                <p style={{ fontSize: '12px', color: '#6b9e8c', margin: '2px 0 0' }}>ID: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{id}</span></p>
              </div>
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.tone}`}>
                {statusMeta.label}
              </span>
            </div>

            {/* Detail grid */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '24px', marginBottom: '24px' }}>
                <DetailItem label="Patient Name" value={claim?.name} />
                <DetailItem label="Email" value={claim?.email} />
                <DetailItem label="Claim Amount" value={formatCurrency(claim?.claimAmount)} />
                <DetailItem label="Approved Amount" value={formatCurrency(claim?.approvedAmount)} />
                <DetailItem label="Submitted Date" value={formatDate(claim?.submittedAt)} />
                <DetailItem label="Status" value={
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </span>
                } />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #dff0e8', margin: '0 0 24px' }} />

              {/* Description */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Description</p>
                <p style={{ fontSize: '14px', color: '#0d2e22', whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0 }}>
                  {claim?.description || '-'}
                </p>
              </div>

              {/* Insurer Comments */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Insurer Comments</p>
                <p style={{ fontSize: '14px', color: claim?.insurerComments ? '#0d2e22' : '#8ab4a4', whiteSpace: 'pre-line', lineHeight: 1.7, margin: 0, fontStyle: claim?.insurerComments ? 'normal' : 'italic' }}>
                  {claim?.insurerComments || 'No comments provided.'}
                </p>
              </div>

              {/* Document */}
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Supporting Document</p>
                {claim?.documentUrl ? (
                  <a href={claim.documentUrl} target="_blank" rel="noreferrer" className="cd-doc-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: '600', color: '#1e8f6e', textDecoration: 'none', padding: '8px 14px', border: '1px solid #b0dfd0', borderRadius: '7px', background: '#f0faf6', transition: 'color 0.18s' }}>
                    <IconDoc /> View Document
                  </a>
                ) : (
                  <p style={{ fontSize: '14px', color: '#8ab4a4', fontStyle: 'italic', margin: 0 }}>No document uploaded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ClaimDetails
