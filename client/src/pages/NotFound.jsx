import { Link } from 'react-router-dom'

const IconShield = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#b0dfd0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
    <line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="15" r="0.8" fill="#b0dfd0" />
  </svg>
)

const NotFound = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .nf-btn:hover { background:#17755a!important; box-shadow:0 4px 16px rgba(21,95,71,0.3)!important; }
      `}</style>

      <div style={{
        fontFamily: "'Inter','Segoe UI',sans-serif",
        minHeight: '100vh',
        background: 'linear-gradient(160deg,#f0faf6 0%,#e8f5f2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
      }}>
        <div style={{
          background: '#fff',
          border: '1px solid #d4e8e0',
          borderRadius: '18px',
          padding: '56px 48px',
          textAlign: 'center',
          maxWidth: '420px',
          width: '100%',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>
          {/* Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0faf6', border: '1.5px solid #b0dfd0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconShield />
            </div>
          </div>

          {/* 404 */}
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#3d7a62', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 10px' }}>
            ClaimCore &nbsp;·&nbsp; Error
          </p>
          <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#0d2e22', margin: '0', lineHeight: 1, letterSpacing: '-3px' }}>
            404
          </h1>
          <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a7a5e', margin: '12px 0 8px' }}>
            Page Not Found
          </p>
          <p style={{ fontSize: '13px', color: '#6b9e8c', margin: '0 0 32px', lineHeight: 1.6 }}>
            The page you are looking for doesn't exist or has been moved.
          </p>

          <Link to="/login" className="nf-btn"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px 32px', borderRadius: '9px',
              background: '#1e8f6e', color: '#fff',
              fontSize: '14px', fontWeight: '700',
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(30,143,110,0.2)',
            }}>
            Return to Login
          </Link>
        </div>
      </div>
    </>
  )
}

export default NotFound
