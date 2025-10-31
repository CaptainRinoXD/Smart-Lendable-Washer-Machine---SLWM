import Machine from "../Models/Machine.js";

class MachineService {
  async createMachine(machineData) {
    try {
      const machine = new Machine(machineData);
      await machine.save();
      return machine;
    } catch (error) {
      throw error;
    }
  }

  async getMachines(options = {}) {
    const { limit = 20, page = 1, status, location } = options;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (location) query.location = new RegExp(location, "i");

    const machines = await Machine.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .populate("currentSession");

    const total = await Machine.countDocuments(query);

    return {
      machines,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getMachine(machineId) {
    const machine = await Machine.findOne({ machineCode: machineId })
      .populate("currentSession");
    if (!machine) {
      throw new Error("Máy giặt không tồn tại");
    }
    return machine;
  }

  async updateMachine(machineId, updateData) {
    const allowedUpdates = ["name", "location", "status", "mqttTopic"];
    const updates = Object.keys(updateData);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      throw new Error("Cập nhật không hợp lệ");
    }

    const machine = await Machine.findOneAndUpdate(
      { machineCode: machineId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!machine) {
      throw new Error("Máy giặt không tồn tại");
    }

    return machine;
  }

  async deleteMachine(machineId) {
    const machine = await Machine.findOneAndDelete({ machineCode: machineId });
    if (!machine) {
      throw new Error("Máy giặt không tồn tại");
    }
    return machine;
  }

  async updateMachineStatus(machineId, status) {
    const machine = await Machine.findOne({ machineCode: machineId });
    if (!machine) {
      throw new Error("Máy giặt không tồn tại");
    }

    machine.status = status;
    machine.lastSeen = new Date();
    await machine.save();

    return machine;
  }
}

export default new MachineService();