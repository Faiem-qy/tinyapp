const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const e = require("express");
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
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
  i4ZoGp: {
    longURL: "https://www.msn.ca",
    userID: "user2ID",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "fakeemail@email.com",
    password: "123",
  },
  user2ID: {
    id: "user2ID",
    email: "user2@example.com",
    password: "1234",
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
  const user_id = req.cookies.user_id;
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
  const user_id = req.cookies.user_id;
  const templateVars = {
    id,
    user_id,
    users,
    longURL: urlDatabase[id].longURL,
  };
  if (!user_id) {
    res.send("<html><head><title>Error</title></head><body><h1>🛑🛑🛑You need to be logged in!! 🛑🛑🛑</h1></body></html>");
  } else {
    res.render("urls_show", templateVars);
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    urls: urlsForUser(user_id),
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
  const longURL = urlDatabase[shortURL].longURL;// use id to get corresponding value from urlDatabase object
  if (!confirmId(shortURL, urlDatabase)) {
    res.status(404).send('<html><head><title>Error</title></head><body><h1>Page not found</h1><p>The page you requested could not be found.</p></body></html>');
  } else {
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const user_id = req.cookies.user_id;//check if user is logged in by checking for cookie
  // if already registered then go to /urls
  if (user_id) {
    const id = req.params.id;//grab id from address bar
    const templateVars = {
      id,
      longURL: urlDatabase[id].longURL,
      user_id: req.cookies["user_id"]
    };
    res.redirect(`/urls`, templateVars);
  } else {
    const templateVars = {
      user_id: req.cookies["user_id"]
    };
    res.render("registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  const user_id = req.cookies.user_id;// check if user is logged in by verifying cookie
  // if already registered then go to /urls
  if (user_id) {
    const id = req.params.id;//grab id from address bar
    const templateVars = {
      id,
      longURL: urlDatabase[id].longURL,
      user_id: req.cookies["user_id"]
    };
    res.redirect(`/urls`, templateVars);
  } else {
    const templateVars = {
      user_id: req.cookies["user_id"]
    };
    res.render("login", templateVars);
  }
});



app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const id = generateRandomString();
  const user_id = req.cookies.user_id;
  console.log(urlDatabase);
  console.log(req.body);
  urlDatabase[id] = { "longURL": longURL, "userID": user_id };// assign new key value pair into urlDatabase object
  if (!user_id) {
    return res.send("You need to be logged in to perform this action!!😎 ");
  }
  console.log(urlDatabase);

  res.redirect(`/urls/${id}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  console.log(req.params);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Update
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  let longURL = req.body.longURL;
  console.log(req.params);
  console.log(id, longURL);
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    return res.status(400).send("Error 400 - Please provide valid email and/or password");
  } else if (getUserByEmail(email)) {
    return res.status(400).send("Error 400 - Email already exists");
  } else {
    users[id] = { id, email, password };
    res.cookie('user_id', users[id].id);

  }
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = getUserId(email, users);
  console.log("user_id", user_id);
  if (email === '' || password === '') {
    return res.status(400).send("Error 400 - Please provide valid email and/or password");
  }
  if (!getUserByEmail(email)) {
    return res.status(403).send("Error 403 - User Not Found");
  }
  if (getUserByEmail(email)) {
    if (checkUserPassword(password) === password) {
      res.cookie('user_id', users[user_id].id);
    }
    // return res.status(400).send("Error 400 - Email already exists");
  } else {
    return res.status(403).send("Error 403 - Incorrect Password!!");
  }
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


const getUserByEmail = (email) => {
  //loop through the object using a for of loop
  for (const userId in users) {
    if (users[userId].email === email) {
      return users;
    }
  }
  //if object.key(email) is equal to req.body.email
  //then return the entire user object
  //else return null
  return null;
};

const checkUserPassword = (password) => {
  for (const userId in users) {
    if (users[userId].password === password) {
      return password;
    }
  }
  return null;
};

function getUserId(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user].id;
    }
  }
  return false;
}


function confirmId(id, db) {
  for (const key in db) {
    if (key === id) {
      return true;
    }
  }
  return false;
}

function urlsForUser(id) {
  let usersURLs = {};
  for (const shortUrlId in urlDatabase) {
    if (urlDatabase[shortUrlId].userID == id) {
      usersURLs[shortUrlId] = urlDatabase[shortUrlId].longURL;
    }
  }
  return usersURLs;
}