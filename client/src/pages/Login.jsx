import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import api from '../services/api'
import { ROLE_HOME_PATH } from '../utils/constants'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  email: '',
  password: '',
}

/* ─── Inline styles ─────────────────────────────────────────── */
const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#b8e4f0',
  },

  /* ── LEFT panel (form) ──────────────────────────────────────── */
  leftPanel: {
    flex: '0 0 45%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(160deg, #ffffff 0%, #f0faff 100%)',
    padding: '48px 56px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '4px 0 40px rgba(0,0,0,0.08)',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '36px',
    alignSelf: 'flex-start',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #1baac8, #0d7ea3)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0d3f52',
    letterSpacing: '-0.5px',
  },

  headingBlock: {
    alignSelf: 'flex-start',
    marginBottom: '32px',
  },
  heading: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#0d3f52',
    margin: 0,
    lineHeight: 1.2,
  },
  subheading: {
    fontSize: '14px',
    color: '#5b8fa8',
    marginTop: '8px',
    fontWeight: '400',
  },

  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2d6b87',
    letterSpacing: '0.02em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#8ab4c7',
    pointerEvents: 'none',
    display: 'flex',
  },
  input: {
    width: '100%',
    padding: '12px 14px 12px 42px',
    border: '1.5px solid #c8e6f0',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#0d3f52',
    background: '#f5fbff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  },

  errorBox: {
    padding: '12px 16px',
    background: '#fff0f0',
    border: '1px solid #fccfcf',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#c0392b',
  },

  submitBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #1baac8, #0d7ea3)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 0.2s, transform 0.15s',
    marginTop: '4px',
  },

  signupRow: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#5b8fa8',
    marginTop: '4px',
  },
  signupBtn: {
    background: 'none',
    border: 'none',
    color: '#1baac8',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '0 2px',
    fontSize: '13px',
    textDecoration: 'underline',
    textDecorationColor: 'transparent',
    transition: 'text-decoration-color 0.2s',
  },

  /* ── RIGHT panel (illustration) ─────────────────────────────── */
  rightPanel: {
    flex: 1,
    background: 'linear-gradient(180deg, #a8dff0 0%, #c2edf8 60%, #9dd5ec 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  tagline: {
    position: 'absolute',
    top: '40px',
    left: '0',
    right: '0',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#0a5470',
    letterSpacing: '-0.3px',
    padding: '0 24px',
  },
  taglineSub: {
    fontSize: '13px',
    color: '#2d8cb0',
    fontWeight: '400',
    marginTop: '6px',
    display: 'block',
  },

  /* wooden circle grid */
  circleGrid: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
  },
  circleRow: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
  },
  circle: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #e8c99a, #d4a96a)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.25s, box-shadow 0.25s',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  },
  circleLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#1baac8',
    marginTop: '5px',
    letterSpacing: '0.04em',
  },

  /* hand / placed circle highlight */
  topCircle: {
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'linear-gradient(145deg, #f0d5a8, #d4a96a)',
    boxShadow: '0 12px 32px rgba(0,0,0,0.22), inset 0 2px 4px rgba(255,255,255,0.35)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'floatDown 3s ease-in-out infinite',
    cursor: 'default',
    position: 'relative',
  },

  bottomNote: {
    position: 'absolute',
    bottom: '32px',
    fontSize: '12px',
    color: '#2d8cb0',
    opacity: 0.8,
    textAlign: 'center',
    padding: '0 20px',
  },

  /* floating orbs */
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
  },
}

/* ─── SVG Icons ────────────────────────────────────────────── */
const IconShieldCheck = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill={color} fillOpacity="0.15" />
    <path d="M9 12l2 2 4-4" />
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
)

const IconFamily = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="9" cy="5" r="2" />
    <circle cx="15" cy="5" r="1.5" />
    <rect x="7" y="8" width="4" height="6" rx="1" />
    <rect x="13" y="8" width="3" height="5" rx="1" />
    <rect x="6.5" y="14" width="5" height="5" rx="1" />
    <rect x="11.5" y="13.5" width="5" height="5.5" rx="1" />
    <circle cx="12" cy="11" r="1" opacity="0.4" />
  </svg>
)

const IconHeartRate = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} fillOpacity="0.15" />
    <polyline points="8 12 10.5 9 13 13.5 15 11 16 12" />
  </svg>
)

const IconBandage = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="16" height="6" rx="3" fill={color} fillOpacity="0.15" />
    <rect x="4" y="9" width="16" height="6" rx="3" />
    <line x1="12" y1="9" x2="12" y2="15" />
    <line x1="9" y1="12" x2="15" y2="12" />
    <circle cx="9.5" cy="12" r="0.8" fill={color} />
    <circle cx="14.5" cy="12" r="0.8" fill={color} />
  </svg>
)

const IconMedicalKit = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="8" width="18" height="13" rx="2" fill={color} fillOpacity="0.15" />
    <rect x="3" y="8" width="18" height="13" rx="2" />
    <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <line x1="12" y1="12" x2="12" y2="17" />
    <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
  </svg>
)

const IconCar = ({ size = 38, color = '#1baac8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3v-5l2.5-6h11L19 12v5h-2" fill={color} fillOpacity="0.1" />
    <path d="M5 17H3v-5l2.5-6h11L19 12v5h-2" />
    <circle cx="7.5" cy="17" r="2" />
    <circle cx="16.5" cy="17" r="2" />
    <line x1="3" y1="12" x2="19" y2="12" />
    <line x1="7" y1="8" x2="17" y2="8" />
  </svg>
)

const IconLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
)

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

