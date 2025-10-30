import userService from "../Services/userService.js";

export const userController = {
  async register(req, res) {
    try {
      const { username, email, password, phoneNumber } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide all required fields"
        });
      }

      const result = await userService.register({
        username,
        email,
        password,
        phoneNumber
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide email and password"
        });
      }

      const result = await userService.login(email, password);


      res.cookie("jwt", result.token, {
        httpOnly: true,
        //secure: process.env.NODE_ENV === 'production', // Chỉ gửi cookie qua HTTPS trong môi trường production
        sameSite: 'Lax', // Bảo vệ chống CSRF cơ bản
        maxAge: process.env.JWT_EXPIRE 
      });

      res.json({
        success: true,
        message: "Login successful",
        data: result.user
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  async logout(req, res) {
    try{
      await userService.logout(req.user._id);
      // Xóa HttpOnly cookie
      res.clearCookie('jwt', {
        httpOnly: true,
        //secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });

      res.status(200).json({
        success: true,
        message: "Logout successful"
      });

    } catch (error) {
      res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
      });
      res.status(500).json({
        success: false,
        message: error.message || "Failed to log out"
      });
    }
  },

  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user._id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const user = await userService.updateProfile(req.user._id, req.body);
      
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
};