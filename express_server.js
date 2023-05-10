const { confirmId, urlsForUser, getUserId, checkUserPassword, getUserByEmail, generateRandomString } = require("./helpers");


const express = require("express");
const app = express();
// const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const e = require("express");
const bcrypt = require("bcryptjs");
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  sgq3y6: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  sgq3y5: {
    longURL: "https://www.msn.ca",
    userID: "user2ID",
  },
};
console.log(urlDatabase);

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "fakeemail@email.com",
    password: bcrypt.hashSync("pass", 10),
  },
  user2ID: {
    id: "user2ID",
    email: "user2@example.com",
    password: bcrypt.hashSync("pass", 10),
  },
};
console.log(users);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());//*******
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  const templateVars = {
    users,
    user_id
  };

  if (!user_id) {// redirecrt to get login if the cookie doesn't exist
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;//grab id from address bar
  const user_id = req.session.user_id;
  if (!user_id) {
    res.send("<html><head><title>Error</title></head><body><h1>🛑🛑🛑You need to be logged in!! 🛑🛑🛑</h1></body></html>");
  } else if (!confirmId(id, urlDatabase)) {
    res.send("<html><head><title>Error</title></head><body><h1>🛑This url does not exist 🛑</h1></body></html>");
  } else if (!urlsForUser(user_id, urlDatabase)[id]) {
    res.send("<html><head><title>Error</title></head><body><h1>🛑This url does not belong to you </h1></body></html>");
  } else {
    const templateVars = {
      id,
      user_id,
      users,
      longURL: urlDatabase[id].longURL,
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  console.log("get /urls", user_id);
  // console.log(users);
  // console.log(urlDatabase);
  console.log("get /urls session", req.session);
  const templateVars = {
    urls: urlsForUser(user_id, urlDatabase),
    users,
    user_id
  };
  if (!user_id) {// display error if user is not logged in
    res.send("<html><head><title>Error</title></head><body><h1>🤚🤚You need to be logged in to access My URL's 🚫🚏</h1></body></html>");
  } else {

    res.render("urls_index", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;//grab id from address bar
  if (!confirmId(shortURL, urlDatabase)) {
    res.status(404).send('<html><head><title>Error</title></head><body><h1>Not found</h1><p>The URL you requested could not be found.</p></body></html>');
  } else {
    const longURL = urlDatabase[shortURL].longURL;// use id to get corresponding value from urlDatabase object
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const user_id = req.session.user_id;//check if user is logged in by checking for cookie
  // if already registered then go to /urls
  if (user_id) {
    const id = req.params.id;//grab id from address bar
    const templateVars = {
      id,
      longURL: urlDatabase[id].longURL,
      user_id: req.session["user_id"]
    };
    res.redirect(`/urls`, templateVars);
  } else {
    const templateVars = {
      user_id: req.session["user_id"]
    };
    res.render("registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  const user_id = req.session.user_id;// check if user is logged in by verifying cookie
  // if already registered then go to /urls
  console.log('get/login user id', user_id);
  if (user_id) {
    const id = req.params.id;//grab id from address bar
    const templateVars = {
      id,
      longURL: urlDatabase[id].longURL,
      user_id: req.session["user_id"]
    };
    res.redirect(`/urls`, templateVars);
  } else {
    const templateVars = {
      user_id: req.session["user_id"]
    };
    res.render("login", templateVars);
  }
});



app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  const user_id = req.session.user_id;
  console.log(urlDatabase);
  console.log(req.body);
  urlDatabase[id] = { "longURL": longURL, "userID": user_id };// assign new key value pair into urlDatabase object
  if (!user_id) {
    return res.send("You need to be logged in to perform this action!!😎 ");
  }
  console.log(urlDatabase);

  res.redirect(`/urls/${id}`);
});

//Edit
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  let longURL = req.body.longURL;
  if (!urlsForUser(user_id, urlDatabase)[id]) {
    res.send("<html><head><title>Error</title></head><body><h1>🤚🤚You do not have permission to edit </h1></body></html>");
  } else {
    urlDatabase[id].longURL = longURL;
    res.redirect("/urls");
  }
});

//Delete
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user_id = req.session.user_id;
  if (!user_id) {
    return res.send("You need to be logged in to delete!!😎 ");
  } else if (!urlsForUser(user_id, urlDatabase)[shortURL]) {
    res.send("<html><head><title>Error</title></head><body><h1>🤚🤚You do not have permission to delete Url!! </h1></body></html>");
  } else if (!confirmId(shortURL, urlDatabase)) {
    res.send("<html><head><title>Error</title></head><body><h1>🤚🤚 You cannot delete a URL that does not exist!! </h1></body></html>");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});


app.post("/logout", (req, res) => {
  // res.clearCookie('user_id');
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || password === '') {
    return res.status(400).send("Error 400 - Please provide valid email and/or password");
  } else if (getUserByEmail(email, users)) {
    return res.status(400).send("Error 400 - Email already exists");
  } else {
    users[id] = { id, email, password };
    // res.cookie('user_id', users[id].id);
    req.session.user_id = users[id].id;
    console.log(users);
    console.log("/register - session", req.session.user_id);

  }
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(email, password);
  const user_id = getUserId(email, users);
  console.log("user_id", user_id);
  if (email === '' || password === '') {
    return res.status(400).send("Error 400 - Please provide valid email and/or password");
  }
  if (!getUserByEmail(email, users)) {
    return res.status(403).send("Error 403 - User Not Found");
  }
  if (getUserByEmail(email, users)) {
    if (checkUserPassword(password, users)) {
      // res.cookie('user_id', users[user_id].id);
      req.session.user_id = users[user_id].id;
    }
    // return res.status(400).send("Error 400 - Email already exists");
  } else {
    return res.status(403).send("Error 403 - Incorrect Password!!");
  }
  res.redirect(`/urls`);
});