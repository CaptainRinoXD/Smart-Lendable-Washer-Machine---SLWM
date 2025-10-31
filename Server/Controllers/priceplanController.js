import pricePlanService from "../Services/pricePlanService.js";

export const pricePlanController = {
  async createPricePlan(req, res) {
    try {
      const { name, ratePerMinute, maxDuration } = req.body;
      if (!name || !ratePerMinute) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
      }

      const pricePlan = await pricePlanService.createPricePlan(req.body);
      res.status(201).json({ success: true, message: "Tạo gói giá thành công", data: pricePlan });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getPricePlans(req, res) {
    try {
      const { page, limit, isActive } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        isActive: isActive === "true",
      };
      const result = await pricePlanService.getPricePlans(options);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getActivePricePlan(req, res) {
    try {
      const pricePlan = await pricePlanService.getActivePricePlan();
      res.json({ success: true, data: pricePlan });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updatePricePlan(req, res) {
    try {
      const { planId } = req.params;
      const pricePlan = await pricePlanService.updatePricePlan(planId, req.body);
      res.json({ success: true, message: "Cập nhật gói giá thành công", data: pricePlan });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deletePricePlan(req, res) {
    try {
      const { planId } = req.params;
      const pricePlan = await pricePlanService.deletePricePlan(planId);
      res.json({ success: true, message: "Xóa gói giá thành công", data: pricePlan });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};