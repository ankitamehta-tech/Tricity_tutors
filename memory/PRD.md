# Tricity Tutors - Product Requirements Document

## Overview
A comprehensive tutoring platform connecting qualified tutors with students in Chandigarh, Mohali, Panchkula, Zirakpur and nearby areas.

## Original Problem Statement
User needed help deploying their GitHub repository (https://github.com/ankitamehta-tech/Tricity_tutors.git) to Emergent platform.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI, React Router
- **Backend**: FastAPI (Python), Motor (async MongoDB driver)
- **Database**: MongoDB
- **Authentication**: JWT-based with bcrypt password hashing
- **Integrations**: Razorpay (payments), Twilio (SMS OTP), Resend (email)

## User Personas
1. **Tutors**: Create profiles, browse student requirements, earn through teaching
2. **Students/Parents**: Post requirements, browse tutors, hire tutors
3. **Coaching Institutes**: Post bulk requirements, find tutors
4. **Companies**: Corporate training needs

## Core Features Implemented
- User authentication (signup, login, OTP verification, forgot password)
- Tutor profile management (education, experience, subjects, fees)
- Student requirement posting
- Tutor browsing with filters (subject, location, fees)
- Coin wallet system (purchase coins, spend to contact tutors/view requirements)
- Messaging system
- Review and rating system
- Dashboard for tutors and students

## Coin System
- Tutors: 200 coins to view one student requirement
- Students: 100 coins to contact one tutor
- Packages: 50 coins (₹100) to 10,000 coins (₹12,000)

## What's Been Implemented (Jan 2026)
- [x] Cloned repository from GitHub
- [x] Fixed deployment issues (JWT_SECRET hardcoded fallback removed)
- [x] Backend and frontend running successfully
- [x] All API endpoints tested and working
- [x] OTP mock system working (use 123456 for testing)
- [x] Payment mock system working
- [x] **BUG FIX**: Fixed Razorpay amount changing on click - removed duplicate click handlers and added loading state prevention
- [x] **ENHANCEMENT**: Added Razorpay config to show all banks including SBI in netbanking/UPI

## Deployment Status
**Ready for Deployment** on Emergent Platform

### To Deploy:
1. Click the **Deploy** button in Emergent
2. Click **"Deploy Now"**
3. Wait 10-15 minutes
4. Get your live URL!

### For Production (External Hosting like Render):
See `/app/DEPLOYMENT_GUIDE.md` for complete instructions including:
- MongoDB Atlas setup
- Render deployment
- Custom domain configuration
- Razorpay/Twilio/Resend integration

## API Endpoints Summary
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/forgot-password`
- Tutors: `/api/tutors`, `/api/tutor/profile`, `/api/tutor/stats`
- Requirements: `/api/requirements`, `/api/requirements/my`
- Reviews: `/api/reviews`, `/api/reviews/{tutor_id}`
- Messages: `/api/messages`, `/api/messages/conversations`
- Wallet: `/api/wallet`, `/api/wallet/purchase`, `/api/wallet/spend`

## Environment Variables Required
### Backend (.env)
- MONGO_URL
- DB_NAME
- JWT_SECRET
- CORS_ORIGINS
- RAZORPAY_KEY_ID (optional)
- RAZORPAY_KEY_SECRET (optional)
- TWILIO_ACCOUNT_SID (optional)
- TWILIO_AUTH_TOKEN (optional)
- TWILIO_VERIFY_SERVICE_SID (optional)
- RESEND_API_KEY (optional)
- SENDER_EMAIL (optional)

### Frontend (.env)
- REACT_APP_BACKEND_URL

## Backlog / Future Enhancements
- P0: Production Razorpay integration
- P0: Production Twilio SMS OTP
- P1: Production Resend email integration
- P1: File upload for profile photos
- P2: Video calling integration
- P2: Calendar/scheduling
- P3: AI-powered tutor recommendations
- P3: Analytics dashboard

## Notes
- Mock OTP: Use `123456` for testing
- Mock Payment: All payments complete instantly in mock mode
