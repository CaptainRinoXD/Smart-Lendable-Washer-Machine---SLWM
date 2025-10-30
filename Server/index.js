import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDb from './database/db.js';
import initRoutes from './Routes/index.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

//database Connection
connectDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//Routes 
initRoutes(app);

// Health check
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



