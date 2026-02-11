import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../store/api'
import Layout from '../../components/Layout'
import { FiBriefcase, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi'

const ProviderDashboard = () => {
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    completedJobs: 0,
    earnings: { total: 0, pending: 0, paid: 0 },
  })
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, earningsRes] = await Promise.all([
        api.get('/provider/jobs'),
        api.get('/provider/earnings'),
      ])

      const allJobs = jobsRes.data.jobs
      setJobs(allJobs.slice(0, 5))
      setStats({
        totalJobs: allJobs.length,
        pendingJobs: allJobs.filter((j) => j.status === 'pending').length,
        completedJobs: allJobs.filter((j) => j.status === 'completed').length,
        earnings: earningsRes.data.earnings,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      provider_arriving: 'bg-purple-100 text-purple-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
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
          <h1 className="text-3xl font-bold mb-8">Provider Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-primary-600">{stats.totalJobs}</p>
                </div>
                <FiBriefcase className="text-4xl text-primary-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingJobs}</p>
                </div>
                <FiClock className="text-4xl text-yellow-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedJobs}</p>
                </div>
                <FiCheckCircle className="text-4xl text-green-300" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary-600">₹{stats.earnings.total}</p>
                </div>
                <FiDollarSign className="text-4xl text-primary-300" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Earnings Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold">₹{stats.earnings.total}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold">₹{stats.earnings.pending}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600 mb-1">Paid</p>
                <p className="text-2xl font-bold">₹{stats.earnings.paid}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Jobs</h2>
              <Link
                to="/provider/jobs"
                className="text-primary-600 hover:text-primary-700"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {jobs.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No jobs yet</p>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{job.service?.name}</h3>
                        <p className="text-sm text-gray-600">Customer: {job.customer?.name}</p>
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-primary-600">
                        ₹{job.amount?.finalAmount}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        {new Date(job.scheduledDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Time:</span> {job.scheduledTime}
                      </div>
                    </div>
                    {job.address && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Location:</span>{' '}
                        {job.address.addressLine1}, {job.address.city}
                      </div>
                    )}
                    <div className="mt-4 flex space-x-2">
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await api.patch(`/provider/jobs/${job._id}/accept-reject`, {
                                  action: 'accept',
                                })
                                fetchDashboardData()
                              } catch (error) {
                                console.error('Failed to accept job:', error)
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.patch(`/provider/jobs/${job._id}/accept-reject`, {
                                  action: 'reject',
                                })
                                fetchDashboardData()
                              } catch (error) {
                                console.error('Failed to reject job:', error)
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {job.status === 'accepted' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(`/provider/jobs/${job._id}/status`, {
                                status: 'provider_arriving',
                              })
                              fetchDashboardData()
                            } catch (error) {
                              console.error('Failed to update status:', error)
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Mark as Arriving
                        </button>
                      )}
                      {job.status === 'provider_arriving' && (
                        <button
                          onClick={async () => {
                            try {
                              await api.patch(`/provider/jobs/${job._id}/status`, {
                                status: 'in_progress',
                              })
                              fetchDashboardData()
                            } catch (error) {
                              console.error('Failed to update status:', error)
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Start Service
                        </button>
                      )}
                      {job.status === 'in_progress' && (
                        <Link
                          to={`/provider/upload-report/${job._id}`}
                          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                        >
                          Upload Report & Complete
                        </Link>
                      )}
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

export default ProviderDashboard
