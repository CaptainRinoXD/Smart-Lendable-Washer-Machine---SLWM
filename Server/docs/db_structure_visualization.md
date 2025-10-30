# Smart Lendable Washer Machine (SLWM) - Database Structure Visualization

## 🗂️ Database Schema Overview

users (collection)
  └── {userId} (document)
        └── username
        └── email
        └── password
        └── role: "customer" | "admin"
        └── phoneNumber
        └── wallet (walletId)
        └── washingSessions: [sessionId]
        └── isActive

machines (collection)
  └── {machineId} (document)
        └── name
        └── machineCode
        └── status: "available" | "in_use" | "offline" | "error"
        └── location
        └── currentSession (sessionId)
        └── mqttTopic
        └── lastSeen

pricePlans (collection)
  └── {pricePlanId} (document)
        └── name
        └── ratePerMinute
        └── maxDuration
        └── isActive

sessions (collection)
  └── {sessionId} (document)
        └── machineId
        └── user (userId)
        └── startTime
        └── endTime
        └── duration
        └── status: "pending" | "running" | "completed" | "cancelled"
        └── price
        └── totalCost
        └── paymentStatus: "unpaid" | "paid" | "refunded"
        └── machineStatus: "available" | "in_use" | "finished" | "offline"
        └── mqttTopic
        └── notes

transactions (collection)
  └── {transactionId} (document)
        └── user (userId)
        └── wallet (walletId)
        └── session (sessionId)
        └── type: "topup" | "deduct" | "refund"
        └── amount
        └── method: "cash" | "credit" | "momo" | "paypal" | "system"
        └── description
        └── balanceAfter
        └── status: "pending" | "completed" | "failed" | "cancelled"

notifications (collection)
  └── {notificationId} (document)
        └── user (userId)
        └── title
        └── message
        └── type: "session_start" | "session_end" | "payment" | "machine_alert" | "system"
        └── isRead
        └── relatedSession (sessionId)
        └── relatedMachine (machineId)

wallets (collection)
  └── {walletId} (document)
        └── user (userId)
        └── balance
        └── currency: "VND" | "USD"
        └── totalDeposited
        └── totalSpent
        └── lastTopupAmount
        └── lastTopupDate
        └── isActive
        └── autoTopup {
            └── enabled
            └── threshold
            └── topupAmount
          }
