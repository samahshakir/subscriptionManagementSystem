import Subscription from "../models/subscriptionModel.js";
import fs from "fs";
import path from "path";

const createSubscription = async (req, res) => {
  const {
    name,
    cost,
    billingFrequency,
    startDate,
    renewalDate,
    category,
    isActive,
  } = req.body;

  if (!name || !cost || !startDate || !renewalDate || !category || !isActive) {
    res.status(400);
    throw new Error("Please fill in all fields");
  }

  // Get the file path from the request after it is handled by Multer
  const invoiceUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const subscription = await Subscription.create({
    userId: req.user._id,
    name,
    cost,
    billingFrequency,
    startDate,
    renewalDate,
    category,
    isActive,
    invoice: invoiceUrl,
  });

  if (subscription) {
    res.status(201).json(subscription);
  } else {
    res.status(400);
    throw new Error("Invalid subscription data");
  }
};

const getSubscriptions = async (req, res) => {
  const subscriptions = await Subscription.find({ userId: req.user._id });
  res.json(subscriptions);
};

const getSubscriptionById = async (req, res) => {
  const { id } = req.params;

  const subscription = await Subscription.findById(id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (subscription.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formattedSubscription = {
    ...subscription._doc,
    startDate: formatDate(subscription.startDate),
    renewalDate: formatDate(subscription.renewalDate),
  };

  res.json(formattedSubscription);

  // res.json(subscription);
};

const updateSubscription = async (req, res) => {
  const { name, cost, startDate, renewalDate, category, isActive } = req.body;

  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (subscription.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Get the new invoice path if a new file is uploaded
  let invoiceUrl = subscription.invoice;
  if (req.file) {
    invoiceUrl = `/uploads/${req.file.filename}`;
  }

  subscription.name = name || subscription.name;
  subscription.cost = cost || subscription.cost;
  subscription.startDate = startDate || subscription.startDate;
  subscription.renewalDate = renewalDate || subscription.renewalDate;
  subscription.category = category || subscription.category;
  subscription.isActive = isActive || subscription.isActive;
  subscription.invoice = invoiceUrl || subscription.invoice;

  const updatedSubscription = await subscription.save();
  res.json(updatedSubscription);
};

const updateSubscriptionStatus = async (req, res) => {
  try {
    // Find the subscription by ID
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      res.status(404);
      throw new Error("Subscription not found");
    }

    // Check if the user is authorized to update this subscription
    if (subscription.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized to update this subscription");
    }

    // Toggle the `isActive` status
    subscription.isActive =
      subscription.isActive === "paid" ? "unpaid" : "paid";

    // Save the updated subscription to the database
    const updatedSubscription = await subscription.save();

    // Respond with the updated subscription
    res.json(updatedSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSubscription = async (req, res) => {
  const subscription = await Subscription.findById(req.params.id);

  if (!subscription) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  if (subscription.userId.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Delete the file from the server if it exists
  if (subscription.invoice) {
    const filePath = path.join(
      __dirname,
      "..",
      subscription.invoice.replace("/uploads/", "uploads/")
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await subscription.deleteOne();
  res.json({ message: "Subscription removed" });
};

export {
  createSubscription,
  getSubscriptions,
  getSubscriptionById,
  updateSubscription,
  updateSubscriptionStatus,
  deleteSubscription,
};
