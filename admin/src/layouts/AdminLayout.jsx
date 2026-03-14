import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <img src="/logo.png" alt="Ranjan Logo" onError={(event) => { event.currentTarget.style.display = 'none' }} />
          <span>Ranjan</span>
        </div>
        <div>
          <span className="notice">{user?.email || 'Admin'}</span>
          <button type="button" className="button secondary" style={{ marginLeft: '12px' }} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h2>Admin Navigation</h2>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Orders
          </NavLink>
          <NavLink to="/subscriptions" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Subscriptions
          </NavLink>
          <NavLink to="/customers" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Customers
          </NavLink>
          <NavLink to="/staff" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Staff
          </NavLink>
          <NavLink to="/revenue" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Revenue
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Analysis
          </NavLink>
        </aside>
        <section className="content">
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AdminLayout
