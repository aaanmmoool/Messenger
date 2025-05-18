import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const testUsers = [
  {
    fullName: "Emma Thompson",
    email: "emma.thompson@example.com",
    password: "123456",
    profilePic: "https://avatar.iran.liara.run/public/1"
  },
  {
    fullName: "Olivia Miller",
    email: "olivia.miller@example.com",
    password: "123456",
    profilePic: "https://avatar.iran.liara.run/public/2"
  },
  {
    fullName: "James Anderson",
    email: "james.anderson@example.com",
    password: "123456",
    profilePic: "https://avatar.iran.liara.run/public/3"
  },
  {
    fullName: "William Clark",
    email: "william.clark@example.com",
    password: "123456",
    profilePic: "https://avatar.iran.liara.run/public/4"
  },
  {
    fullName: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    password: "123456",
    profilePic: "https://avatar.iran.liara.run/public/5"
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Delete existing users
    await User.deleteMany({});
    console.log("Deleted existing users");

    // Hash passwords and create users
    const hashedUsers = await Promise.all(
      testUsers.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users
    await User.insertMany(hashedUsers);
    console.log("Test users inserted successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedUsers(); 