const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;//grab id from address bar
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;//grab id from address bar
  const longURL = urlDatabase[shortURL];// use id to get corresponding value from urlDatabase object
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const id = req.params.id;//grab id from address bar
  const templateVars = {
    id,
    longURL: urlDatabase[id],
    username: req.cookies["username"]
  };
  res.render("registration", templateVars);
});



app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  urlDatabase[id] = longURL;// assign new key value pair into urlDatabase object
  console.log(req.body);
  console.log(urlDatabase);
  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});

//Update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  let longURL = req.body.longURL;
  console.log(req.params);
  console.log(id, longURL);
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  users[id] = { id, email, password };
  console.log(users);
  res.cookie('user_id', req.body.email);

  // console.log(req.body);
  // const longURL = req.body.longURL;
  // urlDatabase[id] = longURL;// assign new key value pair into urlDatabase object

  res.redirect(`/urls`);
});

function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
}
