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
    password: "purdinosaurple-monkey-",
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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  if (!req.cookies["user_id"]) {
    return res.status(403).send("Login or Register");
  }
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"], urlDatabase),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!cookieHasUser(req.cookies["user_id"], users)) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]
};
  res.render("urls_new", templateVars);
  }
});

app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;

  const user_id = req.cookies['user_id'];

    // non user tries to access short URL
    if (!user_id) {
      return res.status(403).send('Please login');
    }

  // if url doesn't exist
  if (!urlDatabase[urlID]) {
    return res.status(404).send('This URL does not exist, please enter a valid URL');
  }

  // User other than the owner of the URL tries to access short URL
  if (users[user_id].id !== urlDatabase[urlID].userID) {
    return res.status(403).send('You are forbidden.');
  }

  const longURL = urlDatabase[urlID].longURL;

  const user = users[user_id]

  const templateVars = {
    user,
    id: urlID,
    longURL,
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(404).send("The short URL you are trying to access does not correspond with a long URL at this time.");
  }
});

//login form
app.get("/login", (req, res) => {
  if (cookieHasUser(req.cookies["user_id"], users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_login", templateVars);
  }
});

//register form
app.get("/register", (req, res) => {
  if (cookieHasUser(req.cookies["user_id"], users)) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//POST

app.post("/urls/:id/delete", (req, res) => {
  const userInput = req.params.id;
  if (!urlDatabase[userInput]) {
    return res.status(404).send("ID does not exist");
  }
  if (!req.cookies["user_id"]) {
    return res.status(403).send("User is not logged in");
  }
  if (urlDatabase[userInput].userID !== req.cookies["user_id"]) {
    return res.status(403).send("User does not own URL");
  }
    delete urlDatabase[userInput];
    res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"],
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLS")
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("ID does not exist");
  }
  if (!req.cookies["user_id"]) {
    return res.status(403).send("User is not logged in");
  }
  if (urlDatabase[shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).send("User does not own URL");
  }
  urlDatabase[shortURL] = req.body.editedLongURL;
  res.redirect("/urls");
});

//Helper
const cookieHasUser = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
};

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

const urlsForUser = function(id, urlDatabase) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
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