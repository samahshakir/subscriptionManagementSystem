import cron from "node-cron";
import Subscription from "../models/subscriptionModel.js"; // Adjust the import path as necessary
import sendNotification from "./sendNotification.js"; // You'll need to implement this function

// This function will check for subscriptions that are due to renew soon
async function checkAndNotifySubscriptions() {
  const oneWeekBefore = new Date();
  oneWeekBefore.setDate(oneWeekBefore.getDate() + 7);

  try {
    const subscriptions = await Subscription.find({
      renewalDate: { $lt: oneWeekBefore },
      isActive: "unpaid", // Only notify for active subscriptions
    });

    subscriptions.forEach((subscription) => {
      // Send notification to the user
      sendNotification(
        subscription.userId,
        `Your subscription "${
          subscription.name
        }" is about to renew on ${subscription.renewalDate.toLocaleDateString()}.`
      );
    });
  } catch (error) {
    console.error("Error checking subscriptions:", error);
  }
}

// Schedule the cron job to run daily at 9 AM
cron.schedule("42 12 * * *", () => {
  console.log("Checking for subscriptions to renew soon...");
  checkAndNotifySubscriptions();
});
