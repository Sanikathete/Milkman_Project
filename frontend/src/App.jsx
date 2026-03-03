import { Route, Routes } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import SubscriptionFormPage from './pages/SubscriptionFormPage'
import BuyCheckoutPage from './pages/BuyCheckoutPage'
import CartPage from './pages/CartPage'
import PaymentPage from './pages/PaymentPage'
import OrderPaymentPage from './pages/OrderPaymentPage'
import CustomerDashboardPage from './pages/CustomerDashboardPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ManageProductsPage from './pages/ManageProductsPage'
import ManageCategoriesPage from './pages/ManageCategoriesPage'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />

        <Route path="/cart" element={<CartPage />} />

        <Route
          path="/buy/:productId"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CUSTOMER']}>
                <BuyCheckoutPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/subscribe/:productId"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CUSTOMER']}>
                <SubscriptionFormPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/order/:orderId"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CUSTOMER', 'ADMIN']}>
                <OrderPaymentPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/subscription/:subscriptionId"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CUSTOMER', 'ADMIN']}>
                <PaymentPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CUSTOMER']}>
                <CustomerDashboardPage />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['ADMIN']}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<ManageProductsPage />} />
        <Route path="categories" element={<ManageCategoriesPage />} />
      </Route>
    </Routes>
  )
}

export default App
