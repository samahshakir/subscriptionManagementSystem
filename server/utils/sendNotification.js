import nodemailer from "nodemailer";
import User from "../models/userModel.js";

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "lillie31@ethereal.email",
    pass: "K9R5TMVg31YfbBQVJs",
  },
});

// Function to send email notifications
async function sendNotification(userId, message) {
  // Fetch user email from the User model // Ensure you have the User model imported
  const user = await User.findById(userId);

  if (!user || !user.email) {
    console.error("User not found or email not provided:", userId);
    return;
  }

  const mailOptions = {
    from: "samah.shakir.ali@gmail.com",
    to: user.email,
    subject: "Subscription Renewal Reminder",
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

export default sendNotification;
