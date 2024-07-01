// controllers/chatControllers.js

const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

// Create or fetch one-to-one chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User ID not provided");
    return res.sendStatus(400);
  }

  // Find or create a new chat
  let chat = await Chat.findOne({
    isGroupChat: false,
    users: { $all: [req.user._id, userId] },
  }).populate("users", "-password").populate("latestMessage");

  if (chat) {
    res.json(chat);
  } else {
    const newChat = await Chat.create({
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "-password");
    res.json(fullChat);
  }
});

// Fetch all chats for a user
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Populate messages and users for the latest message
    const populatedChats = await Chat.populate(chats, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.json(populatedChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Create a new group chat
const createGroupChat = asyncHandler(async (req, res) => {
  const { users, chatName } = req.body;

  if (!users || !chatName) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  const userList = JSON.parse(users);

  if (userList.length < 2) {
    return res.status(400).send("A group chat must have at least 2 users.");
  }

  userList.push(req.user._id);

  try {
    const newChat = await Chat.create({
      chatName,
      users: userList,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullChat = await Chat.findById(newChat._id).populate("users", "-password").populate("groupAdmin", "-password");
    res.json(fullChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// Rename a group chat
const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  ).populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    return res.status(404).send("Chat not found.");
  }

  res.json(updatedChat);
});

// Add a user to a group chat
const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    { $push: { users: userId } },
    { new: true }
  ).populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    return res.status(404).send("Chat not found.");
  }

  res.json(added);
});

// Remove a user from a group chat
const removeFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  ).populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    return res.status(404).send("Chat not found.");
  }

  res.json(removed);
});

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
