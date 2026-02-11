import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getServices } from '../../store/slices/serviceSlice'
import Layout from '../../components/Layout'

const Services = () => {
  const dispatch = useDispatch()
  const { services, loading } = useSelector((state) => state.service)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getServices())
  }, [dispatch])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8">All Services</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{service.basePrice}
                    </span>
                    {service.discount?.percentage > 0 && (
                      <span className="ml-2 text-sm text-green-600">
                        {service.discount.percentage}% off
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {service.duration} min
                  </span>
                </div>
                <Link
                  to={user ? `/booking/${service._id}` : '/login'}
                  className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No services available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Services
