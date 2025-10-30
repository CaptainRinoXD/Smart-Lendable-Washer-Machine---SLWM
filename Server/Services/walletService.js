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