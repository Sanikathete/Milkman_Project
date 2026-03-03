import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { cartCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="brand-container flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight text-brandBlue">
          Rajan Dairy
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/" className="text-sm font-medium text-slate-700 hover:text-brandBlue">
            Home
          </NavLink>

          <NavLink to="/cart" className="text-sm font-medium text-slate-700 hover:text-brandBlue">
            Cart ({cartCount})
          </NavLink>

          {isAuthenticated && user?.role === 'CUSTOMER' && (
            <>
              <NavLink to="/dashboard" className="text-sm font-medium text-slate-700 hover:text-brandBlue">
                Dashboard
              </NavLink>
            </>
          )}

          {isAuthenticated && user?.role === 'ADMIN' && (
            <NavLink to="/admin" className="text-sm font-medium text-slate-700 hover:text-brandBlue">
              Admin
            </NavLink>
          )}

          {!isAuthenticated && (
            <>
              <NavLink to="/login" className="text-sm font-medium text-slate-700 hover:text-brandBlue">
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-brandBlue px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Register
              </NavLink>
            </>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-brandRed px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
