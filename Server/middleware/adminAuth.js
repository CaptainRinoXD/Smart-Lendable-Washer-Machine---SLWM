import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const adminAuth = async (req, res, next) => {
  try {
    //const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.cookies.jwt;
    
    if (!token) return res.status(401).json({ success: false, message: "No token, authorization denied" });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ success: false, message: "Token is not valid" });
    
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token is not valid" });
  }
};