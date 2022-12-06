/* Checks if given email corresponds to a user in a given database, returns true or false */
const emailHasUser = function(email, userDatabase) {
  for (let key in userDatabase) {
    if (email === userDatabase[key].email) {
      return email;
    }
  }
  return undefined;
};

const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (email === database[user]['email']) {
      return database[user]['id'];
    }
  }
};

const cookieHasUser = function(cookie, userDatabase) {
  for (const user in userDatabase) {
    if (cookie === user) {
      return true;
    }
  } return false;
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

//Generates a string of 6 random alphanumeric characters
const generateRandomString = () => {
  const alphaNumerical = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += alphaNumerical.charAt(Math.floor(Math.random() * alphaNumerical.length));
  }
  return result;
};

module.exports = {
  emailHasUser,
  getUserByEmail,
  cookieHasUser,
  urlsForUser,
  generateRandomString
};