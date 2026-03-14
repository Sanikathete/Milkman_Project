import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="Ranjan Logo" onError={(event) => { event.currentTarget.style.display = 'none' }} />
          <span>Ranjan</span>
        </div>
        <div>
          {isAuthenticated ? (
            <Link className="button secondary" to="/orders">
              Open Dashboard
            </Link>
          ) : (
            <button type="button" className="button secondary" onClick={() => navigate('/login')}>
              Admin Login
            </button>
          )}
        </div>
      </header>

      <div className="hero">
        <div>
          <p className="notice" style={{ textTransform: 'uppercase', letterSpacing: '0.3em' }}>
            Hello Admin,
          </p>
          <h1>Welcome to Admin Page</h1>
          <p>Get to know your business with us</p>
        </div>
        {!isAuthenticated && (
          <button type="button" className="button" onClick={() => navigate('/login')}>
            Login
          </button>
        )}
      </div>
    </div>
  )
}

export default HomePage
