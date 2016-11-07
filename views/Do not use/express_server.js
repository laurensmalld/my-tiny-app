var express = require("express");
var app = express();

app.set("view engine", "ejs");


var cookieSession = require('cookie-session');
app.use(cookieSession());


var PORT = process.env.PORT || 8080; // default port 8080

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

var bcrypt = require('bcrypt');
var password = req.params.password; // you will probably this from req.params
var hashed_password = bcrypt.hashSync(password, 10);

var urlDatabase = {
  "pppppp": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


function generateRandomString() {
  var randomStr = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
  return randomStr;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  var templateVars = { urls: urlDatabase};
  req.session.user_id;
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  req.session.user_id = "urls";
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (searchEmail(users, req.body.email) && (bcrypt.compareSync("purple-monkey-dinosaur", hashed_password)) {
  urlDatabase[generateRandomString()] = req.body.addedLongURL;
  res.redirect('/urls');
  } else {
    res.redirect('/');
  }
});

app.get("/urls/:id", (req, res) => {
  var longURL = urlDatabase[req.params.id];
  var templateVars = { shortURL: req.params.id, website: longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL];
  res.redirect(302, longURL);
});

//delete short and long urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(302, "/urls");
});

//update long url
app.post("/urls/:id/update", (req, res) => {
  var longURLreplace = req.body.longURLreplace;
  var id = req.params.id;
  urlDatabase[id] = longURLreplace;
  res.redirect(302, "/urls");
});

// login and logout
app.get("/login", (req, res) => {
  res.render("_login");
});

var searchPassword = function(obj, query) {
  for (let key in obj) {
    let value = obj[key].password;
    if (value === query) {
    return obj[key];
    }
  } return null
}

app.post("/login", (req, res) => {
  if (searchEmail(users, req.body.email) && (bcrypt.compareSync(req.body.password, hashed_password)) {
   req.session.user_id = "login";
   res.redirect('/urls');
 } else {
   res.status(403).send("The email or password is incorrect");
 }
});

app.post("/logout", (req, res) =>{
  res.clearCookie(req.session.user_id);
  res.redirect(302, "/");
});

//register user
var users = {};

app.get("/register", (req, res) => {
  res.render("_register");
});

//search within the users objects for specific email login
var searchEmail = function(obj, query) {
  for (key in obj) {
    var value = obj[key].email;
    if (value === query) {
      return obj[key];
    }
  } return null;
}

//registration logic
app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("The email or password field is empty. Please retry.");
  }
  else if (searchEmail(users, req.body.email)) {
    res.status(400).send("That email is already registered.");
  } else {
  var randomID = generateRandomString();
  users[randomID] = {id: randomID, email: req.body.email, password: req.body.password};
  req.session.user_id = "register";
  res.redirect(302, "/");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});