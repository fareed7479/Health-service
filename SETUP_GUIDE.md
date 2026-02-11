# Complete Setup Guide

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js (v16 or higher) installed
- MongoDB installed locally or MongoDB Atlas account
- Git installed
- A code editor (VS Code recommended)

## 🚀 Step-by-Step Setup

### Step 1: Clone/Download the Project

If using Git:
```bash
git clone <repository-url>
cd healthcare-platform
```

Or extract the project files to a directory.

### Step 2: Backend Setup

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# On Windows
copy .env.example .env

# On Linux/Mac
cp .env.example .env
```

4. **Configure MongoDB:**
   - Option A: Local MongoDB
     - Install MongoDB locally
     - Start MongoDB service
     - Use: `mongodb://localhost:27017/healthcare-platform`
   
   - Option B: MongoDB Atlas (Recommended)
     - Create account at https://www.mongodb.com/cloud/atlas
     - Create a new cluster
     - Get connection string
     - Replace `<password>` with your password

5. **Create required directories:**
```bash
mkdir uploads logs
```

6. **Configure environment variables in `.env`:**
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (replace with your connection string)
MONGODB_URI=mongodb://localhost:27017/healthcare-platform

# JWT (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@healthcareplatform.com

# SMS (Twilio - Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Firebase (Optional - for OTP)
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

7. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server should start on `http://localhost:5000`

### Step 3: Frontend Setup

1. **Open a new terminal and navigate to client directory:**
```bash
cd client
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
# On Windows
copy .env.example .env

# On Linux/Mac
cp .env.example .env
```

4. **Configure environment variables in `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

5. **Start the development server:**
```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

## 🔧 Third-Party Service Setup

### 1. Razorpay Setup

1. **Create Razorpay Account:**
   - Go to https://razorpay.com
   - Sign up for an account
   - Complete KYC verification

2. **Get API Keys:**
   - Go to Dashboard → Settings → API Keys
   - Generate Test Keys (for development)
   - Copy Key ID and Key Secret
   - Add to both backend and frontend `.env` files

3. **Configure Webhooks (Optional):**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payment/webhook`
   - Select events: `payment.captured`, `payment.failed`

### 2. Google Maps API Setup

1. **Create Google Cloud Project:**
   - Go to https://console.cloud.google.com
   - Create a new project

2. **Enable APIs:**
   - Navigate to APIs & Services → Library
   - Enable "Maps JavaScript API"
   - Enable "Places API" (for address autocomplete)

3. **Create API Key:**
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → API Key
   - Copy the API key
   - (Optional) Restrict the key to your domain

4. **Add to Frontend `.env`:**
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Email Service Setup (Gmail)

1. **Enable 2-Factor Authentication:**
   - Go to Google Account settings
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Generate a new app password for "Mail"
   - Copy the 16-character password

3. **Add to Backend `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
```

**Alternative Email Services:**
- SendGrid
- Mailgun
- AWS SES
- Custom SMTP server

### 4. Cloudinary Setup (File Uploads)

1. **Create Cloudinary Account:**
   - Go to https://cloudinary.com
   - Sign up for free account

2. **Get Credentials:**
   - Go to Dashboard
   - Copy:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to Backend `.env`:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Alternative:** Use local file storage (modify multer config)

### 5. Twilio Setup (SMS - Optional)

1. **Create Twilio Account:**
   - Go to https://www.twilio.com
   - Sign up for account
   - Verify phone number

2. **Get Credentials:**
   - Go to Console Dashboard
   - Copy:
     - Account SID
     - Auth Token

3. **Purchase Phone Number:**
   - Go to Phone Numbers → Buy a Number
   - Select a number
   - Purchase

4. **Add to Backend `.env`:**
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_purchased_number
```

**Note:** SMS is optional. Email OTP will work without SMS.

### 6. Firebase Setup (Optional - Alternative OTP)

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create new project

2. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable Phone authentication

3. **Get Service Account:**
   - Go to Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file

4. **Add to Backend `.env`:**
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## 🧪 Testing the Setup

### 1. Test Backend

1. **Check server health:**
```bash
curl http://localhost:5000/health
```
Should return: `{"status":"OK","message":"Server is running"}`

