require('dotenv').config()
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const passport=require("passport")
const session=require("express-session")
const https=require("https")
const passportLocalMongoose=require("passport-local-mongoose")
const findOrCreate = require('mongoose-find-or-create')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
 const FacebookStrategy = require('passport-facebook').Strategy;
const port=process.env.PORT || 3000
const app=express();
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
/*mongoose.connect('mongodb://localhost:27017/eduscopeDB');*/
mongoose.connect('mongodb+srv://anuj_saklani:anuj123@cluster0.mn7ci.mongodb.net/eduscopeDB');
/*mongoose.set('bufferCommands', false);*/
  app.set('view engine', 'ejs');
  app.use(session({
    secret: 'This is our eduSCOPE website',
    resave: false,
    saveUninitialized: false,
  }))
  app.use(passport.initialize())
  app.use(passport.session())
app.get("/",function(req,res){
res.render("outer")
})

app.get("/register",function(req,res){
  res.render("register")
})
const userSchema=new mongoose.Schema({
  username:String,
  password:String,
  googleId:String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)
const User=mongoose.model("eduscopes",userSchema);
passport.use(User.createStrategy());
  passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});






passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://mighty-savannah-84244.herokuapp.com/auth/google/yes",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo",
    proxy:true

  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));






  app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] }));

app.get("/auth/google/yes",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/home');
  });


  passport.use(new FacebookStrategy({
    clientID: process.env.APP_ID,
    clientSecret: process.env.APP_SECRET,
    callbackURL: "https://mighty-savannah-84244.herokuapp.com/auth/facebook/callback",
    profileFields:['id','displayName','name','email'],
    proxy:true
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({facebookId: profile.id} , function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/home',
                                      failureRedirect: '/login' }));
app.post("/register",function(req,res){
  User.register({username:req.body.username}, req.body.password, function(err, user) {
  if(err){
    res.redirect("/error")
  }
  else{
    passport.authenticate("local")(req,res,function(){
      console.log(user)
      res.redirect("/home")
    })
  }
  });
})
app.get("/login",function(req,res){
  res.render("login")
})
app.post("/login",function(req,res){
  const user1=new User({
    username:req.body.username,
    password:req.body.password
  })
user1.save(function(err){
  if(err){
    console.log(err)
  }
  else{
    console.log("Login Successfull!")
  }
})
req.login(user1, function(err) {
  if (err) {
    res.redirect("/error")
   }
else{
  passport.authenticate("local")(req,res,function(){
    res.redirect("/home")
  })
}
});
})
app.get("/home",function(req,res){
  if(req.isAuthenticated()){
      res.render("home")
  }
  else{
    res.redirect("/login")
  }

})
app.get("/about",function(req,res){
  res.render("about")
})
app.get("/contact",function(req,res){
  res.render("contact")
})
app.get("/privacy",function(req,res){
  res.render("privacypolicy")
})
app.get("/error",function(req,res){
  res.render("error")
})
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/")
})
app.listen(port,function(){
  console.log(`Server is running at ${port} port`)
})
