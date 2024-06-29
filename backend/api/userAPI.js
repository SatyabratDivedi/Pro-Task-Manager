const express = require("express");
const route = express();
const bcrypt = require("bcrypt");
const userModel = require("../models/userSchema");
const assignUserModel = require("../models/assignUserSchema");
var jwt = require("jsonwebtoken");

route.post("/sign-up", async (req, res) => {
  const {name, email, password} = req.body;
  const isExist = await userModel.findOne({email});
  try {
    if (!name || !email || !password) {
      return res.status(400).json({msg: "fill all the details"});
    }
    if (isExist && isExist.password) {
      return res.status(409).json({msg: "user email already exist"});
    }
    if (isExist && isExist.password == "") {
      bcrypt.hash(password, 10, async (err, hash) => {
        isExist.name = name;
        isExist.password = hash;
        await isExist.save();
      });
      console.log("new user save jo assing tha phle se huaa");
      return res.status(200).json({msg: "user account created"});
    }
    bcrypt.hash(password, 10, async (err, hash) => {
      await userModel({name, email, password: hash}).save();
      console.log("new user save huaa");
      return res.status(200).json({msg: "user account created"});
    });
  } catch (error) {
    return res.status(404).send({msg: "something went wrong"});
  }
});
route.post("/sign-in", async (req, res) => {
  const {email, password} = req.body;
  const isExist = await userModel.findOne({email});
  try {
    if (!isExist) {
      console.log("this user is not avalable");
      return res.status(404).json({msg: "invlaid access"});
    }
    bcrypt.compare(password, isExist.password, (err, result) => {
      if (result) {
        console.log("user login ho gya");
        var token = jwt.sign({user: isExist}, "shhh");
        console.log(token);
        res.cookie("user_token", token).status(202).json({msg: "login successfully", user: isExist});
      } else {
        console.log("password galat hai bhai");
        return res.status(404).json({msg: "invlaid access"});
      }
    });
  } catch (error) {
    return res.status(404).send({msg: "something went wrong"});
  }
});

route.post("/addAssignUser", authCheck, async (req, res) => {
  const {email} = req.body;
  try {
    const whoAssigned = await userModel.findById(req.user._id).populate("assignedUsers");
    const isAlreadyAssign = whoAssigned.assignedUsers.find((user) => user.email == email);
    if (email == whoAssigned.email) {
      return res.status(409).json({msg: "you can't assign yourself"});
    }
    if (isAlreadyAssign) {
      console.log("user already assign hai");
      return res.status(409).json({msg: "this user has already assign by you"});
    }
    // const assignUserInMainUser = await userModel.findOne(email)
    const assignNewUser = await assignUserModel({email}).save();
    await userModel.findByIdAndUpdate(whoAssigned._id, {$push: {assignedUsers: assignNewUser._id}}, {new: true});
    const newUserThoughAssign = await userModel({name: "", username: "", email, password: ""}).save();
    console.log("newUserThoughAssign: ", newUserThoughAssign);
    console.log("new user assign huaa");
    return res.status(200).json({msg: "assign user created successfully"});
  } catch (error) {
    console.error("An error occurred: ", error);
    return res.status(500).json({msg: "An error occurred"});
  }
});

route.get("/getLoginUserDetails", authCheck, async (req, res) => {
  const findLoginUser = await userModel.findById(req.user._id).populate("assignedUsers");
  return res.status(200).json({user: findLoginUser});
});

route.get("/logout", authCheck, (req, res) => {
  try {
    if (req.user) {
      console.log("logout huaa");
      return res.cookie("user_token", "").status(200).json({msg: "logout successfully"});
    }
  } catch (error) {
    return res.status(404).json({msg: "unauthorized! can't access without login"});
  }
});

function authCheck(req, res, next) {
  const token = req.cookies.user_token;
  if (!token) {
    return res.status(401).json({msg: "unauthorized! please login first"});
  }
  try {
    const user = jwt.verify(token, "shhh");
    req.user = user.user;
    next();
  } catch (error) {
    return res.status(401).json({msg: "Token is invalid or expired"});
  }
}

module.exports = route;
