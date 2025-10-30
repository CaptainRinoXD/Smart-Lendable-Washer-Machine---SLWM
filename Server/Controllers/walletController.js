import walletService from "../Services/walletService.js";

const walletController = {
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
        return res.status(400).json({ 
          success: false, 
          message: "Số tiền nạp không hợp lệ" 
        });
      }

      const result = await walletService.topup(
        req.user._id, 
        amount, 
        method, 
        description
      );
      
      res.json({ 
        success: true, 
        message: "Nạp tiền thành công",
        data: result 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getTransactions(req, res) {
    try {
      const { limit, page, type } = req.query;
      
      const result = await walletService.getTransactionHistory(req.user._id, {
        limit: parseInt(limit) || 20,
        page: parseInt(page) || 1,
        type
      });
      
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};

export default walletController;