# Smart Lendable Washer Machine (SLWM) - Database Structure Visualization

## 🗂️ Database Schema Overview

users (collection)
  └── {userId} (document)
        └── username (required, unique, trim: true)
        └── email (required, unique, lowercase: true)
        └── password (required, minlength: 6)
        └── role: "customer" | "admin" (default: "customer")
        └── phoneNumber (optional)
        └── wallet (walletId)
        └── washingSessions: [sessionId] (array of Session references)
        └── isActive (default: true)
        └── createdAt
        └── updatedAt

machines (collection)
  └── {machineId} (document)
        └── name (required)
        └── machineCode (required, unique)
        └── status: "available" | "in_use" | "offline" | "error" (default: "available")
        └── location (required)
        └── currentSession (sessionId, references Session)
        └── mqttTopic (required)
        └── lastSeen (default: Date.now)
        └── createdAt
        └── updatedAt

pricePlans (collection)
  └── {pricePlanId} (document)
        └── name (required)
        └── ratePerMinute (required)
        └── maxDuration (optional)
        └── isActive (default: true)
        └── createdAt
        └── updatedAt

sessions (collection)
  └── {sessionId} (document)
        └── machineId (String, required)
        └── user (userId, references User, required)
        └── startTime (Date, default: Date.now)
        └── endTime (Date, optional)
        └── duration (Number, optional)
        └── status: "pending" | "running" | "completed" | "cancelled" (default: "pending")
        └── price (required)
        └── totalCost (Number, default: 0)
        └── paymentStatus: "unpaid" | "paid" | "refunded" (default: "unpaid")
        └── machineStatus: "available" | "in_use" | "finished" | "offline" (default: "available")
        └── mqttTopic (optional)
        └── notes (String, trim: true)
        └── createdAt
        └── updatedAt

transactions (collection)
  └── {transactionId} (document)
        └── user (userId, references User, required)
        └── wallet (walletId, references Wallet, required)
        └── session (sessionId, references Session, optional)
        └── type: "topup" | "deduct" | "refund" (required)
        └── amount (required)
        └── method: "cash" | "credit" | "momo" | "paypal" | "system" (default: "system")
        └── description (String, trim: true)
        └── balanceAfter (optional)
        └── status: "pending" | "completed" | "failed" | "cancelled" (default: "pending")
        └── createdAt
        └── updatedAt

notifications (collection)
  └── {notificationId} (document)
        └── user (userId, references User, required)
        └── title (required)
        └── message (required)
        └── type: "session_start" | "session_end" | "payment" | "machine_alert" | "system" (default: "system")
        └── isRead (Boolean, default: false)
        └── relatedSession (sessionId, references Session, optional)
        └── relatedMachine (machineId, references Machine, optional)
        └── createdAt
        └── updatedAt

wallets (collection)
  └── {walletId} (document)
        └── user (userId, references User, required, unique)
        └── balance (Number, default: 0, min: 0, required)
        └── currency: "VND" | "USD" (default: "VND")
        └── totalDeposited (Number, default: 0)
        └── totalSpent (Number, default: 0)
        └── lastTopupAmount (Number, default: 0)
        └── lastTopupDate (Date, optional)
        └── isActive (Boolean, default: true)
        └── autoTopup {
            └── enabled (Boolean, default: false)
            └── threshold (Number, default: 10000)
            └── topupAmount (Number, default: 50000)
          }
        └── createdAt
        └── updatedAt
