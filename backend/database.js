import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

// our lowdb database
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

await db.read(db.data);
const userData = db.data.userData;
// wasn't able to get the hang of how to store and use these in db.json, so i made regular arrays instead
const publicMessages = [
  {
    sender: "The moderator. ",
    message:
      "Hey! We have a few rules: 1. No politics. 2. No hate speech. 3. No harassment. ",
    date: new Date(),
  },
];
const privateMessages = [
  {
    sender: "John ",
    message: "hello guys ",
    date: new Date(),
  },
];

// when you click on a chatroom, this returns the data for the chat
function getList(channelName) {
  if (channelName == "public") {
    return publicMessages;
  } else if (channelName == "private") {
    return privateMessages;
  }
}

// stores new userdata in lowdb, while also making sure not to accept duplicate usernames
async function addUser(name, password) {
  if (userData.find((user) => user.name == name)) {
    return;
  } else {
    db.data.userData.push({
      name: name,
      password: password,
    });
    await db.write();
  }
}

// used this to compare the user inputted password vs the hashed ver.
function getPassword(userName) {
  const found = userData.find((user) => user.name == userName);

  return found;
}

// checks to see whether the credentials are legal
function authenticateUser(userName, password) {
  const found = userData.find(
    (user) => user.name == userName && user.password === password
  );

  return Boolean(found);
}

// updates chat data
function sendMessage(sender, message, channel) {
  if (channel == "public") {
    publicMessages.push({
      sender: sender,
      message: message,
      date: new Date(),
    });

    return publicMessages;
  } else if (channel == "private") {
    privateMessages.push({
      sender: sender,
      message: message,
      date: new Date(),
    });

    return privateMessages;
  }
}

export { authenticateUser, addUser, getPassword, getList, sendMessage };
