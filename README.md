# 🐕 Multi-User Dog Training Management System

A robust, full-stack, cross-platform management ecosystem tailored for pet training businesses. The system consists of two mobile apps (Flutter), an operator web dashboard (React.js + Vite), and a central REST API backend (Node.js + Express + MongoDB).

---

## 🌟 Key Features

* **Authentication & Role-Based Access Control**:
  * Username/Phone and Password login for Trainers and Clients.
  * Admin Operator password reset, account management, and user lookups.
  * Auth-engine toggle support ready for SMS OTP integration.
* **GPS Geofenced & Live Photo Session Verification**:
  * Mandatory 100-meter GPS radius geofence check before session initiation.
  * Mandatory live camera photos required at session start and end (Gallery upload disabled).
  * 15-minute pre-session countdown timer and active 30-minute session countdown.
* **Automated Trainer Wallet & Penalties**:
  * Automated session payout processing upon verified completion.
  * Operator manual penalty imposition, deductions, credits, and penalty reversals with audit logs.
* **Client Package Tracker**:
  * Real-time remaining vs. completed session progress tracking.
  * Completed session history with start/end verification photos and exact timestamps.
  * 24-hour prior notice logic for session pauses and cancellations.
* **Automated CI/CD**:
  * GitHub Actions workflow configured for building Android `.apk` binaries automatically.

---

## 📁 Repository Directory Structure

```text
dog-training-system/
├── .github/
│   └── workflows/
│       └── build_apk.yml            # CI/CD pipeline for Flutter APK builds
├── backend/
│   ├── config/
│   │   └── db.js                    # Database connection setup
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT & Role authentication middleware
│   ├── models/
│   │   ├── Session.js               # Session schema & verification logs
│   │   ├── User.js                  # User schema (Trainer, Client, Operator)
│   │   └── Wallet.js                # Wallet balances & ledger history
│   ├── routes/
│   │   ├── auth.routes.js           # Login & auth routes
│   │   ├── operator.routes.js       # Admin user management & wallet controls
│   │   └── session.routes.js        # Session execution, GPS, & cancellations
│   ├── .env                         # Environment variables configuration
│   ├── package.json                 # Backend dependencies
│   └── server.js                    # Express app entry point
├── mobile_apps/
│   └── dog_trainer_app/
│       ├── lib/
│       │   ├── models/
│       │   │   └── session_model.dart
│       │   ├── screens/
│       │   │   ├── client_home_screen.dart
│       │   │   ├── login_screen.dart
│       │   │   └── trainer_home_screen.dart
│       │   ├── services/
│       │   │   └── api_service.dart
│       │   └── main.dart
│       └── pubspec.yaml             # Flutter dependencies
└── operator_dashboard/
    ├── src/
    │   ├── components/
    │   │   ├── SessionMonitor.jsx
    │   │   ├── UserManagement.jsx
    │   │   └── WalletControl.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── package.json                 # React Vite dependencies
    └── vite.config.js               # Vite server config
