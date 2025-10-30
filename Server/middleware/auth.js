import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const auth = async (req, res, next) => {
  try {
    //const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};