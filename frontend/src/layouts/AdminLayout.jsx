import { NavLink, Outlet } from 'react-router-dom'

function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="brand-container grid gap-6 py-8 lg:grid-cols-[250px_1fr]">
        <aside className="card h-fit p-4">
          <h2 className="mb-4 text-lg font-bold text-brandBlue">Admin Panel</h2>
          <nav className="space-y-2">
            <NavLink to="/admin" end className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-brandLight">
              Dashboard
            </NavLink>
            <NavLink to="/admin/categories" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-brandLight">
              Manage Categories
            </NavLink>
            <NavLink to="/admin/products" className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-brandLight">
              Manage Products
            </NavLink>
          </nav>
        </aside>

        <section>
          <Outlet />
        </section>
      </div>
    </div>
  )
}

export default AdminLayout
