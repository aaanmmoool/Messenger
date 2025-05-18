import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io, userSocketMap } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Convert IDs to strings for consistent comparison
    const receiverIdStr = receiverId.toString();
    const senderIdStr = senderId.toString();

    // Get socket IDs for both sender and receiver
    const receiverSocketId = getReceiverSocketId(receiverIdStr);
    const senderSocketId = getReceiverSocketId(senderIdStr);

    console.log("Socket mappings before sending:", {
      receiverId: receiverIdStr,
      senderId: senderIdStr,
      receiverSocketId,
      senderSocketId,
      allMappings: userSocketMap
    });

    // Emit to both sender and receiver
    if (receiverSocketId) {
      console.log("Emitting to receiver:", { receiverId: receiverIdStr, receiverSocketId });
      io.to(receiverSocketId).emit("newMessage", newMessage);
    } else {
      console.log("Receiver not connected:", receiverIdStr);
    }

    if (senderSocketId) {
      console.log("Emitting to sender:", { senderId: senderIdStr, senderSocketId });
      io.to(senderSocketId).emit("newMessage", newMessage);
    } else {
      console.log("Sender not connected:", senderIdStr);
    }

    // Log for debugging
    console.log("Message sent:", {
      messageId: newMessage._id,
      senderId: senderIdStr,
      receiverId: receiverIdStr,
      receiverSocketId,
      senderSocketId
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