2. **Test MongoDB connection:**
   - Check server logs for "MongoDB Connected Successfully"

### 2. Test Frontend

1. **Open browser:**
   - Navigate to `http://localhost:5173`
   - Should see the home page

2. **Test Registration:**
   - Click "Sign Up"
   - Fill in details
   - Check email for OTP
   - Verify OTP

3. **Test Login:**
   - Use registered credentials
   - Should redirect to dashboard

### 3. Test Payment (Test Mode)

1. **Use Razorpay Test Cards:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

**Port Already in Use:**
- Change PORT in `.env`
- Or kill process using port 5000

**Module Not Found:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### Frontend Issues

**API Connection Error:**
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check CORS settings in backend

**Google Maps Not Loading:**
- Verify API key in `.env`
- Check API key restrictions
- Ensure Maps JavaScript API is enabled

**Razorpay Not Working:**
- Verify keys in `.env`
- Check browser console for errors
- Ensure Razorpay script is loaded

### Email Issues

**Email Not Sending:**
- Verify app password (not regular password)
- Check 2FA is enabled
- Try different email service

### File Upload Issues

**Upload Failing:**
- Check Cloudinary credentials
- Verify file size limits
- Check network connection

## 📝 Creating First Admin User

### Method 1: Using Admin Seeder Script (Recommended)

The easiest way to create or update an admin user is using the provided seeder script:

1. **Navigate to server directory:**
```bash
cd server
```

2. **Run the admin creation script:**
```bash
# Using npm script (recommended)
npm run create-admin

# Or directly with node
node scripts/createAdmin.js
```

3. **Default Admin Credentials:**
   - **Email**: `admin@healthcare.com`
   - **Password**: `Admin@123`
   - **Phone**: `9999999999`
   - **Name**: `Super Admin`

4. **Custom Admin Details:**
You can create an admin with custom details using command line arguments:
```bash
npm run create-admin -- --email=your-admin@example.com --name="Your Name" --phone=1234567890 --password=YourSecurePassword
```

5. **Update Existing Admin:**
If an admin with the email already exists, the script will update it:
```bash
# Update admin by email
npm run create-admin -- --email=admin@healthcare.com --password=NewPassword123
```

**Note**: The script will:
- ✅ Check if admin exists by email
- ✅ Create new admin if not exists
- ✅ Update existing admin if found
- ✅ Hash password securely with bcrypt
- ✅ Set role to 'admin' and isVerified to true

### Method 2: Using MongoDB Shell (Alternative)

If you prefer to create admin directly in MongoDB:

```javascript
use healthcare-platform
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  phone: "1234567890",
  password: "$2a$10$hashed_password_here", // Use bcrypt to hash
  role: "admin",
  isVerified: true,
  isBlocked: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note**: You'll need to hash the password using bcrypt. The seeder script handles this automatically.

## 🚀 Production Deployment

### Backend Deployment

1. **Choose Platform:**
   - Heroku
   - AWS EC2
   - DigitalOcean
   - Railway
   - Render

2. **Set Environment Variables:**
   - Add all `.env` variables to platform settings
   - Use production MongoDB URI
   - Use production Razorpay keys

3. **Deploy:**
   - Connect Git repository
   - Configure build commands
   - Set start command: `npm start`

### Frontend Deployment

1. **Build:**
```bash
cd client
npm run build
```

2. **Deploy to:**
   - Vercel (recommended)
   - Netlify
   - AWS S3 + CloudFront
   - GitHub Pages

3. **Configure:**
   - Set environment variables
   - Update API URL to production backend
   - Configure domain and SSL

## ✅ Verification Checklist

Before going live:
- [ ] All environment variables configured
- [ ] MongoDB connected
- [ ] Razorpay test payments working
- [ ] Email notifications working
- [ ] File uploads working
- [ ] Google Maps loading
- [ ] All user roles tested
- [ ] Admin user created
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Error logging working
- [ ] Backup strategy in place

## 📞 Support

If you encounter issues:
1. Check error logs in `server/logs/`
2. Check browser console for frontend errors
3. Verify all environment variables
4. Check third-party service dashboards
5. Review this guide again

---

**Happy Coding! 🎉**
