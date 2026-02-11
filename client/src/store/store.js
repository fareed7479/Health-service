import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import bookingReducer from './slices/bookingSlice'
import serviceReducer from './slices/serviceSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    service: serviceReducer,
  },
})
