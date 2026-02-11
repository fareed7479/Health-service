import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../store/api'
import Layout from '../../components/Layout'
import { FiUsers, FiBriefcase, FiDollarSign, FiCheckCircle } from 'react-icons/fi'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats')
      setStats(response.data.stats)
      setRecentBookings(response.data.recentBookings || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Users</p>
                  <p className="text-3xl font-bold text-primary-600">{stats.totalUsers}</p>
                </div>
                <FiUsers className="text-4xl text-primary-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Providers</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalProviders}</p>
                </div>
                <FiBriefcase className="text-4xl text-blue-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Bookings</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalBookings}</p>
                </div>
                <FiCheckCircle className="text-4xl text-green-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                </div>
                <FiBriefcase className="text-4xl text-yellow-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedBookings}</p>
                </div>
                <FiCheckCircle className="text-4xl text-green-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Revenue</p>
                  <p className="text-3xl font-bold text-primary-600">₹{stats.totalRevenue}</p>
                </div>
                <FiDollarSign className="text-4xl text-primary-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/admin/users"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">User Management</h2>
              <p className="text-gray-600">Manage customers and providers</p>
            </Link>
            <Link
              to="/admin/providers"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Provider Approval</h2>
              <p className="text-gray-600">Review and approve provider registrations</p>
            </Link>
            <Link
              to="/admin/services"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Service Management</h2>
              <p className="text-gray-600">Add, edit, and manage services</p>
            </Link>
            <Link
              to="/admin/reports"
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">Reports & Analytics</h2>
              <p className="text-gray-600">View and export booking reports</p>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No recent bookings</p>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-semibold">{booking.service?.name}</h3>
                      <p className="text-sm text-gray-600">
                        Customer: {booking.customer?.name} | Provider:{' '}
                        {booking.provider?.name || 'Not assigned'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          booking.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {booking.status.toUpperCase()}
                      </span>
                      <p className="text-lg font-bold text-primary-600 mt-2">
                        ₹{booking.amount?.finalAmount}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
