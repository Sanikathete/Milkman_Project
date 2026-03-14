import { Navigate, Route, Routes } from 'react-router-dom'

import AdminLayout from './layouts/AdminLayout'
import ProtectedRoute from './routes/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrdersPage from './pages/OrdersPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import CustomersPage from './pages/CustomersPage'
import StaffPage from './pages/StaffPage'
import RevenuePage from './pages/RevenuePage'
import AnalysisPage from './pages/AnalysisPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/staff" element={<StaffPage />} />
        <Route path="/revenue" element={<RevenuePage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
