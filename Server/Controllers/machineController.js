import machineService from "../Services/machineService.js";

export const machineController = {
  async createMachine(req, res) {
    try {
      const { name, machineCode, location, mqttTopic } = req.body;
      if (!name || !machineCode || !location || !mqttTopic) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
      }

      const machine = await machineService.createMachine(req.body);
      res.status(201).json({ success: true, message: "Tạo máy thành công", data: machine });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMachines(req, res) {
    try {
      const { page, limit, status, location } = req.query;
      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        location,
      };
      const result = await machineService.getMachines(options);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMachine(req, res) {
    try {
      const { machineId } = req.params;
      const machine = await machineService.getMachine(machineId);
      res.json({ success: true, data: machine });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateMachine(req, res) {
    try {
      const { machineId } = req.params;
      const machine = await machineService.updateMachine(machineId, req.body);
      res.json({ success: true, message: "Cập nhật máy thành công", data: machine });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteMachine(req, res) {
    try {
      const { machineId } = req.params;
      const machine = await machineService.deleteMachine(machineId);
      res.json({ success: true, message: "Xóa máy thành công", data: machine });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async updateMachineStatus(req, res) {
    try {
      const { machineId } = req.params;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: "Thiếu trạng thái" });
      }

      const machine = await machineService.updateMachineStatus(machineId, status);
      res.json({ success: true, message: "Cập nhật trạng thái máy thành công", data: machine });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};