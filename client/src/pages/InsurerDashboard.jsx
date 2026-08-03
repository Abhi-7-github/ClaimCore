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

const initialFilters = { status: '', minAmount: '', maxAmount: '', search: '' }

/* ─── SVG Icons ────────────────────────────────────────────── */
const IconTotal = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
)
const IconPending = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconApproved = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconRejected = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)
const IconFilter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
const IconReset = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-3.51" />
  </svg>
)
const IconArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
)

/* ─── Hex background ───────────────────────────────────────── */
const HexPattern = () => (
  <svg style={{ position: 'absolute', right: 0, top: 0, height: '100%', opacity: 0.12, pointerEvents: 'none' }}
    width="480" height="200" viewBox="0 0 480 200" fill="none" preserveAspectRatio="xMaxYMid meet">
    {[60,160,260,360,460].map((x, i) => (
      <polygon key={`r1-${i}`} points={`${x},4 ${x+44},26 ${x+44},72 ${x},94 ${x-44},72 ${x-44},26`} stroke="white" strokeWidth="1.5" fill="none" />
    ))}
    {[110,210,310,410].map((x, i) => (
      <polygon key={`r2-${i}`} points={`${x},94 ${x+44},116 ${x+44},162 ${x},184 ${x-44},162 ${x-44},116`} stroke="white" strokeWidth="1.5" fill="none" />
    ))}
  </svg>
)

