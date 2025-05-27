# Mentzer-Style Workout Tracker

A web application for tracking your Mentzer-style workouts (2×/week) with exercise tracking, bodyweight monitoring, and personal record tracking.

## Features

- Track workouts with multiple exercises
- Record bodyweight for each workout
- Support for both weighted exercises and bodyweight exercises
- View workout history and details
- Track personal records
- Visualize bodyweight progress
- Mobile-responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Firebase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd mentzer-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project named "mentzer-tracker"
   - Enable Firestore Database
   - Enable Hosting
   - (Optional) Enable Authentication

4. Configure Firebase:
   - Install Firebase CLI: `npm install -g firebase-tools`
   - Login to Firebase: `firebase login`
   - Initialize Firebase: `firebase init`
     - Select Firestore and Hosting
     - Use default Firestore rules
     - Set public directory to "build"
     - Configure as single-page app

5. Update Firebase configuration:
   - Copy your Firebase config from the Firebase Console
   - Replace the placeholder config in `src/firebase.js`

6. Start the development server:
```bash
npm start
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Usage

1. Add a new workout:
   - Click the "+" button on the home page
   - Enter the date and your bodyweight
   - Add exercises with their weights and reps
   - Add notes if needed
   - Save the workout

2. View workout history:
   - All workouts are listed on the home page
   - Click on a workout to view details
   - Edit or delete workouts from the detail view

3. Track progress:
   - Visit the Stats page to see your bodyweight progress
   - View your personal records for each exercise
   - Track your progress over time

## Technologies Used

- React.js
- Firebase (Firestore, Hosting)
- Material-UI
- Chart.js
- React Router

## License

MIT 