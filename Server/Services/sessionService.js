import Session from "../Models/Session.js";
import Machine from "../Models/Machine.js";
import WalletService from "./walletService.js";
import PricePlan from "../Models/PricePlan.js";
import mongoose from "mongoose";

class SessionService {
  async startSession(userId, machineId, washModeIds, pricePlanId = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Kiểm tra máy có sẵn sàng không
      const machine = await Machine.findOne({ machineCode: machineId }).session(session);
      if (!machine) {
        throw new Error("Máy giặt không tồn tại");
      }
      if (machine.status !== "available") {
        throw new Error("Máy giặt không khả dụng");
      }

      // Lấy giá hiện tại
      let pricePlan;
      if (pricePlanId) {
        pricePlan = await PricePlan.findOne({ 
          _id: pricePlanId, 
          isActive: true 
        }).session(session);
        if (!pricePlan) {
          throw new Error("Gói giá không tồn tại hoặc không khả dụng");
        }
      } else {
        pricePlan = await PricePlan.findOne({ isDefault: true }).session(session);
        if (!pricePlan) {
          throw new Error("Không tìm thấy giá dịch vụ");
        }
      }

      // Lấy tổng thời gian từ washModes
      let totalSessDuration = 0;
      const washModes = await WashMode.find({ _id: { $in: washModeIds } }).session(session);
      if (washModes.length !== washModeIds.length) {
        throw new Error("Không tìm thấy chế độ giặt");
      }
      
      for (const mode of washModes) {
        totalSessDuration += mode.duration;
        if (mode.water && mode.water.length > 0 ) {
          for (const waterMode of mode.water) {
            totalSessDuration += waterMode.duration;
          }
        }
      }
      const duration = totalSessDuration;

      // Tính giá
      const rate = pricePlan.ratePerMinute;
      const totalCost = rate * duration;

      // Kiểm tra số dư ví
      const wallet = await WalletService.checkBalance(userId);
      if (wallet.balance < totalCost) {
        throw new Error("Số dư không đủ để bắt đầu phiên");
      }

      // Tạo phiên
      const newSession = new Session({
        machineId: machineId,
        user: userId,
        duration: duration,
        price: rate,
        totalCost: totalCost,
        status: "pending",
        mqttTopic: machine.mqttTopic,
      });
      await newSession.save({ session });

      // Cập nhật máy
      machine.status = "in_use";
      machine.currentSession = newSession._id;
      await machine.save({ session });

      // Trừ tiền
      await WalletService.deduct(
        userId,
        totalCost,
        newSession._id,
        `Thanh toán cho phiên sử dụng máy ${machineId}`
      );

      // Cập nhật trạng thái phiên
      newSession.status = "running";
      newSession.startTime = new Date();
      await newSession.save({ session });

      // TODO: Gửi lệnh đến máy qua MQTT

      await session.commitTransaction();
      return newSession;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async endSession(sessionId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const washingSession = await Session.findById(sessionId).session(session);
      if (!washingSession) {
        throw new Error("Phiên không tồn tại");
      }

      const machine = await Machine.findOne({ machineCode: washingSession.machineId }).session(session);
      if (!machine) {
        throw new Error("Máy giặt không tồn tại");
      }

      // Cập nhật phiên
      washingSession.endTime = new Date();
      washingSession.status = "completed";
      await washingSession.save({ session });

      // Cập nhật máy
      machine.status = "available";
      machine.currentSession = null;
      await machine.save({ session });

      // TODO: Gửi lệnh dừng máy qua MQTT

      await session.commitTransaction();
      return washingSession;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getSession(userId, sessionId) {
    const session = await Session.findOne({ _id: sessionId, user: userId })
      .populate("user", "username email")
      .populate("machineId", "name location");
    if (!session) {
      throw new Error("Phiên không tồn tại");
    }
    return session;
  }

  async getUserSessions(userId, options = {}) {
    const { limit = 20, page = 1, status } = options;
    const skip = (page - 1) * limit;

    const query = { user: userId };
    if (status) query.status = status;

    const sessions = await Session.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("machineId", "name location");

    const total = await Session.countDocuments(query);

    return {
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async cancelSession(userId, sessionId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const washingSession = await Session.findOne({ _id: sessionId, user: userId }).session(session);
      if (!washingSession) {
        throw new Error("Phiên không tồn tại");
      }
      if (washingSession.status !== "pending" && washingSession.status !== "running") {
        throw new Error("Chỉ có thể hủy phiên đang chờ hoặc đang chạy");
      }

      const machine = await Machine.findOne({ machineCode: washingSession.machineId }).session(session);
      if (machine) {
        machine.status = "available";
        machine.currentSession = null;
        await machine.save({ session });
      }

      // Hoàn tiền nếu đã trừ
      if (washingSession.paymentStatus === "paid") {
        await WalletService.refund(
          userId,
          washingSession.totalCost,
          sessionId,
          `Hoàn tiền cho phiên hủy ${sessionId}`
        );
        washingSession.paymentStatus = "refunded";
      }

      washingSession.status = "cancelled";
      washingSession.endTime = new Date();
      await washingSession.save({ session });

      await session.commitTransaction();
      return washingSession;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new SessionService();