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