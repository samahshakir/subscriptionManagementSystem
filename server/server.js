import express from "express";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/userRoute.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import https from "https";
import fs from "fs";
import "./utils/cronJobs.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set in the environment variables");
  process.exit(1);
}

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  cors({
    origin: "https://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Load SSL Certificates
const sslOptions = {
  key: fs.readFileSync("./localhost+2-key.pem"), // Path to your private key
  cert: fs.readFileSync("./localhost+2.pem"), // Path to your certificate
};

// Start HTTPS Server
const PORT = process.env.PORT || 5000;
https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
