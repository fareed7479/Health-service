import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getMe } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'

// Customer Pages
import Home from './pages/customer/Home'
import Services from './pages/customer/Services'
import BookingPage from './pages/customer/BookingPage'
import PaymentPage from './pages/customer/PaymentPage'
import CustomerDashboard from './pages/customer/Dashboard'
import Reports from './pages/customer/Reports'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import OTPVerification from './pages/auth/OTPVerification'

// Provider Pages
import ProviderDashboard from './pages/provider/Dashboard'
import ProviderJobs from './pages/provider/Jobs'
import ProviderEarnings from './pages/provider/Earnings'
import UploadReport from './pages/provider/UploadReport'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import ProviderApproval from './pages/admin/ProviderApproval'
import ServiceManagement from './pages/admin/ServiceManagement'
import AdminReports from './pages/admin/Reports'

function App() {
  const dispatch = useDispatch()
  const { token, user, loading } = useSelector(state => state.auth)

  useEffect(() => {
    if (token && !user) {
      dispatch(getMe())
    }
  }, [token, dispatch, user])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OTPVerification />} />

      {/* Customer Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route
        path="/booking/:serviceId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['customer']}>
              <BookingPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['customer']}>
              <PaymentPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['customer']}>
              <Reports />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Provider Routes */}
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/jobs"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <ProviderJobs />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/earnings"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <ProviderEarnings />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/upload-report/:bookingId"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['provider']}>
              <UploadReport />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <UserManagement />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/providers"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <ProviderApproval />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/services"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <ServiceManagement />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['admin']}>
              <AdminReports />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
