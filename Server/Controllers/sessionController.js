import sessionService from "../Services/sessionService.js";

export const sessionController = {
  async startSession(req, res) {
    try {
      const { machineId, washModeIds, pricePlanId } = req.body;
      if (!machineId || !washModeIds || !Array.isArray(washModeIds) || washModeIds.length === 0) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin máy hoặc chế độ giặt" });
      }

      const session = await sessionService.startSession(req.user._id, machineId, washModeIds, pricePlanId);
      res.json({ success: true, message: "Bắt đầu phiên thành công", data: session });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await sessionService.endSession(sessionId);
      res.json({ success: true, message: "Kết thúc phiên thành công", data: session });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getSession(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await sessionService.getSession(req.user._id, sessionId);
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getUserSessions(req, res) {
    try {
      const { page, limit, status } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
      };
      const result = await sessionService.getUserSessions(req.user._id, options);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async cancelSession(req, res) {
    try {
      const { sessionId } = req.params;
      const session = await sessionService.cancelSession(req.user._id, sessionId);
      res.json({ success: true, message: "Hủy phiên thành công", data: session });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};