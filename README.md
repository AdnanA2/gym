# Mentzer Tracker 🏋️

Mentzer Tracker is a simple workout tracking app I built with React. You can log your workouts, track your bodyweight and exercises, and see your progress in clean charts. It works right in the browser with no login and no internet needed.

## Why I Built This

I wanted an app that I could just open and start using without having to create an account or connect to anything. Something where I could track my workouts, view my progress, and keep everything stored privately on my own device. This app is focused on keeping things easy and useful without overcomplicating anything.

I named it after Mike Mentzer because the goal is similar to his training style focused, efficient, and to the point.

## What It Uses

- React for the frontend
- Material UI for the layout and components
- Chart.js for the progress graphs
- localStorage to save everything right in the browser

## What You Can Do

- Add, edit, and delete your workouts
- Track multiple exercises per workout
- Keep track of your bodyweight over time
- See charts of your progress
- View personal records for each exercise
- Export your data as CSV or JSON
- Works on desktop or mobile
- No login or setup required

## How To Run It

1. Make sure you have Node installed
2. In your terminal, run:

```bash
npm install
npm start
```

3. Open your browser and go to http://localhost:3000

That's it. You're ready to go.

## Where Your Data Is Saved

Everything is saved locally in your browser using localStorage. It saves under this key:

```
mentzer-workouts
```

Your data stays on your device. Nothing is sent to a server. Just keep in mind that if you clear your browser storage, your workouts will be deleted too.

## Can You Deploy It

Yes. This app works on any static hosting service because it doesn't need a backend. You can use Netlify, Vercel, GitHub Pages, or anything else that serves static files.

## Future Ideas

This is already solid for personal use but if I add more features later, it might include:

- Dark mode
- A rest timer or workout timer
- Exercise filtering or search
- Import from CSV or JSON
- Maybe a simple installable mobile version

## About Me

I'm a computer engineering student and I built this project as a way to practice using local storage, building clean interfaces, and managing data without relying on a backend or user accounts. I wanted something that works fast and feels reliable.

Feel free to use this or build on it if it helps you.