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

var usersData = {'email@email.com': {password: "asfd", urls:{
                  "pppppp": "http://www.lighthouselabs.ca",
                  "9sm5xK": "http://www.google.com" }
                  }
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

// home page
app.get("/", (req, res) => {
  if (req.session.email) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

///show urls created, edit button, delete button, link to add new
app.get("/urls", (req, res) => {
  let currentUserUrls = usersData[req.session.email].urls;
  let templateVars = {urls: currentUserUrls, email: req.session.email};
  res.render("urls_index", templateVars);
});

///submission form for new urls
app.get("/urls/new", (req, res) => {
  let currentUser = req.session.email;
  let currentUserUrls = usersData[currentUser].urls
  let templateVars = {email: currentUser, urls: currentUserUrls};
  res.render("urls_new", templateVars);
});

///
app.post("/urls", (req, res) => {
  let currentUser = req.session.email;
  let currentUserUrls = usersData[currentUser].urls;
  currentUserUrls[generateRandomString()] = req.body.longURL;
  res.redirect('/urls')
});


///url update
app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let email = req.session.email;
  let currentUser = usersData[req.session.email];
  let currentUserUrls = currentUser.urls;
  let templateVars = {shortURL: shortURL,longURL: currentUserUrls[shortURL], email};
  res.render("urls_show", templateVars);
});

///
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userEmail = req.session.email;
  let longURL = usersData[userEmail].urls[shortURL];
  res.redirect(302, `${longURL}`);
});


///delete short and long urls
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  var userEmail = req.session.email;
  delete usersData[userEmail].urls[shortURL];
  res.redirect(302, "/urls");
});

///update long url
app.post("/urls/:id/update", (req, res) => {
  var userEmail = req.session.email;
  var newLongURL = req.body.longURLreplace;
  var shortURL = req.params.id;
  usersData[userEmail].urls[shortURL] = newLongURL;
  res.redirect(302, "/urls");
});

/// login and logout
app.get("/login", (req, res) => {
  if (req.session.email) {
   res.redirect("/urls");
  } else {
   res.render("_login");
  }
});

app.post("/login", (req, res) => {
  var currentEmail = req.body.email;
  if (usersData[currentEmail] && bcrypt.compareSync(req.body.password, usersData[currentEmail].password)) {
   req.session.email = currentEmail;
   res.redirect('/urls');
 } else {
   res.status(401).send("The email or password is incorrect");
   res.redirect('/login');
 }
});

app.post("/logout", (req, res) =>{
  delete req.session.email;
  res.redirect("/");
});


///registration logic
app.get("/register", (req, res) => {
  if (req.session.email) {
    res.redirect("/urls");
  } else {
  res.render("_register");
  }
});

app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("The email or password field is empty. Please try again.");
  }
  else if (searchEmail(usersData, req.body.email)) {
    res.status(400).send("That email is already registered.");
  } else {
   let user_email = req.body.email;
   usersData[user_email] = {password: bcrypt.hashSync(req.body.password, 10), urls:{}};
   req.session.email = user_email
  res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});