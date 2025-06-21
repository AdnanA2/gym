# Mentzer-Style Workout Tracker

A comprehensive web application for tracking your Mentzer-style workouts with user authentication, exercise tracking, bodyweight monitoring, personal record tracking, and data export capabilities.

## ✨ Features

### Core Functionality
- 🔐 **User Authentication** - Secure login with email/password or Google OAuth
- 📊 **Workout Tracking** - Record exercises with weights, reps, and notes
- ⚖️ **Bodyweight Monitoring** - Track your bodyweight with each workout
- 🏆 **Personal Records** - Automatic PR tracking for all exercises
- 📈 **Progress Visualization** - Charts for bodyweight and exercise progress
- 📱 **Mobile-Responsive Design** - Works perfectly on all devices

### Advanced Features
- 📤 **Data Export** - Export your workout data to CSV or JSON
- 🎯 **Exercise Progress Charts** - Individual progress tracking per exercise
- 📊 **Comprehensive Statistics** - Detailed analytics and insights
- 🔄 **Real-time Sync** - All data synced with Firebase Cloud Firestore
- 🛡️ **Data Security** - User-specific data with proper security rules

## 🛠️ Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Firebase account (free tier is sufficient)
- Modern web browser with JavaScript enabled

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd mentzer-tracker
npm install
```

### 2. Firebase Setup

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project" and name it "mentzer-tracker"
3. Enable Google Analytics (optional)
4. Wait for project creation to complete

#### Enable Firebase Services
1. **Authentication:**
   - Go to Authentication → Sign-in method
   - Enable Email/Password and Google providers
   - For Google: Add your domain to authorized domains

2. **Firestore Database:**
   - Go to Firestore Database → Create database
   - Start in production mode
   - Choose your preferred region

3. **Hosting (for deployment):**
   - Go to Hosting → Get started
   - Follow the setup wizard

#### Configure Firebase in Your App
1. Go to Project Settings → General → Your apps
2. Click "Add app" → Web app
3. Register your app with nickname "mentzer-tracker"
4. Copy the Firebase configuration object
5. Replace the placeholder config in `src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Deploy Firebase Rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Run the Application
```bash
npm start
```

The app will open at `http://localhost:3000`

## 📦 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### Deploy Everything
```bash
firebase deploy
```

Your app will be live at `https://your-project-id.web.app`

## 🎯 Usage Guide

### Getting Started
1. **Sign Up/Login:** Create an account or sign in with Google
2. **Add First Workout:** Click the "+" button to add your first workout
3. **Record Exercises:** Add exercises with weights, reps, and optional notes
4. **Track Progress:** View your stats and progress charts

### Workout Management
- **Add Workout:** Use the floating action button or navigation
- **Edit Workout:** Click on any workout and use the edit button
- **Delete Workout:** Use the delete button in workout details
- **Bodyweight Exercises:** Use "BW" for bodyweight exercises

### Data Analysis
- **Statistics:** View comprehensive workout statistics
- **Progress Charts:** See bodyweight and exercise-specific progress
- **Personal Records:** Automatically calculated and displayed
- **Export Data:** Download your data in CSV or JSON format

## 🏗️ Architecture

### Frontend
- **React.js** - Modern UI framework
- **Material-UI** - Professional UI components
- **Chart.js** - Data visualization
- **React Router** - Client-side routing

### Backend
- **Firebase Authentication** - User management
- **Cloud Firestore** - NoSQL database
- **Firebase Hosting** - Static site hosting
- **Firebase Security Rules** - Data protection

### Features
- **Progressive Web App** - Installable on mobile devices
- **Responsive Design** - Works on all screen sizes
- **Real-time Data** - Instant updates across devices
- **Offline Capability** - Basic offline functionality

## 🔧 Development

### Project Structure
```
src/
├── components/
│   ├── Auth/          # Authentication components
│   └── Layout/        # Navigation and layout
├── contexts/          # React contexts
├── pages/            # Main application pages
├── utils/            # Utility functions
├── firebase.js       # Firebase configuration
└── App.js           # Main application component
```

### Available Scripts
- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `firebase deploy` - Deploy to Firebase

### Environment Variables
No environment variables needed - all configuration is in `src/firebase.js`

## 🛡️ Security

- **Authentication Required** - All data requires user login
- **User Data Isolation** - Users can only access their own data
- **Firestore Security Rules** - Server-side data protection
- **HTTPS Only** - All data transmission encrypted

## 📱 PWA Features

- **Installable** - Add to home screen on mobile
- **Responsive** - Works on all devices
- **Fast Loading** - Optimized for performance
- **Offline Ready** - Basic offline functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

### Common Issues

**Firebase Configuration Error:**
- Make sure you've replaced the placeholder config in `src/firebase.js`
- Verify your Firebase project is set up correctly

**Authentication Issues:**
- Check that Authentication is enabled in Firebase Console
- Verify your domain is added to authorized domains

**Data Not Loading:**
- Ensure Firestore rules are deployed
- Check browser console for errors

### Getting Help
- Check the browser console for errors
- Verify Firebase configuration
- Ensure all Firebase services are enabled
- Check that you're authenticated

## 🔄 Updates

The app automatically updates when you deploy new versions. Users will see the latest version on their next visit.

---

**Happy Tracking! 💪**

Build strength, track progress, and achieve your fitness goals with the Mentzer Workout Tracker. 