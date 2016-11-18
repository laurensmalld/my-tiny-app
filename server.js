'use strict';

var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var bcrypt = require('bcrypt');

var cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

//function that generates random strings to use for short URLS
function generateRandomString() {
  var randomStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
  return randomStr;
}

var users = {"394023lsdklf":{email:"al@sdfj.com",password:'asfd'}};
var urlDatabase = {
  "pppppp": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

var searchEmail = function(obj, query) {
  for (let key in obj) {
    let value = obj[key].email;
    if (value === query) {
    return obj[key];
    }
  } return false;
}

var searchPassword = function(obj, query) {
  for (let key in obj) {
    let value = obj[key].password;
    if (value === query) {
    return obj[key];
    }
  } return false;
}

// start of GETs and POST

// home page
app.get("/", (req, res) => {
  // var templateVars = {};
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//show urls created, edit button, delete button, link to add new
app.get("/urls", (req, res) => {
  let templateVars = {}
  let currentUserId = req.session.user_id;
  console.log(currentUserId);
  if (currentUserId) {
    let currentUserUrls = urlDatabase;
    templateVars = {urls: currentUserUrls, user_id: req.session.user_id, email: users['email']};
  }
  res.render("urls_index", templateVars);
});

//submission form for new urls
app.get("/urls/new", (req, res) => {
  let currentUserId = req.session.user_id;
  // if a current User has no place for urls
  if (!urlDatabase[currentUserId]) {
    // make one for them
    urlDatabase[currentUserId] = {}
  }
  var templateVars = {urls: urlDatabase, user_id: req.session.user_id, email: users[req.session.user_id].email};
  res.render("urls_new", templateVars);
});

// posting new url here
app.post("/urls", (req, res) => {
  let currentUserId = req.session.user_id;
  let currentUserUrls = urlDatabase[currentUserId];
  let newShortURL = generateRandomString()
  currentUserUrls[newShortURL]= req.body.longURL;
  res.redirect('/urls')
});



//url with long version, update and delete buttons
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let currentUserUrls = urlDatabase[req.session.user_id];
  let templateVars = {shortURL:shortURL,longURL:currentUserUrls[shortURL]}
  res.render("urls_show", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  //for each user_id, get the user's urls, get the shortURL from params, find shortURL in database to get its value longURL,
  // redirect to longURL (if it exists, if not tell them it does not exist)
  Object.keys(urlDatabase).forEach(user_id =>{
    var user_urls = urlDatabase[user_id];
    let shortURL = req.params.shortURL;
    var longURL = user_urls[shortURL];
    if (longURL) {
      res.redirect(302, longURL);
    }
  })
  res.redirect(404).send("Page not found");
});

//delete short and long urls
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  var user_urls = urlDatabase[user_id];
  delete user_urls[shortURL];
  res.redirect(302, "/urls");
});

//update long url
app.post("/urls/:id/update", (req, res) => {
  var newLongURL = req.body.longURLreplace;
  var shortURL = req.params.id;
  urlDatabase[shortURL] = newLongURL;
  res.redirect(302, "/urls");
});

// login and logout
app.get("/login", (req, res) => {
  if (!users[req.session.user_id]) {
  res.render("_login");
  } else {
    res.redirect("/");
  }
});

app.post("/login", (req, res) => {
  var user = searchEmail(users, req.body.email);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
   req.session.user_id = user['id'];
   res.redirect('/urls');
 } else {
   res.status(401).send("The email or password is incorrect");
   res.redirect('/login');
 }
});

app.post("/logout", (req, res) =>{
  delete req.session.user_id;
  res.redirect("/");
});


//registration logic
app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/");
  } else {
  res.render("_register");
  }
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("The email or password field is empty. Please try again.");
  }
  else if (searchEmail(users, req.body.email)) {
    res.status(400).send("That email is already registered.");
  } else {
  const user_id = generateRandomString();
  const newUser = {'email': req.body.email, 'password': bcrypt.hashSync(req.body.password, 10)};
  users[user_id]= newUser;
  req.session.user_id = user_id;
  res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});