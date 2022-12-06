//Express
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

//Helper
const { emailHasUser, getUserByEmail, cookieHasUser, urlsForUser, generateRandomString } = require("./helpers");

//Body Parser
app.use(express.urlencoded({ extended: true }));

//Databases
const urlDatabase = {

};

const users = {

};

//EJS
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['DIOR'],
  maxAge: 24 * 60 * 60 * 1000,
}));

//Routes

app.get("/", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(403).send("Login or Register");
  }
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!cookieHasUser(req.session.user_id, users)) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlDatabase, user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  }
});

//register form
app.get("/register", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_register", templateVars);
  }
});

//login form
app.get("/login", (req, res) => {
  if (cookieHasUser(req.session.user_id, users)) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_login", templateVars);
  }
});

app.get('/urls/:id', (req, res) => {
  const urlID = req.params.id;

  const user_id = req.session.user_id;

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

  const user = users[user_id];

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

//POST
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please include both a valid email and password");
  } else if (emailHasUser(email, users)) {    
    res.status(400).send("An account already exists with this email address");
  } else {
    const newUserID = generateRandomString();
    const userObj = {
      id: newUserID,
      email: email,
      password: bcrypt.hashSync(password, 10),
    };
    users[newUserID] = userObj;
    req.session.user_id = newUserID;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!emailHasUser(email, users)) {
    res.status(403).send("There is no account associated with this email address");
  } else {
    const userID = getUserByEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID].password)) {
      res.status(403).send("The password you entered does not match the one associated with the provided email address");
    } else {
      req.session.user_id = userID;      
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/urls/:id/delete", (req, res) => {
  const userInput = req.params.id;
  if (!urlDatabase[userInput]) {
    return res.status(404).send("ID does not exist");
  }
  if (!req.session.user_id) {
    return res.status(403).send("User is not logged in");
  }
  if (urlDatabase[userInput].userID !== req.session.user_id) {
    return res.status(403).send("User does not own URL");
  }
  delete urlDatabase[userInput];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to a valid account to create short URLS");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("ID does not exist");
  }
  if (!req.session.user_id) {
    return res.status(403).send("User is not logged in");
  }
  if (urlDatabase[shortURL].userID !== req.session.user_id) {
    return res.status(403).send("User does not own URL");
  }
  urlDatabase[shortURL] = req.body.editedLongURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});