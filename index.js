const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");



app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const key = "379";
 const generateJwt = (user) => {
  const info = {username: user.username};
  return jwt.sign(info, key, { expiresIn: '1h' });
 };

 const authJwt = (req, res, next) =>{
  const authHeader = req.headers.authorization;

  
  jwt.verify(token, key, (err, user) => {
    if (err){
      res.sendStatus(403);
    }
    else{
      req.user = user;
      next();
    }


  });


 }

//defining a middlewares
const adminAuth = (req, res, next) => {
  const { username, password } = req.headers;
  //const username = req.headers.username;
  //const password = req.headers.password;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if(admin){
    next();
  }
  else{
    res.status(403).json({message: "invalid login", ADMINS});
  }
};


const userAuth = (req, res, next) => {
  const { username, password } = req.headers;
  //const username = req.headers.username;
  //const password = req.headers.password;

  const user = USERS.find(a => a.username === username && a.password === password);
  if(user){
    req.user = user;
    next();
    
  }
  else{
    res.status(403).json({message: "invalid login", USERS});
  }
};

app.get('/check', (req, res) => {
  res.send("sup budd");
});

// Admin routes
app.post('/admin/signup', (req, res) => {
  const pass = req.body;

  const findAdmin = ADMINS.find(a=>a.username === pass.username);
  //res.json({ADMINS});

  // just remove admins***
  if(findAdmin){
    res.status(403).json({ message: "Admin Exists", ADMINS});
  }
  else{
    ADMINS.push(pass);
    const token = generateJwt(pass); 
    res.json({ message: 'Admin created successfully', ADMINS, token});
  }

});

app.post('/admin/login', authJwt, (req, res) => {
  const { username, password } = req.headers;
  //const username = req.headers.username;
  //const password = req.headers.password;

  const admin = ADMINS.find(a => a.username === username && a.password === password);
  if(admin){
    const token = generateJwt(admin);
    res.json({message: "logged in succesfully", Token: token});
  }
  else{
    res.status(403).json({message: "invalid login", ADMINS});
  }
  
});

//insert----check*****
app.post('/admin/courses', authJwt, (req, res) => {


  const pass = req.body;

  const findTitle = COURSES.find(a=> a.title === pass.title)
  if(findTitle){
    res.status(403).json({ message: "course exists", COURSES})
  }
  else{
    pass.id = COURSES.length + 1;
    COURSES.push(pass);
    res.json({ message: 'Admin created successfully', courseID: pass.id, COURSES});
    
  }


  // logic to create a course
});

app.put('/admin/courses/:courseId', adminAuth, (req, res) => {
  // logic to edit a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(a => a.id === courseId)
  if(course){
    Object.assign(course, req.body);
    res.json({ message : "Course has been updated"})
  }
  else{
    res.status(403).json({ message: "Course not found"});
  }
});

app.get('/admin/courses', adminAuth, (req, res) => {
  // logic to get all courses
  res.json({courses: COURSES})


});

//------------------------------------------------------------------------------------------------------------------

// User routes-------------------------------------------------------------------------------------------------------
app.post('/users/signup', (req, res) => {
  // logic to sign up user

  //...req.body, just like simply define in one statement.
  const pass = {...req.body, purchasedCourse: []};

  const findAdmin = USERS.find(a=>a.username === pass.username);
  //res.json({USERS});

  // just remove user***
  if(findAdmin){
    res.status(403).json({ message: "User Exists", USERS});
  }
  else{
    USERS.push(pass);
    res.json({ message: 'User created successfully', USERS});
  }
});

app.post('/users/login', userAuth, (req, res) => {
  // logic to log in user

  res.json({message: "logged in succesfully"});
});

app.get('/users/courses', userAuth, (req, res) => {
  // logic to list all courses
  //WE GONNA FILTER COURSES WITH PUBLISHED == TRUE
  let filterLib = [];
  for (let i = 0; i < COURSES.length; i++) {
    if(COURSES[i].published){
      filterLib.push(COURSES[i]);
    }
    
  }
//or COURSES.filter(c => c.published);

  res.json({ courses: filterLib});

});

app.post('/users/courses/:courseId', userAuth, (req, res) => {
  // logic to purchase a course

  const courseId = parseInt(req.params.courseId);
  const courseCheck = COURSES.find(a=> a.id === courseId && a.published);

  if(courseCheck){
    req.user.purchasedCourse.push(courseId);
    res.json({message: "Course bought successfully", users: USERS});
  }
  else{
    res.status(403).json({message: "course buying had failed"});
  }
});

app.get('/users/purchasedCourses', userAuth, (req, res) => {
  // // logic to view purchased courses
  var pCourses = req.user.purchasedCourse;
  var boughtCourses = [];
  //there is simpler way, one line command, thought of revising
  for (let i = 0; i < COURSES.length; i++) {
    if(pCourses.indexOf(COURSES[i].id) !== -1){
      boughtCourses.push(COURSES[i]);
    }
  }
  res.json({ boughtCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
