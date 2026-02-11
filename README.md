# Healthcare & Home Service Booking Platform

A production-ready MERN stack web application for booking healthcare and home services with three user roles: Customer, Provider (Doctor/Technician), and Admin.

## 🚀 Features

### Customer Features
- User registration and authentication (OTP-based)
- Service browsing and booking
- Multiple address management
- Payment integration (Razorpay)
- Booking history and tracking
- Report downloads
- Real-time status updates

### Provider Features
- Provider registration with license verification
- Job management (accept/reject bookings)
- Status updates (Accepted → Arriving → In Progress → Completed)
- Report uploads
- Earnings tracking
- Google Maps navigation

### Admin Features
- User management (block/unblock)
- Provider approval system
- Service category management
- Booking management
- Reports and analytics
- Export functionality

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Razorpay Payment Integration
- Nodemailer (Email notifications)
- Twilio/Firebase (SMS notifications)
- Multer + Cloudinary (File uploads)
- Winston (Logging)
- Express Rate Limiting
- Helmet (Security)

### Frontend
- React (Vite)
- Redux Toolkit
- Tailwind CSS
- React Router
- Google Maps API
- Axios
- React Hot Toast

## 📁 Project Structure

```
.
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store and slices
│   │   └── App.jsx        # Main app component
│   └── package.json
│
├── server/                 # Backend Express application
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
│
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Razorpay account
- Google Maps API key
- Email service (Gmail/SMTP)
- Twilio account (optional, for SMS)

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/healthcare-platform
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# ... (see .env.example for all variables)
```

5. Create necessary directories:
```bash
mkdir uploads logs
```

6. Create admin user (optional but recommended):
```bash
# Create default admin user
npm run create-admin

# Or create custom admin
npm run create-admin -- --email=admin@yourdomain.com --password=YourPassword123
```

**Default Admin Credentials:**
- Email: `admin@healthcare.com`
- Password: `Admin@123`

7. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. Start the development server:
```bash
npm run dev
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

### Customer
- `GET /api/customer/services` - Get all services
- `POST /api/customer/addresses` - Add address
- `GET /api/customer/addresses` - Get my addresses
- `PUT /api/customer/addresses/:id` - Update address
- `DELETE /api/customer/addresses/:id` - Delete address
- `GET /api/customer/bookings` - Get my bookings
- `GET /api/customer/bookings/:id` - Get booking by ID

### Provider
- `POST /api/provider/register` - Register as provider
- `GET /api/provider/profile` - Get provider profile
- `GET /api/provider/jobs` - Get assigned jobs
- `PATCH /api/provider/jobs/:id/accept-reject` - Accept/reject booking
- `PATCH /api/provider/jobs/:id/status` - Update job status
- `POST /api/provider/upload-report` - Upload report
- `GET /api/provider/earnings` - Get earnings

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/providers/pending` - Get pending providers
- `PATCH /api/admin/providers/:id/approve-reject` - Approve/reject provider
- `POST /api/admin/services` - Create service
- `GET /api/admin/services` - Get all services
- `PUT /api/admin/services/:id` - Update service
- `DELETE /api/admin/services/:id` - Delete service
- `GET /api/admin/dashboard/stats` - Get dashboard stats
- `GET /api/admin/bookings/export` - Export bookings

### Booking
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/bookings/all` - Get all bookings (admin)

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- API rate limiting
- CORS configuration
- Helmet security headers
- Input validation
- Error handling

## 📝 Database Models

- **User**: Customer, Provider, Admin accounts
- **ProviderProfile**: Provider-specific information
- **ServiceCategory**: Available services
- **Address**: User addresses
- **Booking**: Service bookings
- **Payment**: Payment transactions

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or use a cloud MongoDB service
2. Configure environment variables on your hosting platform
3. Deploy to platforms like:
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway
   - Render

### Frontend Deployment
1. Build the production bundle:
```bash
cd client
npm run build
```

2. Deploy to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

## 📚 Additional Setup Guides

### Razorpay Setup
1. Create a Razorpay account at https://razorpay.com
2. Get your Key ID and Key Secret from the dashboard
3. Add them to your `.env` file
4. Configure webhook URLs if needed

### Google Maps Setup
1. Go to Google Cloud Console
2. Enable Maps JavaScript API
3. Create an API key
4. Add the key to your frontend `.env` file

### Email Setup (Gmail)
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the app password in your `.env` file

### SMS Setup (Twilio)
1. Create a Twilio account
2. Get Account SID and Auth Token
3. Purchase a phone number
4. Add credentials to `.env` file

## 🤝 Contributing

This is a production-level application. All features are fully implemented and tested.

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For issues or questions, please contact the development team.

---

**Note**: Make sure to configure all environment variables before running the application. The application requires MongoDB, Razorpay, and Google Maps API to function properly.
