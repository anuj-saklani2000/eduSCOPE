require('dotenv').config()
const express=require("express")
const bodyParser=require("body-parser")
const ejs=require("ejs")
const mongoose=require("mongoose")
const passport=require("passport")
const session=require("express-session")
const request=require("request")
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
    callbackURL: "https://eduscope2000.herokuapp.com/auth/google/yes",
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
const contactSchema=new mongoose.Schema({
  username:String,
  mailid:String,
  usernumber:Number,
  messageuser:String
})
const Contact=mongoose.model("contactinfos",contactSchema)
app.post("/contact",function(req,res){
const a=req.body.names
const b=req.body.email
const c=req.body.number
const d=req.body.message
const contact1=new Contact({
  username:a,
  mailid:b,
  usernumber:c,
  messageuser:d
})
contact1.save(function(err){
  if(err){
    res.redirect("/error")
  }
  else{
    res.redirect("/success")
  }
})
})
const chatboatSchema=new mongoose.Schema({
  user_name:String,
  mail_id:String,
  message_user:String
})
const Chat=mongoose.model("chatboats",chatboatSchema)
app.post("/chatboat",function(req,res){
  const e=req.body.un
  const f=req.body.mail
  const g=req.body.msg
const chat=new Chat({
  user_name:e,
  mail_id:f,
  message_user:g
})
chat.save(function(err){
  if(err){
    res.redirect("/error")
  }
  else{
res.redirect("/")
  }
});
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
app.get("/success",function(req,res){
  res.render("success")
})

const array1=[
{id: 1, stream: "CSE", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
{id: 2, stream: "CSE", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
{id: 3, stream: "CSE", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1v2UuZk2Bvbx_IzMOMQBbgW3NsMMc1jzQ"},
{id: 4, stream: "CSE", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1w48z5P8pTKviwtwWaJsiECw-cLry2NMA"},
{id: 5, stream: "CSE", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1vbCYUi0qJty3FXej6XleQpdpaEIG9Ohw"},
{id: 6, stream: "CSE", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1poTVR-YJsvIaNKRdx_Bj2WbmtyCrIXFs"},
{id: 7, stream: "CSE", sem: "semester 7", anchor: "https://drive.google.com/uc?export=download&id=1tP9ODEiAqBq5GXS-fPi-5NeWClNwhd2u"},
{id: 8, stream: "CSE", sem: "semester 8", anchor: "https://drive.google.com/uc?export=download&id=1cArq3jZl5WUUXge6FFTiCIOab-RziBtn"}
];
const cseSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const CSE=mongoose.model("cse",cseSchema);
app.get("/cse",function(req,res){
  CSE.find(function(err,out1){
    if(!err){
      if(out1.length===0){
        CSE.insertMany(array1,function(err){
          if(!err){
            console.log("cse branch data inserted successfully!")
            res.redirect("/cse")
          }
        })
      }
      else{
      res.render("cse",{
        List:out1
      })
      }
    }

  })


})


const array4=[
{id: 1, stream: "ECE", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
{id: 2, stream: "ECE", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
{id: 3, stream: "ECE", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=114NN-11REPcT0otNdcOparsyKctwy0cL"},
{id: 4, stream: "ECE", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1pOBnX2CxL1Bx6DymGwbtmEMHJ0HPmeCv"},
{id: 5, stream: "ECE", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1Af10NqGtsf3TlFN8zNK1r673PL-0R39C"},
{id: 6, stream: "ECE", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1Af10NqGtsf3TlFN8zNK1r673PL-0R39C"},
{id: 7, stream: "ECE", sem: "semester 7", anchor: "https://drive.google.com/uc?export=download&id=1OFAjDI8_NQWl_TYfscxEuhmeFOh3VfTo"},
{id: 8, stream: "ECE", sem: "semester 8", anchor: "https://drive.google.com/uc?export=download&id=1NnXUZ9Z-76poVCuyvLxDpNGlsVL3nBHd"}
];
const eceSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const ECE=mongoose.model("ece",eceSchema);
app.get("/ece",function(req,res){
  ECE.find(function(err,out3){
    if(!err){
      if(out3.length===0){
        ECE.insertMany(array4,function(err){
          if(!err){
            console.log("ece branch data inserted successfully!")
            res.redirect("/ece")
          }
        })
      }
      else{
      res.render("ece",{
        List:out3
      })
      }
    }

  })
})

const array2=[
  {id: 1, stream: "ELE", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 2, stream: "ELE", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 3, stream: "ELE", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1VSVrsWL4YyRjWemFOgDKh6EZ2dIcRGMT"},
  {id: 4, stream: "ELE", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1HeqHHfU7GIH7o1eaNXTdHOz2AeWOTy_Z"},
  {id: 5, stream: "ELE", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1J23U3GfZOxIKR5MEQZYUDnmtlah1OUf3"},
  {id: 6, stream: "ELE", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1J23U3GfZOxIKR5MEQZYUDnmtlah1OUf3"},
  {id: 7, stream: "ELE", sem: "semester 7", anchor: "https://drive.google.com/uc?export=download&id=1oDvJI8pEnzB3hStrEaulUHXt2E0delPz"},
  {id: 8, stream: "ELE", sem: "semester 8", anchor: "https://drive.google.com/uc?export=download&id=1tH8X6jp4TYDzzAeXz8ZomO7jNWGhO6us"}
];
const eleSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const ELE=mongoose.model("ele",eleSchema);
app.get("/ele",function(req,res){
  ELE.find(function(err,out2){
    if(!err){
      if(out2.length===0){
        ELE.insertMany(array2,function(err){
          if(!err){
            console.log("ele branch data inserted successfully!")
            res.redirect("/ele")
          }
        })
      }
      else{
      res.render("ele",{
        List:out2
      })
      }
    }

  })
})



const array5=[
  {id: 1, stream: "IT", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 2, stream: "IT", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 3, stream: "IT", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=15zk_hzWb4bBa55o2-OSggaBba1iYH_rj"},
  {id: 4, stream: "IT", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1Fe2_m4Qn6n8DDY3jUhZ1JxjuajJDgvkn"},
  {id: 5, stream: "IT", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1I5CsSFH4-zKSd1HI1biBFtUfoHx7zpnW"},
  {id: 6, stream: "IT", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=18nuJUjKWyBKIRQ_Dz5Qdlyxl30d9lFFM"},
  {id: 7, stream: "IT", sem: "semester 7", anchor: "https://drive.google.com/uc?export=download&id=1y9kw4VYyNbTOdLCWL2hxMz2odDPKb3Uv"},
  {id: 8, stream: "IT", sem: "semester 8", anchor: "https://drive.google.com/uc?export=download&id=1y9kw4VYyNbTOdLCWL2hxMz2odDPKb3Uv"}
];
const itSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const IT=mongoose.model("it",itSchema);

app.get("/it",function(req,res){
  IT.find(function(err,out4){
    if(!err){
      if(out4.length===0){
        IT.insertMany(array5,function(err){
          if(!err){
            console.log("it branch data inserted successfully!")
            res.redirect("/it")
          }
        })
      }
      else{
      res.render("it",{
        List:out4
      })
      }
    }

  })
})

const array8=[
{id: 1, stream: "BCA", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1LKg290QKw0mYlKwjzOImluTD_VQpavRQ"},
{id: 2, stream: "BCA", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1jgSokgx9Rjux2hxdGqpCrS18XyW7jV8d"},
{id: 3, stream: "BCA", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1ns-uaaqS8DhpDwqxZ47rpW9HT7ZJDrhi"},
{id: 4, stream: "BCA", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1tYyuevzuahNt88VmiUbg83eDOEbSdNeq"},
{id: 5, stream: "BCA", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1j9lbUjD7pAzLlfQtanAkC3Od4goc6sW3"},
{id: 6, stream: "BCA", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1-BBD1h2E3OIoKpjSXPK7Qn4FouinJE7Y"},
];
const bcaSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const BCA=mongoose.model("bca",bcaSchema);


app.get("/bca",function(req,res){
  BCA.find(function(err,out7){
    if(!err){
      if(out7.length===0){
        BCA.insertMany(array8,function(err){
          if(!err){
            console.log("bca branch data inserted successfully!")
            res.redirect("/bca")
          }
        })
      }
      else{
      res.render("bca",{
        List:out7
      })
      }
    }

  })
})


const array7=[
{id: 1, stream: "BBA", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1CPa8arhJIdxoB-dK5US5EfA_imYk3e1B"},
{id: 2, stream: "BBA", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1SgnTwcTQUssLoCdHMi2DSw7_bOLBRq5U"},
{id: 3, stream: "BBA", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1wD0iCZAe2djzE7wjnSf3mYGcJEemsztu"},
{id: 4, stream: "BBA", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1rOAW9RGT3fP_gw0XNPRNr_FMZy7LwiOE"},
{id: 5, stream: "BBA", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1NXdAklMeb-RrhCS9Nh6MAbB_Y3SXDpQh"},
{id: 6, stream: "BBA", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1M82fqfbi46YAgfcuyHkPqC9Mnl5WIdpl"},
];
const bbaSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const BBA=mongoose.model("bba",bbaSchema);
app.get("/bba",function(req,res){
  BBA.find(function(err,out6){
    if(!err){
      if(out6.length===0){
        BBA.insertMany(array7,function(err){
          if(!err){
            console.log("bba branch data inserted successfully!")
            res.redirect("/bba")
          }
        })
      }
      else{
      res.render("bba",{
        List:out6
      })
      }
    }

  })
})









const array3=[
  {id: 1, stream: "ME", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 2, stream: "ME", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1x2TN5lh4at73ijg6zY5aHM76FfaAlS7y"},
  {id: 3, stream: "ME", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=19sAxUh6QY68C60IOHL6mAQS1Uvg53CWB"},
  {id: 4, stream: "ME", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1GUsIH_qdXxrHDEJ70xSVAsGXxSme1TDQ"},
  {id: 5, stream: "ME", sem: "semester 5", anchor: "https://drive.google.com/uc?export=download&id=1ZW9txqiwG0AfESXMGjXpawTTE_wh-w1U"},
  {id: 6, stream: "ME", sem: "semester 6", anchor: "https://drive.google.com/uc?export=download&id=1ZW9txqiwG0AfESXMGjXpawTTE_wh-w1U"},
  {id: 7, stream: "ME", sem: "semester 7", anchor: "https://drive.google.com/uc?export=download&id=1qzeDIIF1JmBFBiI3DUcU053aLrCFCMF9"},
  {id: 8, stream: "ME", sem: "semester 8", anchor: "https://drive.google.com/uc?export=download&id=1E-8a3PHM2sXoQnrQYC4nk7xXptVMLd8I"},

];

const meSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const ME=mongoose.model("me",meSchema);


app.get("/me",function(req,res){
  ME.find(function(err,out3){
    if(!err){
      if(out3.length===0){
        ME.insertMany(array3,function(err){
          if(!err){
            console.log("me branch data inserted successfully!")
            res.redirect("/me")
          }
        })
      }
      else{
      res.render("me",{
        List:out3
      })
      }
    }

  })
})


const array6=[
{id: 1, stream: "MBA", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1gxH_DSZ6V9PopQDgNv7nZ61ECBqoMUkT"},
{id: 2, stream: "MBA", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1zlnZ3N2CFFf-OxGWn5eUCV1LDV8-fsuR"},
{id: 3, stream: "MBA", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1X17Liksw4vo1b-BgUD0g17oaO_4T_zZ1"},
{id: 4, stream: "MBA", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1LBTZdjqMFW5igFLYNS4pySfIvVlH_Sto"},
];

const mbaSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const MBA=mongoose.model("mba",mbaSchema);
app.get("/mba",function(req,res){
  MBA.find(function(err,out5){
    if(!err){
      if(out5.length===0){
        MBA.insertMany(array6,function(err){
          if(!err){
            console.log("mba branch data inserted successfully!")
            res.redirect("/mba")
          }
        })
      }
      else{
      res.render("mba",{
        List:out5
      })
      }
    }

  })
})


const array9=[
{id: 1, stream: "MCA", sem: "semester 1", anchor: "https://drive.google.com/uc?export=download&id=1NFQFm2CrEZwyZuI5EWOpbmrouW3Y5BIB"},
{id: 2, stream: "MCA", sem: "semester 2", anchor: "https://drive.google.com/uc?export=download&id=1ZvcWzreaR-_e-skMC9nDewSD4x3whd50"},
{id: 3, stream: "MCA", sem: "semester 3", anchor: "https://drive.google.com/uc?export=download&id=1oDj6fSGz8pw-agvvUlpMVlJVUKVg2WsS"},
{id: 4, stream: "MCA", sem: "semester 4", anchor: "https://drive.google.com/uc?export=download&id=1hfixiipnBYA-Xh8vQ2nWXn57L4DaW6Lc"},
]
const mcaSchema=new mongoose.Schema({
  id:Number,
  stream:String,
  sem:String,
  anchor:String
})
const MCA=mongoose.model("mca",mcaSchema);
app.get("/mca",function(req,res){
  MCA.find(function(err,out8){
    if(!err){
      if(out8.length===0){
        MCA.insertMany(array9,function(err){
          if(!err){
            console.log("mca branch data inserted successfully!")
            res.redirect("/mca")
          }
        })
      }
      else{
      res.render("mca",{
        List:out8
      })
      }
    }

  })
})








app.get("/qb",function(req,res){
  res.render("questionbank")
})

app.listen(port,function(){
  console.log(`Server is running at ${port} port`)
})
