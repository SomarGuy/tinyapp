//Express
const { response, request } = require("express");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')
app.use(cookieParser())
// default port 8080
const PORT = 8080;

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Body Parser
app.use(express.urlencoded({ extended: true }));

//EJS
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Generates a string of 6 random alphanumeric characters
const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]
};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]
};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userInput = req.params.id
  const templateVars = { id: userInput, longURL: urlDatabase[userInput], username: req.cookies["username"],
};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

//login form
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

//register form
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:id/delete", (req, res) => {
  const userInput = req.params.id;
    delete urlDatabase[userInput];
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let id = generateRandomString()
  urlDatabase[id] = req.body.longURL;
  response.redirect(`/urls/${id}`);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.editedLongURL;
  res.redirect("/urls");
});

const userIdFromEmail = function(email, userDatabase) {
  for (const user in userDatabase) {
    if (userDatabase[user].email === email) {
      return userDatabase[user].id;
    }
  }
};

const emailHasUser = function(email, userDatabase) {
  for (let key in userDatabase) {
    if (email === userDatabase[key].email) {
      return email;
    }
  }
  return undefined;
};

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("There is no account associated with this email address");
  } else {
    const userID = userIdFromEmail(email, users);
    if (password !== users[userID].password) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
      res.cookie('user_id', userID);      
      res.redirect("/urls");
    }
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(email, users)) {    res.status(400).send("An account already exists with this email address");
  } else {
    const newUserID = generateRandomString();
    const userObj = {
      id: newUserID,
      email: email,
      password: password
    };
    users[newUserID] = userObj;
    res.cookie("user_id", newUserID);
    res.redirect("/urls");
  }
});


