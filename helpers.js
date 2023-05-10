const bcrypt = require("bcryptjs");

function generateRandomString() {
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
  }
  return result;
}


const getUserByEmail = (email, users) => {
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

const checkUserPassword = (password, users) => {
  for (const userId in users) {
    if (bcrypt.compareSync(password, users[userId].password)) {
      return true;
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

function urlsForUser(id, urlDatabase) {
  let usersURLs = {};
  for (const shortUrlId in urlDatabase) {
    if (urlDatabase[shortUrlId].userID == id) {
      usersURLs[shortUrlId] = urlDatabase[shortUrlId].longURL;
    }
  }
  return usersURLs;
}

module.exports = { confirmId, urlsForUser, getUserId, checkUserPassword, getUserByEmail, generateRandomString };