/* ─── Medical scatter icons (left side of banner) ─────────── */
const MedicalIcons = () => (
  <svg style={{ position: 'absolute', left: 0, top: 0, height: '100%', opacity: 0.18, pointerEvents: 'none' }}
    width="340" height="200" viewBox="0 0 340 200" fill="none">
    {/* Medical Kit */}
    <g transform="translate(28,14) rotate(-12)">
      <rect x="0" y="9" width="46" height="34" rx="5" stroke="white" strokeWidth="1.8" fill="none" />
      <rect x="14" y="0" width="18" height="12" rx="3" stroke="white" strokeWidth="1.8" fill="none" />
      <line x1="23" y1="16" x2="23" y2="32" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15" y1="24" x2="31" y2="24" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    {/* Capsule */}
    <g transform="translate(130,54) rotate(-28)">
      <rect x="0" y="0" width="56" height="22" rx="11" stroke="white" strokeWidth="1.8" fill="none" />
      <line x1="28" y1="0" x2="28" y2="22" stroke="white" strokeWidth="1.4" />
    </g>
    {/* Heart rate */}
    <g transform="translate(16,96)">
      <rect x="0" y="0" width="50" height="44" rx="7" stroke="white" strokeWidth="1.8" fill="none" />
      <polyline points="4,24 12,24 18,8 24,40 30,16 36,24 46,24" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    {/* Bandage */}
    <g transform="translate(36,152) rotate(18)">
      <rect x="0" y="0" width="64" height="24" rx="12" stroke="white" strokeWidth="1.8" fill="none" />
      <line x1="28" y1="0" x2="28" y2="24" stroke="white" strokeWidth="1.2" />
      <line x1="36" y1="0" x2="36" y2="24" stroke="white" strokeWidth="1.2" />
      <line x1="32" y1="8" x2="32" y2="16" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="28" y1="12" x2="36" y2="12" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </g>
    {/* Thermometer */}
    <g transform="translate(188,108) rotate(-18)">
      <rect x="8" y="0" width="12" height="52" rx="6" stroke="white" strokeWidth="1.8" fill="none" />
      <circle cx="14" cy="58" r="10" stroke="white" strokeWidth="1.8" fill="none" />
    </g>
    {/* Syringe */}
    <g transform="translate(218,10) rotate(28)">
      <rect x="0" y="14" width="48" height="9" rx="4" stroke="white" strokeWidth="1.8" fill="none" />
      <rect x="48" y="16" width="9" height="5" rx="2" stroke="white" strokeWidth="1.4" fill="none" />
      <rect x="-6" y="15" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.4" fill="none" />
      <line x1="12" y1="14" x2="12" y2="23" stroke="white" strokeWidth="1.2" />
      <line x1="24" y1="14" x2="24" y2="23" stroke="white" strokeWidth="1.2" />
    </g>
    {/* Small cross */}
    <g transform="translate(90,150)">
      <line x1="9" y1="0" x2="9" y2="18" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="0" y1="9" x2="18" y2="9" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    </g>
    <g transform="translate(278,46)">
      <line x1="7" y1="0" x2="7" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="7" x2="14" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </g>
    {/* Heart outline */}
    <g transform="translate(270,140)">
      <path d="M18 28 C18 28 2 18 2 9 C2 4.6 5.6 2 10 3.6 C12 4.4 14 6 18 8 C22 6 24 4.4 26 3.6 C30.4 2 34 4.6 34 9 C34 18 18 28 18 28Z" stroke="white" strokeWidth="1.8" fill="none" />
    </g>
    {/* ECG line */}
    <polyline transform="translate(14,188)" points="0,6 10,6 15,0 21,12 27,2 33,6 44,6" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ─── Stat Card ────────────────────────────────────────────── */
const CARD_CONFIG = [
  { Icon: IconTotal,    bg: '#f0faf6', border: '#b0dfd0', iconBg: '#d0f4e6', iconColor: '#1a7a5e', label: 'Total Claims',   valueColor: '#0d3f30' },
  { Icon: IconPending,  bg: '#fefbf0', border: '#e8d88a', iconBg: '#fdf3c0', iconColor: '#906800', label: 'Pending',        valueColor: '#6b4e00' },
  { Icon: IconApproved, bg: '#f0faf3', border: '#94d9aa', iconBg: '#c8f0d2', iconColor: '#1a6b3a', label: 'Approved',       valueColor: '#0d4020' },
  { Icon: IconRejected, bg: '#fef2f2', border: '#f0b0b0', iconBg: '#fcd8d8', iconColor: '#a83232', label: 'Rejected',       valueColor: '#7a1a1a' },
]

const StatCard = ({ config, value }) => (
  <div style={{
    background: config.bg,
    border: `1px solid ${config.border}`,
    borderRadius: '12px',
    padding: '20px 22px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  }}>
    <div style={{
      width: '38px', height: '38px', borderRadius: '9px',
      background: config.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: config.iconColor,
    }}>
      <config.Icon />
    </div>
    <div>
      <p style={{ fontSize: '12px', fontWeight: '600', color: config.iconColor, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
        {config.label}
      </p>
      <p style={{ fontSize: '30px', fontWeight: '800', color: config.valueColor, margin: '4px 0 0', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  </div>
)

/* ─── Component ────────────────────────────────────────────── */
const InsurerDashboard = () => {
  const [filters, setFilters] = useState(initialFilters)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState(null)

  const fetchClaims = async (activeFilters = filters) => {
    try {
      setLoading(true)
      const params = { limit: 100 }
      Object.entries(activeFilters).forEach(([k, v]) => { if (v !== '') params[k] = v })
      const response = await api.get('/claims', { params })
      setClaims(safeArray(response.data?.data?.items))
      setPagination(response.data?.data?.pagination || null)
    } catch (e) {
      setError(e?.response?.data?.message || 'Unable to load claims.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true)
        const params = { limit: 100 }
        const response = await api.get('/claims', { params })
        setClaims(safeArray(response.data?.data?.items))
        setPagination(response.data?.data?.pagination || null)
      } catch (e) {
        setError(e?.response?.data?.message || 'Unable to load claims.')
      } finally { setLoading(false) }
    })()
  }, [])

  const summary = useMemo(() => {
    const total    = pagination?.total ?? claims.length
    const pending  = claims.filter((c) => c.status === 'Pending').length
    const approved = claims.filter((c) => c.status === 'Approved').length
    const rejected = claims.filter((c) => c.status === 'Rejected').length
    return [total, pending, approved, rejected]
  }, [claims, pagination?.total])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((f) => ({ ...f, [name]: value }))
  }
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSubmitting(true)
    await fetchClaims(filters); setSubmitting(false)
  }
  const handleReset = async () => {
    setFilters(initialFilters); setError(''); await fetchClaims(initialFilters)
  }

  if (loading) return <Loader label="Loading claims..." />

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .ins-input:focus, .ins-select:focus { border-color:#2aa882!important; box-shadow:0 0 0 3px rgba(42,168,130,0.12)!important; outline:none; }
        .ins-row:hover td { background:#f2faf6!important; }
        .ins-view-btn:hover { background:#1e8f6e!important; color:#fff!important; border-color:#1e8f6e!important; }
        .ins-apply-btn:hover { background:#17755a!important; }
        .ins-reset-btn:hover { background:#f0faf6!important; border-color:#2aa882!important; }
        .ins-filter-toggle:hover { background:#17755a!important; }
      `}</style>

      <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:'#f5f7f6', minHeight:'100vh' }}>

        {/* ── Banner ── */}
        <div style={{ position:'relative', overflow:'hidden', background:'linear-gradient(125deg,#155e47 0%,#1e8f6e 50%,#52c4a0 100%)', padding:'36px 44px 32px' }}>
          <HexPattern />
          <MedicalIcons />
          <div style={{ position:'relative', zIndex:2 }}>
            <p style={{ fontSize:'11px', fontWeight:'600', color:'#90dfc4', letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 10px' }}>
              ClaimCore &nbsp;/&nbsp; Insurer Portal
            </p>
            <h1 style={{ fontSize:'30px', fontWeight:'800', color:'#ffffff', margin:0, lineHeight:1.2 }}>
              Insurer Dashboard
            </h1>
            <p style={{ color:'#b8ecdd', fontSize:'13px', margin:'8px 0 0', fontWeight:'400' }}>
              Review incoming claims, apply filters, and take action.
            </p>
          </div>
        </div>

        <div style={{ maxWidth:'1280px', margin:'0 auto', padding:'28px 28px 48px' }}>

          {error && (
            <div style={{ marginBottom:'20px', padding:'12px 16px', background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:'8px', color:'#991b1b', fontSize:'13px', fontWeight:'500' }}>
              {error}
            </div>
          )}

          {/* Stat cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'14px', marginBottom:'24px' }}>
            {CARD_CONFIG.map((cfg, i) => <StatCard key={cfg.label} config={cfg} value={summary[i]} />)}
          </div>

          {/* Table card */}
          <div style={{ background:'#fff', borderRadius:'14px', border:'1px solid #d4e8e0', boxShadow:'0 1px 8px rgba(0,0,0,0.06)', overflow:'hidden' }}>

            {/* Card header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 22px', borderBottom:'1px solid #dff0e8', background:'#fff' }}>
              <div>
                <h2 style={{ fontSize:'15px', fontWeight:'700', color:'#0d2e22', margin:0 }}>All Claims</h2>
                <p style={{ fontSize:'12px', color:'#6b9e8c', margin:'2px 0 0', fontWeight:'400' }}>
                  {claims.length} {claims.length === 1 ? 'record' : 'records'} loaded
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className="ins-filter-toggle"
                style={{
                  display:'inline-flex', alignItems:'center', gap:'7px',
                  padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:'600',
                  background: showFilters ? '#1e8f6e' : '#1e8f6e',
                  color:'#fff', border:'none', cursor:'pointer', transition:'background 0.2s',
                }}
              >
                <IconFilter />
                {showFilters ? 'Hide Filters' : 'Filter Claims'}
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <form onSubmit={handleSubmit} style={{ padding:'20px 22px', borderBottom:'1px solid #dff0e8', background:'#fafcfb' }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'14px' }}>
                  {[
                    { id:'status',    label:'Status',          type:'select' },
                    { id:'minAmount', label:'Min Amount (₹)',  type:'number', placeholder:'0' },
                    { id:'maxAmount', label:'Max Amount (₹)',  type:'number', placeholder:'100000' },
                    { id:'search',    label:'Search by Name',  type:'text',   placeholder:'Patient name' },
                  ].map((f) => (
                    <div key={f.id}>
                      <label htmlFor={f.id} style={{ display:'block', fontSize:'11px', fontWeight:'700', color:'#3d7a62', marginBottom:'5px', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                        {f.label}
                      </label>
                      {f.type === 'select' ? (
                        <select id={f.id} name={f.id} value={filters[f.id]} onChange={handleFilterChange} className="ins-select"
                          style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1px solid #c0ddd4', fontSize:'13px', color:'#0d2e22', background:'#fff', boxSizing:'border-box' }}>
                          <option value="">All</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      ) : (
                        <input id={f.id} name={f.id} type={f.type} value={filters[f.id]} onChange={handleFilterChange}
                          placeholder={f.placeholder} className="ins-input"
                          style={{ width:'100%', padding:'9px 12px', borderRadius:'7px', border:'1px solid #c0ddd4', fontSize:'13px', color:'#0d2e22', background:'#fff', boxSizing:'border-box' }}
                          min={f.type==='number'?'0':undefined} step={f.type==='number'?'0.01':undefined} />
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:'16px', display:'flex', gap:'10px', alignItems:'center' }}>
                  <button type="submit" disabled={submitting} className="ins-apply-btn"
                    style={{ padding:'9px 20px', background:'#1e8f6e', color:'#fff', border:'none', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'background 0.2s' }}>
                    {submitting ? 'Applying…' : 'Apply Filters'}
                  </button>
                  <button type="button" onClick={handleReset} className="ins-reset-btn"
                    style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 18px', background:'#fff', color:'#2d7a5e', border:'1px solid #c0ddd4', borderRadius:'7px', fontSize:'13px', fontWeight:'600', cursor:'pointer', transition:'all 0.2s' }}>
                    <IconReset /> Reset
                  </button>
                </div>
              </form>
            )}

            {/* Table */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                <thead>
                  <tr style={{ background:'#f7fbf9', borderBottom:'1px solid #dff0e8' }}>
                    {['Patient','Email','Amount','Status','Date','Action'].map((h) => (
                      <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontWeight:'700', color:'#3d7a62', fontSize:'11px', letterSpacing:'0.07em', textTransform:'uppercase' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding:'56px', textAlign:'center', color:'#8ab4a4', fontSize:'14px', fontWeight:'500' }}>
                        {TABLE_EMPTY_MESSAGE}
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => {
                      const statusMeta = getStatusMeta(claim.status)
                      return (
                        <tr key={getClaimId(claim)} className="ins-row" style={{ borderBottom:'1px solid #edf5f1' }}>
                          <td style={{ padding:'13px 18px', fontWeight:'600', color:'#0d2e22' }}>{getClaimPatient(claim)}</td>
                          <td style={{ padding:'13px 18px', color:'#4e7a68' }}>{getClaimEmail(claim)}</td>
                          <td style={{ padding:'13px 18px', color:'#0d2e22', fontWeight:'500' }}>{formatCurrency(claim.claimAmount)}</td>
                          <td style={{ padding:'13px 18px' }}>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusMeta.tone}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td style={{ padding:'13px 18px', color:'#4e7a68' }}>{formatDate(claim.submittedAt)}</td>
                          <td style={{ padding:'13px 18px' }}>
                            <Link to={`/insurer/claims/${getClaimId(claim)}`} className="ins-view-btn"
                              style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'6px 14px', borderRadius:'6px', border:'1px solid #b0dfd0', fontSize:'12px', fontWeight:'600', color:'#1a7a5e', textDecoration:'none', background:'transparent', transition:'all 0.18s' }}>
                              View <IconArrowRight />
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
      </div>
    </>
  )
}

export default InsurerDashboard
