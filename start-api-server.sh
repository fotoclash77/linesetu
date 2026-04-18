#!/bin/bash

# LINESETU API Server Startup Script

cd /app/artifacts/api-server

export FIREBASE_API_KEY=AIzaSyAB8oRHetHbugo8SW6AJgpgh_Zn5DeFRuI
export FIREBASE_AUTH_DOMAIN=linesetu77.firebaseapp.com
export FIREBASE_PROJECT_ID=linesetu77
export FIREBASE_STORAGE_BUCKET=linesetu77.firebasestorage.app
export FIREBASE_MESSAGING_SENDER_ID=669948564779
export FIREBASE_APP_ID=1:669948564779:web:5cb0991e9e7a9ed065e16e
export FAST2SMS_API_KEY=klNS6ABpsaf2PuhRIdW5e91834v7yHoEOKLZgjr0TMQDmcYxiXpBP4e7Qr1kyWoFmAuTKUSG02gbCn6j
export DATABASE_URL=postgresql://localhost:5432/linesetu
export PORT=8002
export NODE_ENV=production
export RAZORPAY_KEY_ID=rzp_test_SewlfDwjJCVgm0
export RAZORPAY_KEY_SECRET=sItkQ64SQcXtEKUl67FhLER0

echo "Starting LINESETU API Server on port 8002..."
pnpm run start
