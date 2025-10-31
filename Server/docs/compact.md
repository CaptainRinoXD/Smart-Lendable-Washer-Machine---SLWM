# 🧺 Hệ Thống Thuê Máy Giặt Thông Minh - Tóm Tắt Hoàn Chỉnh

## 📁 **Cấu Trúc Dự Án**
```
laundry-system/
├── models/          # Định nghĩa database schema
├── services/        # Business logic
├── controllers/     # Xử lý HTTP requests
├── routes/          # Định nghĩa API endpoints
├── middleware/      # Xác thực và xử lý cross-cutting
├── .env            # Biến môi trường
├── package.json    # Dependencies
└── index.js          # Ứng dụng chính
```

## 🔧 **Các Models (Database Schema)**

### **User.js** - Quản lý người dùng
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    phoneNumber: {
      type: String,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    washingSessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
```

### **Wallet.js** - Quản lý ví tiền
```javascript
import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    currency: {
      type: String,
      default: "VND",
      enum: ["VND", "USD"],
    },
    totalDeposited: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastTopupAmount: {
      type: Number,
      default: 0,
    },
    lastTopupDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoTopup: {
      enabled: {
        type: Boolean,
        default: false,
      },
      threshold: {
        type: Number,
        default: 10000,
      },
      topupAmount: {
        type: Number,
        default: 50000,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual methods (không có side effects)
walletSchema.virtual("availableBalance").get(function () {
  return this.balance;
});

walletSchema.methods.hasSufficientBalance = function (amount) {
  return this.balance >= amount;
};

export default mongoose.model("Wallet", walletSchema);
```

### **PricePlan.js**
```javascript
import mongoose from "mongoose";

const pricePlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ratePerMinute: {
      type: Number,
      required: true,
    },
    maxDuration: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PricePlan", pricePlanSchema);
```

### **Machine.js** - Thông tin máy giặt
```javascript
import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    machineCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["available", "in_use", "offline", "error"],
      default: "available",
    },
    location: {
      type: String,
      required: true,
    },
    currentSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    mqttTopic: {
      type: String,
      required: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Machine", machineSchema);
```
### **Transaction.js** - Lịch sử giao dịch
```javascript
import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    type: {
      type: String,
      enum: ["topup", "deduct", "refund"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      enum: ["cash", "credit", "momo", "paypal", "system"],
      default: "system",
    },
    description: {
      type: String,
      trim: true,
    },
    balanceAfter: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);

```


###  **Session.js** - Phiên sử dụng máy giặt
```javascript
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "running", "completed", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    machineStatus: {
      type: String,
      enum: ["available", "in_use", "finished", "offline"],
      default: "available",
    },
    mqttTopic: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Session", sessionSchema);
```



### **Các Models Khác**
- **Notification.js** - Thông báo

## 🚀 **Services (Business Logic)**

### **userService.js** - Xử lý người dùng
```javascript
import User from "../Models/User.js";
import WalletService from "./walletService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

class UserService {
  async register(userData) {
    try {
      const { username, email, password, phoneNumber } = userData;

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }]
      });
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = new User({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
      });

      await user.save();

      // Create wallet for user
      const wallet = await WalletService.createWallet(user._id);
      user.wallet = wallet._id;
      await user.save();

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          wallet: user.wallet,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async login(email, password) {
    try {
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        {userId: user._id , role: user.role},
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE}
      );

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          wallet: user.wallet,
        },
        token
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(userId) {
    return { message: "Logout successful (cookie needs to be cleared by client)" };
  }

  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .populate("wallet")
        .populate("washingSessions");
      
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const allowedUpdates = ["phoneNumber", "username"];
      const updates = Object.keys(updateData);
      const isValidOperation = updates.every(update => 
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        throw new Error("Invalid updates");
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );

      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default new UserService();
```

### **walletService.js** - Xử lý ví tiền
```javascript
import Wallet from "../Models/Wallet.js";
import Transaction from "../Models/Transaction.js";
import User from "../Models/User.js";
import mongoose from "mongoose";

class WalletService {
  async createWallet(userId) {
    try {
      const existingWallet = await Wallet.findOne({ user: userId });
      if (existingWallet) return existingWallet;

      const wallet = new Wallet({ user: userId, balance: 0 });
      await wallet.save();
      return wallet;
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  async topup(userId, amount, paymentMethod, description = "Nạp tiền") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (amount <= 0) throw new Error("Số tiền nạp phải lớn hơn 0");
      
      const wallet = await Wallet.findOne({ user: userId }).session(session);
      if (!wallet) throw new Error("Wallet not found");

      const oldBalance = wallet.balance;
      const newBalance = oldBalance + amount;

      wallet.balance = newBalance;
      wallet.totalDeposited += amount;
      wallet.lastTopupAmount = amount;
      wallet.lastTopupDate = new Date();
      await wallet.save({ session });

      const transaction = new Transaction({
        user: userId,
        wallet: wallet._id,
        type: "topup",
        amount: amount,
        method: paymentMethod,
        description: description,
        balanceAfter: newBalance,
        status: "completed",
      });
      await transaction.save({ session });

      await session.commitTransaction();
      
      return {
        wallet: await Wallet.findById(wallet._id).populate('user'),
        transaction,
        oldBalance,
        newBalance
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deduct(userId, amount, sessionId = null, description = "Thanh toán dịch vụ") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (amount <= 0) throw new Error("Số tiền trừ phải lớn hơn 0");

      const wallet = await Wallet.findOne({ user: userId }).session(session);
      if (!wallet) throw new Error("Wallet not found");
      if (!wallet.hasSufficientBalance(amount)) {
        throw new Error("Số dư không đủ");
      }

      const oldBalance = wallet.balance;
      const newBalance = oldBalance - amount;

      wallet.balance = newBalance;
      wallet.totalSpent += amount;
      await wallet.save({ session });

      const transaction = new Transaction({
        user: userId,
        wallet: wallet._id,
        session: sessionId,
        type: "deduct",
        amount: amount,
        method: "system",
        description: description,
        balanceAfter: newBalance,
        status: "completed",
      });
      await transaction.save({ session });

      await session.commitTransaction();
      
      return {
        wallet: await Wallet.findById(wallet._id).populate('user'),
        transaction,
        oldBalance,
        newBalance
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async refund(userId, amount, sessionId = null, description = "Hoàn tiền") {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (amount <= 0) throw new Error("Số tiền hoàn phải lớn hơn 0");

      const wallet = await Wallet.findOne({ user: userId }).session(session);
      if (!wallet) throw new Error("Wallet not found");

      const oldBalance = wallet.balance;
      const newBalance = oldBalance + amount;

      wallet.balance = newBalance;
      await wallet.save({ session });

      const transaction = new Transaction({
        user: userId,
        wallet: wallet._id,
        session: sessionId,
        type: "refund",
        amount: amount,
        method: "system",
        description: description,
        balanceAfter: newBalance,
        status: "completed",
      });
      await transaction.save({ session });

      await session.commitTransaction();
      
      return {
        wallet: await Wallet.findById(wallet._id).populate('user'),
        transaction,
        oldBalance,
        newBalance
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async checkBalance(userId) {
    const wallet = await Wallet.findOne({ user: userId })
      .populate("user", "username email phoneNumber");
    
    if (!wallet) throw new Error("Wallet not found");
    
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      user: wallet.user,
      lastTopup: wallet.lastTopupDate
    };
  }

  async getTransactionHistory(userId, options = {}) {
    const { limit = 20, page = 1, type } = options;
    const skip = (page - 1) * limit;
    
    const query = { user: userId };
    if (type) query.type = type;
    
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("session", "machineId startTime endTime")
      .populate("wallet");
    
    const total = await Transaction.countDocuments(query);
    
    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}

export default new WalletService();
```

## 🎯 **Controllers (HTTP Handlers)**

### **userController.js**
```javascript
import userService from "../services/userService.js";

export const userController = {
  async register(req, res) {
    try {
      const { username, email, password, phoneNumber } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: "Please provide all required fields" });
      }
      
      const result = await userService.register({ username, email, password, phoneNumber });
      res.status(201).json({ success: true, message: "User registered successfully", data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please provide email and password" });
      }
      
      const result = await userService.login(email, password);
      res.json({ success: true, message: "Login successful", data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
};
```

### **walletController.js**
```javascript
import walletService from "../services/walletService.js";

export const walletController = {
  async getWallet(req, res) {
    try {
      const wallet = await walletService.checkBalance(req.user._id);
      res.json({ success: true, data: wallet });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async topup(req, res) {
    try {
      const { amount, method, description } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Số tiền nạp không hợp lệ" });
      }
      
      const result = await walletService.topup(req.user._id, amount, method, description);
      res.json({ success: true, message: "Nạp tiền thành công", data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
```

## 🔐 **Middleware & Routes**

### **auth.js** - Xác thực JWT
```javascript
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: "Token is not valid" });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};
```

### **Routes**
```javascript
// userRoutes.js
import express from "express";
import { userController } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.getProfile);
export default router;

// walletRoutes.js  
import express from "express";
import { walletController } from "../controllers/walletController.js";
import { auth } from "../middleware/auth.js";
const router = express.Router();
router.get("/", auth, walletController.getWallet);
router.post("/topup", auth, walletController.topup);
export default router;
```

## ⚙️ **Cấu Hình & Khởi Chạy**

### **.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/laundry-system
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
```

### **package.json**
```json
{
  "name": "laundry-system",
  "type": "module",
  "scripts": { "start": "node app.js", "dev": "nodemon app.js" },
  "dependencies": {
    "express": "^4.18.2", "mongoose": "^7.0.0", "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0", "cors": "^2.8.5", "dotenv": "^16.0.3"
  }
}
```

### **app.js** - Ứng dụng chính
```javascript
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);

// Khởi chạy server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(error => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

export default app;
```

## 🎯 **Tính Năng Chính**
- ✅ **Đăng ký/Đăng nhập** với JWT authentication
- ✅ **Quản lý ví tiền** - nạp tiền, trừ tiền, hoàn tiền
- ✅ **Giao dịch an toàn** với database transactions
- ✅ **Clean Architecture** tách biệt concerns
- ✅ **API hoàn chỉnh** cho mobile/web app và ESP32
