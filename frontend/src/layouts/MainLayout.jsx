import { Outlet } from 'react-router-dom'

import CartPopup from '../components/CartPopup'
import Navbar from '../components/Navbar'

function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="brand-container py-8">
        <Outlet />
      </main>
      <CartPopup />
    </div>
  )
}

export default MainLayout
