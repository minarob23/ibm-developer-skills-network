const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let validators = users.filter((user)=> {
  return (user.username === username)
});
  return validators.length === 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validators = users.filter((user)=> {
  return (user.username === username && user.password === password)
});
  return validators.length > 0;
}

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({message: "Unable to register user. Please provide both username and password."});
  }

  if (!isValid(username)) {
    return res.status(409).json({message: "User already exists!"});
  }

  users.push({username, password});
  return res.status(201).json({message: "User successfully registered. Now you can login"});
});

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).json({message: "Error logging in"});
  }

  if(authenticatedUser(username,password)){
      let accessToken = jwt.sign({
        username
      }, 'access', {expiresIn : 60 * 60})

      req.session.authorization = {
        accessToken,username
      } 
      return res.status(200).json({message: "Login successful!", accessToken});
  }
  else{
    return res.status(208).json({message: "Invalid login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if(books[isbn]){
    let book = books[isbn];
  book.reviews[username] = review;
  return res.status(200).json({message: "Review added/updated successfully", reviews: book.reviews});
  }else{
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

//Delete a book review

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({message: "Review deleted successfully", reviews: book.reviews});
    } else {
      return res.status(404).json({message: "No review by this user to delete"});
    }
  } else {
    return res.status(404).json({message: `ISBN ${isbn} not found`});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
