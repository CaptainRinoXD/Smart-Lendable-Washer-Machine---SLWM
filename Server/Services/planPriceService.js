import PricePlan from "../Models/PricePlan.js";

class PricePlanService {
  async createPricePlan(pricePlanData) {
    try {
      const pricePlan = new PricePlan(pricePlanData);
      await pricePlan.save();
      return pricePlan;
    } catch (error) {
      throw error;
    }
  }

  async getPricePlans(options = {}) {
    const { limit = 20, page = 1, isActive } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (isActive !== undefined) query.isActive = isActive;

    const pricePlans = await PricePlan.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PricePlan.countDocuments(query);

    return {
      pricePlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getActivePricePlan() {
    const pricePlan = await PricePlan.findOne({ isActive: true });
    if (!pricePlan) {
      throw new Error("Không tìm thấy giá dịch vụ đang kích hoạt");
    }
    return pricePlan;
  }

  async updatePricePlan(planId, updateData) {
    const allowedUpdates = ["name", "ratePerMinute", "maxDuration", "isActive"];
    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new Error("Cập nhật không hợp lệ");
    }

    const pricePlan = await PricePlan.findByIdAndUpdate(
      planId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!pricePlan) {
      throw new Error("Gói giá không tồn tại");
    }

    return pricePlan;
  }

  async deletePricePlan(planId) {
    const pricePlan = await PricePlan.findByIdAndDelete(planId);
    if (!pricePlan) {
      throw new Error("Gói giá không tồn tại");
    }
    return pricePlan;
  }
}

export default new PricePlanService();