# Smart Energy Dashboard

A React web dashboard for an IoT-based Smart Electrical Control and Energy Monitoring System using Firebase Authentication, Firebase Realtime Database, and Recharts.

## Features

- Email/password authentication with signup, login, logout, and protected dashboard access
- Realtime ESP32 device monitoring from Firebase Realtime Database
- Relay control and countdown timer updates sent directly to Firebase
- Live voltage, current, and energy trend charts
- Alert cards for high voltage, high current, and offline device states
- Responsive dashboard with sidebar navigation and modular components

## Tech Stack

- React with functional components
- Vite
- Firebase SDK v9+ modular API
- Firebase Authentication
- Firebase Realtime Database
- Recharts
- Custom CSS

## Project Structure

```text
smart-energy-dashboard/
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── components/
    │   ├── auth/
    │   │   ├── AuthForm.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── dashboard/
    │   │   ├── AlertsPanel.jsx
    │   │   ├── AnalyticsSection.jsx
    │   │   ├── ControlPanel.jsx
    │   │   ├── MetricCard.jsx
    │   │   └── StatusPanel.jsx
    │   └── layout/
    │       ├── Header.jsx
    │       └── Sidebar.jsx
    ├── context/
    │   └── AuthContext.jsx
    ├── firebase/
    │   └── config.js
    ├── hooks/
    │   └── useDeviceData.js
    └── pages/
        ├── DashboardPage.jsx
        ├── LoginPage.jsx
        └── SignupPage.jsx
```

## Firebase Realtime Database Shape

Set your device data at:

```text
device1:
  voltage
  current
  power
  energy
  cost
  relay
  countdown
  wifi_status
  last_updated
```

## Setup Instructions

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
Copy-Item .env.example .env
```

3. Enable Firebase Authentication:

- In Firebase Console, open `Authentication`
- Enable `Email/Password`

4. Configure Firebase Realtime Database rules for authenticated users. Example:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

5. Start the development server:

```bash
npm run dev
```

6. Build for production:

```bash
npm run build
```

## Firebase Config Notes

Update the following values in `.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_DEVICE_PATH`

The provided Realtime Database URL is already included in `.env.example`:

```text
https://akinlolu-energy-monitor-default-rtdb.firebaseio.com/
```

## Recommended Device Payload

For best results, keep `last_updated` as a Unix timestamp in milliseconds:

```json
{
  "voltage": 228.4,
  "current": 4.15,
  "power": 945.9,
  "energy": 12.487,
  "cost": 874.09,
  "relay": true,
  "countdown": 25,
  "wifi_status": "connected",
  "last_updated": 1778523412000
}
```

## Production Notes

- Replace placeholder Firebase config values before deployment
- Consider adding role-based access if multiple operators will use the system
- You can deploy this app to Firebase Hosting, Vercel, Netlify, or any static hosting provider
