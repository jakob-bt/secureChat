// assigning all of my id's to variables so that the code is more readable
const btnLogin = document.querySelector("#btnLogin");
const btnLogout = document.querySelector("#btnLogout");
const btnRegister = document.querySelector("#btnRegister");
const inputUsername = document.querySelector("#inputUsername");
const inputPassword = document.querySelector("#inputPassword");
const btnSend = document.querySelector("#send");
const chatInput = document.querySelector("#chatInput");
const channelHeader = document.querySelector("#channelHeader");
const publicMessages = document.querySelector("#publicMessages");
const privateChannel = document.querySelector("#privateChannel");
const privateMessages = document.querySelector("#privateMessages");

// this variable dictates which buttons are enabled / disabled
let isLoggedIn = false;

// not sure how to log in directly with jwt, so instead putting the userToken in localstorage
// not sure whether this would be at all safe in a practical scenario
function checkLogin() {
  if (localStorage.getItem("JWT_KEY")) {
    document.getElementById("inputUsername").value =
      localStorage.getItem("userName");
    document.getElementById("inputPassword").value =
      localStorage.getItem("password");
    btnLogin.click();
  }
}

// every time login / logout is pressed
function updateLoginStatus() {
  btnLogin.disabled = isLoggedIn;
  btnLogout.disabled = !isLoggedIn;
  privateChannel.disabled = !isLoggedIn;
}

// if and else if do the same thing, but with a different string variable
async function changeChannel(channelName) {
  if (channelName === "public") {
    //to prevent entries from getting registered multiple times in one click
    while (publicMessages.hasChildNodes()) {
      publicMessages.removeChild(publicMessages.firstChild);
    }

    // alternates between chat channels
    publicMessages.isActive = true;
    privateMessages.isActive = false;
    channelHeader.innerHTML = "Public";
    privateMessages.style.display = "none";
    publicMessages.style.display = "block";

    const choice = { channelName: "public" };

    const options = {
      method: "POST",
      body: JSON.stringify(choice),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("/list", options);
    if (response.status == 200) {
      const result = await response.json();
      console.log(result);

      // appends new entries into chat
      for (i = 0; i < result.length; i++) {
        console.log(i, result.length);
        const li = document.createElement("li");
        const message = document.createTextNode(result[i].message);
        const sender = document.createTextNode(" Sent by: " + result[i].sender);
        const date = document.createTextNode(
          ". Delivered on: " + result[i].date
        );
        li.appendChild(message);
        li.appendChild(sender);
        li.appendChild(date);
        publicMessages.appendChild(li);
      }
    }
  } else if (channelName === "private") {
    while (privateMessages.hasChildNodes()) {
      privateMessages.removeChild(privateMessages.firstChild);
    }

    publicMessages.isActive = false;
    privateMessages.isActive = true;
    channelHeader.innerHTML = "Private";
    privateMessages.style.display = "block";
    publicMessages.style.display = "none";

    const choice = { channelName: "private" };

    const options = {
      method: "POST",
      body: JSON.stringify(choice),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("/list", options);
    if (response.status == 200) {
      const result = await response.json();
      console.log(result);

      for (i = 0; i < result.length; i++) {
        const li = document.createElement("li");
        const message = document.createTextNode(result[i].message);
        const sender = document.createTextNode(" Sent by: " + result[i].sender);
        const date = document.createTextNode(
          ". Delivered on: " + result[i].date
        );
        li.appendChild(message);
        li.appendChild(sender);
        li.appendChild(date);
        privateMessages.appendChild(li);
      }
    }
  }
}

btnRegister.addEventListener("click", async () => {
  const user = {
    name: inputUsername.value,
    password: inputPassword.value,
  };

  const options = {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      "Content-Type": "application/json",
    },
  };
  // sends POST request to the server and adds the new user, assuming the username is not taken
  await fetch("/register", options);
});

btnLogin.addEventListener("click", async () => {
  const user = {
    name: inputUsername.value,
    password: inputPassword.value,
  };

  // "Optimistisk" kod
  const options = {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      // MIME type: application/json
      "Content-Type": "application/json",
    },
  };
  const response = await fetch("/login", options);
  if (response.status === 200) {
    // if the username and password matches, give them a jwt and update the UI
    console.log("Login successful");
    const userToken = await response.json();
    localStorage.setItem("JWT_KEY", userToken.token);
    localStorage.setItem("userName", userToken.name);
    localStorage.setItem("password", userToken.password);
    isLoggedIn = true;
  } else {
    console.log("Incorrect username or password.");
    return;
  }
  updateLoginStatus();
});

async function sendMessage() {
  // if you have a chatroom targeted, update the chat
  if (Boolean(publicMessages.isActive) == true) {
    const message = {
      sender: localStorage.getItem("userName"),
      message: chatInput.value,
      channel: "public",
    };

    const options = {
      method: "POST",
      body: JSON.stringify(message),
      headers: {
        "Content-Type": "application/json",
      },
    };
    const response = await fetch("/chat", options);
    if (response.status == 200) {
      // refresh UI
      changeChannel("public");
    }
  } else if (Boolean(privateMessages.isActive) == true) {
    // in case the user logs out after entering private, their message is not sent
    if (!isLoggedIn) {
      return;
    } else {
      const message = {
        sender: localStorage.getItem("userName"),
        message: chatInput.value,
        channel: "private",
      };

      const options = {
        method: "POST",
        body: JSON.stringify(message),
        headers: {
          "Content-Type": "application/json",
        },
      };
      const response = await fetch("/chat", options);
      if (response.status == 200) {
        changeChannel("private");
      }
    }
  }
}

// removes JWT / localstorage on logout
btnLogout.addEventListener("click", async () => {
  if (isLoggedIn === true) {
    localStorage.clear();
    isLoggedIn = false;
    updateLoginStatus();
  }
});
