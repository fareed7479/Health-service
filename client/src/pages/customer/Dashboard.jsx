import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getMyBookings } from '../../store/slices/bookingSlice'
import api from '../../store/api'
import Layout from '../../components/Layout'
import { FiCalendar, FiMapPin, FiClock, FiDollarSign } from 'react-icons/fi'

const CustomerDashboard = () => {
  const dispatch = useDispatch()
  const { bookings } = useSelector((state) => state.booking)
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    dispatch(getMyBookings())
    fetchAddresses()
  }, [dispatch])

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customer/addresses')
      setAddresses(response.data.addresses)
    } catch (error) {
      console.error('Failed to fetch addresses:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      provider_arriving: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold text-primary-600">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 mb-2">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {bookings.filter((b) => b.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-gray-600 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter((b) => b.status === 'completed').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">My Addresses</h2>
              <Link
                to="/customer/addresses"
                className="text-primary-600 hover:text-primary-700"
              >
                Manage Addresses
              </Link>
            </div>
            <div className="space-y-2">
              {addresses.slice(0, 3).map((addr) => (
                <div key={addr._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{addr.label}:</span>
                    <span className="ml-2 text-gray-600">
                      {addr.addressLine1}, {addr.city}
                    </span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No bookings yet</p>
              ) : (
                bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.service?.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{booking.amount?.finalAmount}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2" />
                        {booking.scheduledTime}
                      </div>
                      <div className="flex items-center">
                        <FiMapPin className="mr-2" />
                        {booking.address?.city}
                      </div>
                      {booking.provider && (
                        <div className="flex items-center">
                          <span>Provider: {booking.provider.name}</span>
                        </div>
                      )}
                    </div>
                    {booking.reports && booking.reports.length > 0 && (
                      <div className="mt-4">
                        <Link
                          to={`/customer/reports/${booking._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View Reports ({booking.reports.length})
                        </Link>
                      </div>
                    )}
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

export default CustomerDashboard
