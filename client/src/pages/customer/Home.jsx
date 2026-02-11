import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getServices } from '../../store/slices/serviceSlice'
import Layout from '../../components/Layout'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const Home = () => {
  const dispatch = useDispatch()
  const { services } = useSelector((state) => state.service)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(getServices())
  }, [dispatch])

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Quality Healthcare & Home Services
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-primary-100">
                Book trusted doctors and technicians at your doorstep
              </p>
              <Link
                to="/services"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
              >
                Browse Services
                <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary-600">
                      ₹{service.basePrice}
                    </span>
                    <Link
                      to={user ? `/booking/${service._id}` : '/login'}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Book Now →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/services"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Services →
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <FiCheckCircle className="mx-auto text-4xl text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
                <p className="text-gray-600">
                  All our doctors and technicians are verified and licensed professionals
                </p>
              </div>
              <div className="text-center">
                <FiCheckCircle className="mx-auto text-4xl text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
                <p className="text-gray-600">
                  Book services in just a few clicks with our simple booking system
                </p>
              </div>
              <div className="text-center">
                <FiCheckCircle className="mx-auto text-4xl text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
                <p className="text-gray-600">
                  Safe and secure payment processing with Razorpay
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Home