/* ─── Circle Token ─────────────────────────────────────────── */
const WoodCircle = ({ Icon, label, style = {}, isTop = false }) => {
  const base = isTop ? styles.topCircle : styles.circle
  return (
    <div
      style={{ ...base, ...style }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px) scale(1.05)'
        e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.24), inset 0 2px 4px rgba(255,255,255,0.35)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = base.boxShadow
      }}
    >
      <Icon size={36} color="#1baac8" />
      {label && <span style={styles.circleLabel}>{label}</span>}
    </div>
  )
}

/* ─── Component ────────────────────────────────────────────── */
const Login = () => {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inputFocus, setInputFocus] = useState({})

  const navigate = useNavigate()
  const { login, isAuthenticated, role } = useAuth()

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(ROLE_HOME_PATH[role] || '/patient', { replace: true })
    }
  }, [isAuthenticated, navigate, role])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const validate = () => {
    if (!form.email.trim() || !form.password.trim()) {
      return 'Email and password are required.'
    }
    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    try {
      setLoading(true)
      const response = await api.post('/auth/login', form)
      const payload = response.data?.data
      login({ token: payload?.token, role: payload?.user?.role, user: payload?.user })
      const destination = ROLE_HOME_PATH[payload?.user?.role] || '/patient'
      navigate(destination, { replace: true })
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to sign in. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const focusStyle = (field) =>
    inputFocus[field]
      ? { borderColor: '#1baac8', boxShadow: '0 0 0 3px rgba(27,170,200,0.15)', background: '#fff' }
      : {}

  return (
    <>
      {/* keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes floatDown {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(10px); }
        }
        @keyframes pulse-orb {
          0%,100% { transform: scale(1); opacity:0.18; }
          50%      { transform: scale(1.15); opacity:0.28; }
        }
        .cc-login-input:focus {
          border-color: #1baac8 !important;
          box-shadow: 0 0 0 3px rgba(27,170,200,0.15) !important;
          background: #fff !important;
          outline: none;
        }
        .cc-submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(27,170,200,0.35);
        }
        .cc-submit-btn:active:not(:disabled) { transform: translateY(0); }
        .cc-signup-link:hover { text-decoration-color: #1baac8 !important; }
        @media (max-width: 768px) {
          .cc-right-panel { display: none !important; }
          .cc-left-panel  { flex: 1 !important; padding: 32px 24px !important; }
        }
      `}</style>

      <div style={styles.page}>

        {/* ── LEFT: Form ── */}
        <div style={styles.leftPanel} className="cc-left-panel">

          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}><IconLogo /></div>
            <span style={styles.logoText}>ClaimCore</span>
          </div>

          {/* Heading */}
          <div style={styles.headingBlock}>
            <h1 style={styles.heading}>Welcome back 👋</h1>
            <p style={styles.subheading}>Sign in to access the ClaimCore platform.</p>
          </div>

          {/* Error */}
          {error && <div style={{ ...styles.errorBox, marginBottom: '8px', width: '100%' }}>{error}</div>}

          {/* Form */}
          <form style={styles.form} onSubmit={handleSubmit} noValidate>

            <div style={styles.fieldGroup}>
              <label htmlFor="email" style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}><IconEmail /></span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setInputFocus(f => ({ ...f, email: true }))}
                  onBlur={() => setInputFocus(f => ({ ...f, email: false }))}
                  style={{ ...styles.input, ...focusStyle('email') }}
                  className="cc-login-input"
                  placeholder="user@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div style={styles.fieldGroup}>
              <label htmlFor="password" style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}><IconLock /></span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setInputFocus(f => ({ ...f, password: true }))}
                  onBlur={() => setInputFocus(f => ({ ...f, password: false }))}
                  style={{ ...styles.input, ...focusStyle('password') }}
                  className="cc-login-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={styles.submitBtn}
              className="cc-submit-btn"
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p style={styles.signupRow}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              style={{ ...styles.signupBtn, textDecorationColor: 'transparent' }}
              className="cc-signup-link"
            >
              Sign up
            </button>
          </p>
        </div>

        {/* ── RIGHT: Illustration ── */}
        <div style={styles.rightPanel} className="cc-right-panel">

          {/* decorative orbs */}
          <div style={{ ...styles.orb, width: 200, height: 200, top: -60, left: -60, animation: 'pulse-orb 6s ease-in-out infinite' }} />
          <div style={{ ...styles.orb, width: 140, height: 140, bottom: 40, right: -40, animation: 'pulse-orb 8s ease-in-out infinite 2s' }} />
          <div style={{ ...styles.orb, width: 80, height: 80, top: '40%', left: '10%', animation: 'pulse-orb 5s ease-in-out infinite 1s' }} />

          {/* tagline */}
          <div style={styles.tagline}>
            Your Claims. Simplified.
            <span style={styles.taglineSub}>Comprehensive coverage for life's every moment.</span>
          </div>

          {/* wooden circles — mirroring the reference image layout */}
          <div style={styles.circleGrid}>

            {/* Top — floating / "being placed" circle */}
            <div style={{ ...styles.circleRow, marginBottom: '-8px' }}>
              <WoodCircle
                Icon={IconShieldCheck}
                label="PROTECTION"
                isTop
              />
            </div>

            {/* Middle row */}
            <div style={styles.circleRow}>
              <WoodCircle Icon={IconFamily}    label="FAMILY" />
              <WoodCircle Icon={IconHeartRate} label="HEALTH" />
            </div>

            {/* Bottom row */}
            <div style={styles.circleRow}>
              <WoodCircle Icon={IconBandage}    label="WELLNESS" />
              <WoodCircle Icon={IconMedicalKit} label="MEDICAL" />
              <WoodCircle Icon={IconCar}        label="AUTO" />
            </div>
          </div>

          <p style={styles.bottomNote}>
            Trusted by thousands · Fast claim processing · 24/7 support
          </p>
        </div>

      </div>
    </>
  )
}

export default Login
