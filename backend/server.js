import express from "express";
import * as url from "url";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  authenticateUser,
  addUser,
  getPassword,
  getList,
  sendMessage,
} from "./database.js";

const app = express();
dotenv.config();
const SECRET = process.env.SECRET;
const PORT = process.env.PORT;

// salt for our passwords
const salt = bcrypt.genSaltSync(10);

// static html
const staticPath = url.fileURLToPath(new URL("../frontend", import.meta.url));

// middleware to parse information
app.use(express.json());
// middleware to give visual feedback
app.use((req, res, next) => {
  console.log(`${req.method}  ${req.url} `, req.body);
  next();
});

// serves our static html
app.use(express.static(staticPath));

// fetches our chat data
app.post("/list", (req, res) => {
  const { channelName } = req.body;
  const list = getList(channelName);
  res.send(list);
});

// posts our new user data
app.post("/register", (req, res) => {
  const { name, password } = req.body;
  // stores the hashed ver. of the user inputted password 
  let hashedPassword = bcrypt.hashSync(password, salt);
  addUser(name, hashedPassword);
});


// signs jwt
function createToken(name, password) {
  const user = { name: name, password: password };
  const token = jwt.sign(user, process.env.SECRET, { expiresIn: "1h" });
  user.token = token;
  console.log("createToken", user);
  return user;
}

app.post("/login", (req, res) => {
  const { name, password } = req.body;
  // fetches hashed password
  const secretPassword = getPassword(name);
  // compares hashed password to user inputted password
  let passwordCheck = bcrypt.compareSync(password, secretPassword.password);

  if (passwordCheck === true) {
    if (authenticateUser(name, secretPassword.password)) {
      const userToken = createToken(name, password);
      res.status(200).send(userToken);
    } else {
      res.sendStatus(401);
      return;
    }
  }
});


// posts chat message data
app.post("/chat", (req, res) => {
  const { sender, message, channel } = req.body;
  const updateChat = sendMessage(sender, message, channel);
  res.send(updateChat);
});

export { app };
