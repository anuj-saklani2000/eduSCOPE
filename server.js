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
mongoose.connect('mongodb+srv://pawarnihal44:db1234@cluster0.vsww5gu.mongodb.net/?retryWrites=true&w=majority');
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
  googleId:String,
  facebookId:String,
  name:String,
  review:String
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
    clientID: '1074896299874-6t7ldscc496a6toto969j9mbdgt6gm8e.apps.googleusercontent.com',
    clientSecret: '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',
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
    clientID: '384905746581456',
    clientSecret: '6d6043126baea665bb54a24b86da2dbc',
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






const arrayqb=[
  {id: 1, course: "CSE", sem: "semester 2", sub: "Introduction to computers Programming", anchor: "https://drive.google.com/uc?export=download&id=13DXw39KTWj_Toz4W-eKllz4HqFtF5Qjw"},
{id: 2, course: "CSE", sem: "semester 3", sub: "DE", anchor: "https://drive.google.com/uc?export=download&id=1FYkbnSlFduwjnt7c19KeHQTc7T5UjYK0"},
{id: 3, course: "CSE", sem: "semester 3", sub: "Discrete Structure", anchor: "https://drive.google.com/uc?export=download&id=1VtBtq84NG-IXO4HogUKe9F_-Ml_yLGAq"},
{id: 4, course: "CSE", sem: "semester 3", sub: "DSA", anchor: "https://drive.google.com/uc?export=download&id=1GahqZhv2xYMrSB1a_6ThcKwSI2yCR9LI"},
{id: 5, course: "CSE", sem: "semester 3", sub: "Internet Fundamental", anchor: "https://drive.google.com/uc?export=download&id=1m61Zh2UGpl82YyYXMIhoisPCI-jxG7k0"},
{id: 6, course: "CSE", sem: "semester 3", sub: "Internet Fundamental", anchor: "https://drive.google.com/uc?export=download&id=1qPwFzgHM4Fnv84q9aamZIkD18hkmn70X"},
{id: 7, course: "CSE", sem: "semester 3", sub: "PPL", anchor: "https://drive.google.com/uc?export=download&id=1B-jBP94V1UfuSA5JMCKrynYynoXXQ_mG"},
{id: 8, course: "CSE", sem: "semester 4", sub: "Digital Data Communication", anchor: "https://drive.google.com/uc?export=download&id=1Fbwul9Q4RHi9sCqdcec1rabFgIsm06WY"},
{id: 9, course: "CSE", sem: "semester 4", sub: "OOP", anchor: "https://drive.google.com/uc?export=download&id=1IAs6KJnoWJKJEQppy4ErrgDmmpiVy1Q5"},
{id: 10, course: "CSE", sem: "semester 4", sub: "OS", anchor: "https://drive.google.com/uc?export=download&id=1g51f1AlbZaMYNI3v3e1O7cs3WW0uan9s"},
{id: 11, course: "CSE", sem: "semester 4", sub: "Programming Language", anchor: "https://drive.google.com/uc?export=download&id=1K_swNRlgf6J4TX-r4cnmYG1Jc6NVbB_Z"},
{id: 12, course: "CSE", sem: "semester 5", sub: "Computer Networks", anchor: "https://drive.google.com/uc?export=download&id=1Dsw7nxq3wU9cRm2Ly1tQIZnituxt56Ka"},
{id: 13, course: "CSE", sem: "semester 5", sub: "Computer Networks", anchor: "https://drive.google.com/uc?export=download&id=1Umw1bqAD1l4-seBN3ILujrL6pZM_5CFX"},
{id: 14, course: "CSE", sem: "semester 5", sub: "Computer Organisation and Architecture", anchor: "https://drive.google.com/uc?export=download&id=1U-YAcmW0xntq4NwasXcjmQKIqHfh53Jp"},
{id: 15, course: "CSE", sem: "semester 5", sub: "Database Management System", anchor: "https://drive.google.com/uc?export=download&id=1xVFTG6ElmRDUcvTgfGr8qqbbj3Jk24nK"},
{id: 16, course: "CSE", sem: "semester 5", sub: "Essential of Information Technology", anchor: "https://drive.google.com/uc?export=download&id=1-KqwWymOjXrp7b5CKrsPATK64m0sv82a"},
{id: 17, course: "CSE", sem: "semester 5", sub: "Microprocessor and Interefacing", anchor: "https://drive.google.com/uc?export=download&id=1-xjPjo9SgQPYKgx1b7fUe0lHnZyoUNrt"},
{id: 18, course: "CSE", sem: "semester 5", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1CNTx5dzpBN2L87BHdiF7DvmmH-tyfsgE"},
{id: 19, course: "CSE", sem: "semester 5", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1MRqPkDDMu2W_Xn3fZXHtt33feyyofkDn"},
{id: 20, course: "CSE", sem: "semester 5", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1wlMDuIunsA-EfC4B5HId096xY5QB6Qkk"},
{id: 21, course: "CSE", sem: "semester 6", sub: "Advance Database System", anchor: "https://drive.google.com/uc?export=download&id=1YpTnOABPuZhrasoJQlIARddM21BD99_O"},
{id: 22, course: "CSE", sem: "semester 6", sub: "Compiler Design", anchor: "https://drive.google.com/uc?export=download&id=1byktKnKh6zkWuRgAT31-bCfwD377R-sz"},
{id: 23, course: "CSE", sem: "semester 6", sub: "Computer Hardware Technologies", anchor: "https://drive.google.com/uc?export=download&id=1FKdP_iuBRtoG322rO_7RdXSIhErScT7V"},
{id: 24, course: "CSE", sem: "semester 6", sub: "Essentials of Information Technology", anchor: "https://drive.google.com/uc?export=download&id=1mHyRsFQr-0SMkcnP2UjkkKFrj_AppJm1"},
{id: 25, course: "CSE", sem: "semester 6", sub: "Graph Theory", anchor: "https://drive.google.com/uc?export=download&id=1eX3kh1uMQlxRbkpcIhb4rxQ0jnDmp5GJ"},
{id: 26, course: "CSE", sem: "semester 6", sub: "Mobile Computing", anchor: "https://drive.google.com/uc?export=download&id=1LhyJxhh9THaAaTOOYxJbUZOkrWihZVTS"},
{id: 27, course: "CSE", sem: "semester 6", sub: "Multimedia Techniques", anchor: "https://drive.google.com/uc?export=download&id=1vJR0vS_iVmKLhb7B9MdtxABfJ0Brlk6C"},
{id: 28, course: "CSE", sem: "semester 6", sub: "Network management", anchor: "https://drive.google.com/uc?export=download&id=17vbAa8T-5BKhs3QzWmqGYbcxkt76xTJF"},
{id: 29, course: "CSE", sem: "semester 6", sub: "Parallel Computing", anchor: "https://drive.google.com/uc?export=download&id=1-k5DHXIK6Mca36v38TzU-z9kCoZ_H9vi"},
{id: 30, course: "CSE", sem: "semester 6", sub: "Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=184iR9kKmB0lpCklBXZ-4WfxsLfsa53St"},
{id: 31, course: "CSE", sem: "semester 7", sub: "Agile Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=1ZDUKoRNJZ-z0_YN4sKbrXozAx8ndMuZ8"},
{id: 32, course: "CSE", sem: "semester 7", sub: "Big Data Analytics", anchor: "https://drive.google.com/uc?export=download&id=1R7MVgFY4bPLTlQBtH1dpZcrMnxfaFkjY"},
{id: 33, course: "CSE", sem: "semester 7", sub: "Crypto", anchor: "https://drive.google.com/uc?export=download&id=1XFnXbDVJY5IZDoMgTQcCf5kq0dQ2f7g7"},
{id: 34, course: "CSE", sem: "semester 7", sub: "Cyber security", anchor: "https://drive.google.com/uc?export=download&id=1Z5-ZTE9aHst5eVcVzNbu6Dbvzj-634w5"},
{id: 35, course: "CSE", sem: "semester 7", sub: "Expert System", anchor: "https://drive.google.com/uc?export=download&id=1l9_s5BXyxdQTDyb_hBhSN0eO8xyl4HrN"},
{id: 36, course: "CSE", sem: "semester 7", sub: "OOP", anchor: "https://drive.google.com/uc?export=download&id=1RHvvmgsbdUIN4XoLzgKdPsqaJKwSm6Li"},
{id: 37, course: "CSE", sem: "semester 7", sub: "Security", anchor: "https://drive.google.com/uc?export=download&id=1Bvr9GKUFx0JmllLOM7FQaYe6NrM_GnN9"},
{id: 38, course: "CSE", sem: "semester 7", sub: "statistical models for computer science", anchor: "https://drive.google.com/uc?export=download&id=1dTdJWwAWNzoi9EXfyUOd-0_F5mOXNL8H"},
{id: 39, course: "CSE", sem: "semester 7", sub: "Unix and Linux programming", anchor: "https://drive.google.com/uc?export=download&id=110k7QXOMxh90rCDZxD3aliJVQ-WjrWfd"},
{id: 40, course: "CSE", sem: "semester 7", sub: "web engineering", anchor: "https://drive.google.com/uc?export=download&id=1r8EFbhqWRndcXawjVtdi0BYNuvjEmHtb"},
{id: 41, course: "CSE", sem: "semester 8", sub: "Cloud Computing", anchor: "https://drive.google.com/uc?export=download&id=18ZkdbPxOLkIAIeQ7i3t2Sa0d6iQ1ZRsW"},
{id: 42, course: "CSE", sem: "semester 8", sub: "Data Minning", anchor: "https://drive.google.com/uc?export=download&id=1ReDA9FiV6JG5hjS7o-6T2o8QjD8uy01D"},
{id: 43, course: "CSE", sem: "semester 8", sub: "Distributed operating system", anchor: "https://drive.google.com/uc?export=download&id=1fdYH-cAIuKjhehwQPxdH-u1-bwM91-tD"},
{id: 44, course: "CSE", sem: "semester 8", sub: "Expert System", anchor: "https://drive.google.com/uc?export=download&id=1BF9IX6qU2-xNrgOnGo4EwpcciJWJY8VN"},
{id: 45, course: "CSE", sem: "semester 8", sub: "Graph Theory", anchor: "https://drive.google.com/uc?export=download&id=1eAJZQaBYHcNUCvg2fRrpKY47LHu8AY6N"},
{id: 46, course: "CSE", sem: "semester 8", sub: "microprocessor and interfacing engineering", anchor: "https://drive.google.com/uc?export=download&id=1SoNVq6kv6OctT4bYa8H5kgOAmZl2qUBn"},
{id: 47, course: "CSE", sem: "semester 8", sub: "Natural Language Processing", anchor: "https://drive.google.com/uc?export=download&id=1qPCEQuuLkndm_W1QJZ19bEWiNPX2DUfJ"},
{id: 48, course: "CSE", sem: "semester 8", sub: "Parallel Computing", anchor: "https://drive.google.com/uc?export=download&id=1GMv_EZuOOl-0V2x6ILFzq0cqTUtcuZ7y"},
{id: 49, course: "CSE", sem: "semester 8", sub: "Simulation and modeling", anchor: "https://drive.google.com/uc?export=download&id=1XOPsWiuEcL3RAhHq5WEDQQcSUobfa-Tu"},
{id: 50, course: "CSE", sem: "semester 8", sub: "Software quality model", anchor: "https://drive.google.com/uc?export=download&id=1sz9jfUMUSqPxywhiZCVuJAdASl62iZAG"},
{id: 51, course: "CSE", sem: "semester 8", sub: "Software Testing", anchor: "https://drive.google.com/uc?export=download&id=1OE-vEtOntPgdwOa_k-e2FPaM-VFNvZRN"},
{id: 52, course: "CSE", sem: "semester 8", sub: "Software Testing", anchor: "https://drive.google.com/uc?export=download&id=1QSvXi7ixsomi1pr_AE989k9kDv_N0yvg"},
{id: 53, course: "CSE", sem: "semester 8", sub: "Warehousing and Data Minning", anchor: "https://drive.google.com/uc?export=download&id=1y2H_ymLsQc5CFhr1rOgOA4poM7lrtQzf"},
{id: 54, course: "IT", sem: "semester 3", sub: "Data Structure", anchor: "https://drive.google.com/uc?export=download&id=182M7YYQ5bj0e21q8_EOT16pGq_2d7Hsg"},
{id: 55, course: "IT", sem: "semester 3", sub: "Digital Electronics and Logic Design", anchor: "https://drive.google.com/uc?export=download&id=1m3GsXCD7BGxk2XCazPxnC7EIIBVc1vlI"},
{id: 56, course: "IT", sem: "semester 3", sub: "OOP", anchor: "https://drive.google.com/uc?export=download&id=1YZ4A2WaCXEN2cMP7Q1dduuPDWumYMgS6"},
{id: 57, course: "IT", sem: "semester 3", sub: "OOP", anchor: "https://drive.google.com/uc?export=download&id=1sjyOikDFgDXjupbBM5EbEup72tJcIgya"},
{id: 58, course: "IT", sem: "semester 3", sub: "OOP", anchor: "https://drive.google.com/uc?export=download&id=1u0ivCDg9rWlhvm8_k4_1PyG0Guctf4eu"},
{id: 59, course: "IT", sem: "semester 4", sub: "Fundamental of Microprocessor", anchor: "https://drive.google.com/uc?export=download&id=1emspvxn8nfs9-2qC4paNDOhVLdYObLcI"},
{id: 60, course: "IT", sem: "semester 4", sub: "OS", anchor: "https://drive.google.com/uc?export=download&id=1Yd_Lh_--FV1jPbKpoSKkMeZZ4C9woAHc"},
{id: 61, course: "IT", sem: "semester 4", sub: "OS", anchor: "https://drive.google.com/uc?export=download&id=1faL6dQ4Qj9aybZlPJ8Cn50DF6F2nf837"},
{id: 62, course: "IT", sem: "semester 4", sub: "OS", anchor: "https://drive.google.com/uc?export=download&id=1jNrSAeZ2cnkK1aFnY9b8zrK8AZVns_Vp"},
{id: 63, course: "IT", sem: "semester 4", sub: "Programming Language", anchor: "https://drive.google.com/uc?export=download&id=1-tJZFr-kp8Rs7k9RKJPOWMFIjTVbhlna"},
{id: 64, course: "IT", sem: "semester 5", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1MPyoH5rva0psVEjm2132QrrCWzJ1FTv0"},
{id: 65, course: "IT", sem: "semester 5", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1McaoM4fmSftxbQPLEmcxvL0gHVqVQ_mV"},
{id: 66, course: "IT", sem: "semester 5", sub: "Computer Networks", anchor: "https://drive.google.com/uc?export=download&id=1tfqvJZJKSqPt02KUSTKQ8qC_RGkai7gf"},
{id: 67, course: "IT", sem: "semester 5", sub: "Computer Organisation and Architecture", anchor: "https://drive.google.com/uc?export=download&id=1MtkqJQPFtaH7IVuBu5CfsaVUrZoW4Sso"},
{id: 68, course: "IT", sem: "semester 5", sub: "Computer Organisation and Architecture", anchor: "https://drive.google.com/uc?export=download&id=1QHg_6JFUDg-cZ1S0IAsKvzUA8X8Kt9XX"},
{id: 69, course: "IT", sem: "semester 5", sub: "Digital Data Communication", anchor: "https://drive.google.com/uc?export=download&id=1sjOcMW50EMDEjCPrSpkL-KtlVEkrXA5e"},
{id: 70, course: "IT", sem: "semester 5", sub: "Internet and Web Technology", anchor: "https://drive.google.com/uc?export=download&id=1sjOcMW50EMDEjCPrSpkL-KtlVEkrXA5e"},
{id: 71, course: "IT", sem: "semester 5", sub: "Java Programming", anchor: "https://drive.google.com/uc?export=download&id=1E32vo7YQWLM1cf8kT82o_nFaXWv_ChkU"},
{id: 72, course: "IT", sem: "semester 6", sub: "Analysis and Design of Algorithms", anchor: "https://drive.google.com/uc?export=download&id=1gQ9r2vIXmWi-C15XbJZpw4nhWmxA1EIR"},
{id: 73, course: "IT", sem: "semester 6", sub: "Computer Network and Application", anchor: "https://drive.google.com/uc?export=download&id=1BJFqwhgNr4tZmqID-k3TNpr4KJPyKkkH"},
{id: 74, course: "IT", sem: "semester 6", sub: "Data ware Housing and Data Minning", anchor: "https://drive.google.com/uc?export=download&id=1n2FqPbY3q5RXQGCreu-wc97OzajCU4h2"},
{id: 75, course: "IT", sem: "semester 6", sub: "Introduction to Micro Controller", anchor: "https://drive.google.com/uc?export=download&id=14OW2E2-9tlAYNm6efZcs6rLy4zeIwAoU"},
{id: 76, course: "IT", sem: "semester 6", sub: "Management Information System", anchor: "https://drive.google.com/uc?export=download&id=1MglR3PY3qMY8qLaGu2wCvzDf101Rk6Mk"},
{id: 77, course: "IT", sem: "semester 6", sub: "Modelling and Simulation", anchor: "https://drive.google.com/uc?export=download&id=1P10KLhuGLcg0_j9Yq7vHKCbXxcpfufPB"},
{id: 78, course: "IT", sem: "semester 6", sub: "Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=1uHieBSGKekDjGjiAFkdDtFrYork4Tjcz"},
{id: 79, course: "IT", sem: "semester 7", sub: "AI", anchor: "https://drive.google.com/uc?export=download&id=1jvZxN6Hq5KwdDjc4NMGeBVOtP-cCqVDs"},
{id: 80, course: "IT", sem: "semester 7", sub: "Broadband communication", anchor: "https://drive.google.com/uc?export=download&id=1Z5TEsLSnDXTtm4YbMydmN8NltZE24f8K"},
{id: 81, course: "IT", sem: "semester 7", sub: "Compiler Design", anchor: "https://drive.google.com/uc?export=download&id=1wqvtecAyg_ZeuYKrKIQkC804X6kTr3JC"},
{id: 82, course: "IT", sem: "semester 7", sub: "Distributed Operating System", anchor: "https://drive.google.com/uc?export=download&id=1Wl2iaI3F8ga0YI3Ov5Hxsh6dfQY72LfT"},
{id: 83, course: "IT", sem: "semester 7", sub: "Fundamentals of Entreprenurship", anchor: "https://drive.google.com/uc?export=download&id=1op1MtKfGpB59YHwQJHWreUC_u7RNO137"},
{id: 84, course: "IT", sem: "semester 7", sub: "Introduction to Computer Animation", anchor: "https://drive.google.com/uc?export=download&id=1KrahQM8xN3vKhk8Q_HGwxiHaYh2NYZVn"},
{id: 85, course: "IT", sem: "semester 7", sub: "Software Project Management", anchor: "https://drive.google.com/uc?export=download&id=1R-z7MgwUI-whSCjde-79qDeEfHUdwKqS"},
{id: 86, course: "IT", sem: "semester 8", sub: "Cloud Computing", anchor: "https://drive.google.com/uc?export=download&id=1pRlMY5ts64YT-WXsVjLX8C1zPWaANU7x"},
{id: 87, course: "IT", sem: "semester 8", sub: "Cryptography", anchor: "https://drive.google.com/uc?export=download&id=1WULwgbmS71u5ioOn4GQk9by3lq_CGGtr"},
{id: 88, course: "IT", sem: "semester 8", sub: "Data Warehousing and Data Minning", anchor: "https://drive.google.com/uc?export=download&id=11f_f3k8X8lDzXxyp6kBU-B9Ddat58nI_"},
{id: 89, course: "IT", sem: "semester 8", sub: "Distributed Computing", anchor: "https://drive.google.com/uc?export=download&id=1Bzsy4c-Mjy_IKiMn7BCORD5Fm1HtbvyK"},
{id: 90, course: "IT", sem: "semester 8", sub: "Embeded System", anchor: "https://drive.google.com/uc?export=download&id=1nCQEgyfPiQnBLpPmTQt8rtP8YI2ZNjin"},
{id: 91, course: "IT", sem: "semester 8", sub: "Expert Systems", anchor: "https://drive.google.com/uc?export=download&id=1480xw_ePPfjiQbj4z9hcPv8EAWLC1xZ2"},
{id: 92, course: "IT", sem: "semester 8", sub: "Expert Systems", anchor: "https://drive.google.com/uc?export=download&id=1_Tu-Kk1J9Skn7-Mz5T6FNfeHgKJz3jt8"},
{id: 93, course: "IT", sem: "semester 8", sub: "Introduction to Internet of Things", anchor: "https://drive.google.com/uc?export=download&id=18XDUCPFznmXfl5RgaKMcdT3PC93zDs8p"},
{id: 94, course: "ECE", sem: "semester 3", sub: "Analog Communication", anchor: "https://drive.google.com/uc?export=download&id=1AafA-zaPtjsQlVlEScWe9YC3o5TTLrMG"},
{id: 95, course: "ECE", sem: "semester 3", sub: "DE", anchor: "https://drive.google.com/uc?export=download&id=1D18KvCOcgBZ12aGs2wdgVBuiRlNIrdg0"},
{id: 96, course: "ECE", sem: "semester 3", sub: "Electronic Devices", anchor: "https://drive.google.com/uc?export=download&id=14A__-O9QEwt9c8Z4gI6512o3TSTizFfy"},
{id: 97, course: "ECE", sem: "semester 3", sub: "Electronic Devices", anchor: "https://drive.google.com/uc?export=download&id=1gm-7aqLkOXh6OXXcUnOmqadAbmVXMPf4"},
{id: 98, course: "ECE", sem: "semester 3", sub: "Network Theory", anchor: "https://drive.google.com/uc?export=download&id=1NHRwTx5ZcHbVnM716d4B8Cgk9hcdBXAt"},
{id: 99, course: "ECE", sem: "semester 3", sub: "Network Theory", anchor: "https://drive.google.com/uc?export=download&id=1VPUwSuQkRNC4W5zq8TKxinQ5ZYms_91A"},
{id: 100, course: "ECE", sem: "semester 3", sub: "Semiconductor devices and circuits", anchor: "https://drive.google.com/uc?export=download&id=1GsGGMgArKy_IcupFiPKoTtyyyY6HT2gT"},
{id: 101, course: "ECE", sem: "semester 4", sub: "Analog Electronics", anchor: "https://drive.google.com/uc?export=download&id=107R6ooUt9YcLBTLD6rmu9dFFzVTgK-sY"},
{id: 102, course: "ECE", sem: "semester 4", sub: "Applied and Computational Programming", anchor: "https://drive.google.com/uc?export=download&id=1L6nFl_301CYi7QSg9OAYo2dcfVL9RlrY"},
{id: 103, course: "ECE", sem: "semester 4", sub: "Control System Engineering", anchor: "https://drive.google.com/uc?export=download&id=1FdVpqPm6RSfRSHh1wJlclWoRVVYWI9sU"},
{id: 104, course: "ECE", sem: "semester 4", sub: "DSA", anchor: "https://drive.google.com/uc?export=download&id=1ywn0y8ANRXv0cHpfGBzwyeyqRCiIQDR4"},
{id: 105, course: "ECE", sem: "semester 4", sub: "Electronic Measurement and Instruments", anchor: "https://drive.google.com/uc?export=download&id=1aYysu-q_8gKjUlO5CPw-vFV2za1yvNE0"},
{id: 106, course: "ECE", sem: "semester 4", sub: "Microprocessors and Interfacing", anchor: "https://drive.google.com/uc?export=download&id=1VqINTS0dRUT6KVfJFz2irq21SPHtdM1_"},
{id: 107, course: "ECE", sem: "semester 5", sub: "Anteena and Wave Propagation", anchor: "https://drive.google.com/uc?export=download&id=17DkjVlwDqknxIawQTdgQjdDba9IFMi3J"},
{id: 108, course: "ECE", sem: "semester 5", sub: "Computer Hardware Design", anchor: "https://drive.google.com/uc?export=download&id=1VngVP_O5NJHWkclCsxeVQHm3JWj_sC0N"},
{id: 109, course: "ECE", sem: "semester 5", sub: "Control System Engineering", anchor: "https://drive.google.com/uc?export=download&id=1x0UdZSFbB05F2SFT5N50xbhVbJU4FNy1"},
{id: 110, course: "ECE", sem: "semester 5", sub: "Information Theory and Coding", anchor: "https://drive.google.com/uc?export=download&id=1ytA_v93g73wRDOsHK1bcIDR25THacZxd"},
{id: 111, course: "ECE", sem: "semester 5", sub: "Linear ic application", anchor: "https://drive.google.com/uc?export=download&id=1ixC0pOUAgMCt00REjbN0GduoYZeyr8xH"},
{id: 112, course: "ECE", sem: "semester 5", sub: "Micro Electronics", anchor: "https://drive.google.com/uc?export=download&id=1BKvzC4GU_d3MR4vCH5yvuO8g4M1Xa0Ww"},
{id: 113, course: "ECE", sem: "semester 5", sub: "Microprocessor and Interfacing", anchor: "https://drive.google.com/uc?export=download&id=1NzNcA-NVcm9mOVQzhjbOXjO7n4UMBty_"},
{id: 114, course: "ECE", sem: "semester 5", sub: "Vlsi technology", anchor: "https://drive.google.com/uc?export=download&id=11zKOk6-zN6J_BhbgDcPpkY-XFTTZh3pF"},
{id: 115, course: "ECE", sem: "semester 6", sub: "Comnputer Communication Network", anchor: "https://drive.google.com/uc?export=download&id=1BBlT9PjRismnO2B32U_gmHub3x7V6OZ5"},
{id: 116, course: "ECE", sem: "semester 6", sub: "Digital Communication", anchor: "https://drive.google.com/uc?export=download&id=1lbJsZv8XcFwu1Pe1gzeUkztxEu7ljDRY"},
{id: 117, course: "ECE", sem: "semester 6", sub: "Vhdl and a digital Design", anchor: "https://drive.google.com/uc?export=download&id=15YX9Q-IVqEsBBIgPnVLtMi99an3aVmkV"},
{id: 118, course: "ECE", sem: "semester 7", sub: "Advanced Microprocessors", anchor: "https://drive.google.com/uc?export=download&id=1Ku9jyru_XItt8POhFLPLIoNZ30R8tlC2"},
{id: 119, course: "ECE", sem: "semester 7", sub: "Consumer Electronics", anchor: "https://drive.google.com/uc?export=download&id=1Pkzzu0vCqF7jjpdPA0XRk7KwRzc4ETzu"},
{id: 120, course: "ECE", sem: "semester 7", sub: "Non conventional energy resources", anchor: "https://drive.google.com/uc?export=download&id=1PzDQfRc_5EC3-DtTXkf3VnAN7YK_baac"},
{id: 121, course: "ECE", sem: "semester 7", sub: "Power Electronics", anchor: "https://drive.google.com/uc?export=download&id=1ICUZC4pIDlWRLnKaO-A4CJUn-gyAb1JI"},
{id: 122, course: "ECE", sem: "semester 7", sub: "Releability", anchor: "https://drive.google.com/uc?export=download&id=1ZB3oGXGj8ZPV-SpCSnaG9RdC62_Y3HR8"},
{id: 123, course: "ECE", sem: "semester 7", sub: "Releability", anchor: "https://drive.google.com/uc?export=download&id=1liEBiM-W2L50lPt4Gno08AMyMweu2wAb"},
{id: 124, course: "ECE", sem: "semester 7", sub: "Television Engineering", anchor: "https://drive.google.com/uc?export=download&id=1I0xpsKENOiCX2kelz6fNBVuOoJBtR8Fi"},
{id: 125, course: "ECE", sem: "semester 8", sub: "Electronic Switching System", anchor: "https://drive.google.com/uc?export=download&id=1IkOlpu9wqxj2S9gzpCid4TDJ0tizLqNa"},
{id: 126, course: "ECE", sem: "semester 8", sub: "Embeded System design", anchor: "https://drive.google.com/uc?export=download&id=1oKPXEHc_i92vBwsGi6GmejiRbvhfXrQE"},
{id: 127, course: "ECE", sem: "semester 8", sub: "Multimedia Communication", anchor: "https://drive.google.com/uc?export=download&id=1eWDkgw0S_c5_1Q3HAClQflbdlv7Fjq3T"},
{id: 128, course: "ECE", sem: "semester 8", sub: "Neuro Fuzzy System", anchor: "https://drive.google.com/uc?export=download&id=1dp6RKclmQs84VybHLUNb1JREL1WKsZEl"},
{id: 129, course: "ECE", sem: "semester 8", sub: "Radar Engineering", anchor: "https://drive.google.com/uc?export=download&id=12-PWVicLOCMVOvD2__63v9MlH84-Hre7"},
{id: 130, course: "ECE", sem: "semester 8", sub: "Transducers and Its applications", anchor: "https://drive.google.com/uc?export=download&id=17GntSvgom-pi0khrlmwt6sg7KPGogHj0"},
{id: 131, course: "ME", sem: "semester 3", sub: "Mechanics of Solids-I", anchor: "https://drive.google.com/uc?export=download&id=1WPqatbYDqLhn28JbftfR5tLnKyIMUZWO"},
{id: 132, course: "ME", sem: "semester 3", sub: "Theory of Machines", anchor: "https://drive.google.com/uc?export=download&id=10YLu-RzvikTjZ3rPZYKaZIHTnL9tpXnv"},
{id: 133, course: "ME", sem: "semester 3", sub: "Themodynamics", anchor: "https://drive.google.com/uc?export=download&id=1MMzW4YuYNB2QIqZaaD_gyWVgI8BJE8s3"},
{id: 134, course: "ME", sem: "semester 3", sub: "Themodynamics", anchor: "https://drive.google.com/uc?export=download&id=1TRLLpqHUM_kZCecn3H3O-UiZakUtgnht"},
{id: 135, course: "ME", sem: "semester 4", sub: "Fluid Mechanics And Fluid Machines", anchor: "https://drive.google.com/uc?export=download&id=1-nrAXFU1UiXZqSyf885-kcbylZAgyKWC"},
{id: 136, course: "ME", sem: "semester 4", sub: "Fluid Mechanics And Fluid Machines", anchor: "https://drive.google.com/uc?export=download&id=1SWx9aBDSScO9kRqi4_AOvfhtx7TaCp2B"},
{id: 137, course: "ME", sem: "semester 4", sub: "Fluid Mechanics And Fluid Machines", anchor: "https://drive.google.com/uc?export=download&id=1fy2M6vYbJBT30CopJVb1iX68j-j_ICuv"},
{id: 138, course: "ME", sem: "semester 4", sub: "Fluid Mechanics And Fluid Machines", anchor: "https://drive.google.com/uc?export=download&id=1r46TSSxXJ07CjV0IeLZnW0k2_NddW0Vd"},
{id: 139, course: "ME", sem: "semester 4", sub: "Materials Engineering", anchor: "https://drive.google.com/uc?export=download&id=1z1uF_9mQh9KLB60D_Mw4MFumTvbRn8m-"},
{id: 140, course: "ME", sem: "semester 4", sub: "Mechanics of Solids-II", anchor: "https://drive.google.com/uc?export=download&id=1TXb_W6ig39Ay2OItFwl3nSkjsMJQ85qK"},
{id: 141, course: "ME", sem: "semester 5", sub: "Heat Transfer", anchor: "https://drive.google.com/uc?export=download&id=1WtNWcZT3__kdKdeXj1WTHjoDefHzbtfp"},
{id: 142, course: "ME", sem: "semester 5", sub: "Heat Transfer", anchor: "https://drive.google.com/uc?export=download&id=1zoFYNp3nIm0-flhnHRxILAQVeifeaSHR"},
{id: 143, course: "ME", sem: "semester 5", sub: "Mechanical Vibrations and Tribology", anchor: "https://drive.google.com/uc?export=download&id=1igpeFScwDc9mNZiXyssJuCwWGRIcsaKy"},
{id: 144, course: "ME", sem: "semester 5", sub: "Mechanical Vibrations and Tribology", anchor: "https://drive.google.com/uc?export=download&id=1jl8ORLntv22QkmRglJ5hg-b7jsazj3A_"},
{id: 145, course: "ME", sem: "semester 5", sub: "Production Technology", anchor: "https://drive.google.com/uc?export=download&id=14e8H5icn3w2EblUIMHf5g6600JpHEKfp"},
{id: 146, course: "ME", sem: "semester 5", sub: "Production Technology", anchor: "https://drive.google.com/uc?export=download&id=1Dp_BzN8FseaC7VPvENl0Sba9jMvsdlvp"},
{id: 147, course: "ME", sem: "semester 5", sub: "Production Technology", anchor: "https://drive.google.com/uc?export=download&id=1mGM-ureE_6TIVP5ET61EATFR1BuqN9QQ"},
{id: 148, course: "ME", sem: "semester 6", sub: "Design of Machine Element", anchor: "https://drive.google.com/uc?export=download&id=14e8H5icn3w2EblUIMHf5g6600JpHEKfp"},
{id: 149, course: "ME", sem: "semester 6", sub: "Design of Machine Element", anchor: "https://drive.google.com/uc?export=download&id=1Dp_BzN8FseaC7VPvENl0Sba9jMvsdlvp"},
{id: 150, course: "ME", sem: "semester 6", sub: "Design of Machine Element", anchor: "https://drive.google.com/uc?export=download&id=1mGM-ureE_6TIVP5ET61EATFR1BuqN9QQ"},
{id: 151, course: "ME", sem: "semester 6", sub: "Manufacturing Technology", anchor: "https://drive.google.com/uc?export=download&id=1DwCvIUilN-FoY6IuU-aEJirPRRf2Gbjo"},
{id: 152, course: "ME", sem: "semester 7", sub: "Environmental Pollution and Abatement", anchor: "https://drive.google.com/uc?export=download&id=1Jo1jdi9hyqM23WT8it57bbhR0190LV-3"},
{id: 153, course: "ME", sem: "semester 7", sub: "Roboticsmechanics and control", anchor: "https://drive.google.com/uc?export=download&id=1_8ojQ6G_XZOu8ju3-_wTSu0KJKhaJI9h"},
{id: 154, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=125kQM0vNikllFYN-raouPa-VvhhXUY8A"},
{id: 155, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=14DIHXdrSSHK-4xgjX8HZNJx6E4mnngS4"},
{id: 156, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=15E-Hmg2S2wDiLrF0vev__T4EJWUl59DD"},
{id: 157, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=18VAggwAOeRNiVc25d2THilBEzhwySHtO"},
{id: 158, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=19rBcb2ToWoQmhx4h4dsYk1SZNnHT2Zo2"},
{id: 159, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=19sn_5DnFBDLCW7iJhxYYcv5nYhBNKInK"},
{id: 160, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1A14yE7jO8I0ZlADar84_3d7UiGuvPGE2"},
{id: 161, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1BM5s58v8MxM3AkLqfTnOrIyruf1oPzUh"},
{id: 162, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1C02mhqMT28Y_crr4O2pNKeJNVrqHBc_A"},
{id: 163, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1DiXN0rMb-HpLNqOnxUyYJZ9mlD0hdktj"},
{id: 164, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1EU9Dm-70VSoImcBBudCjkulgIWzaFSnA"},
{id: 165, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1HdzHbWhCi0BbZ2uRew9ACfwLEr2oGM2f"},
{id: 166, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1I0A0dEle3J-7yEVrP1690Z2IZRmYm9ce"},
{id: 167, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1KPwlv3Hx6LuPVEPqqzC3R7dvtnTqZzQQ"},
{id: 168, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1Krk8op2-yqWTFeOV12ytRcOdvwLd50QS"},
{id: 169, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1MjOwlSX_NN_7i_UE1K9O0nYcApxdVAhn"},
{id: 170, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1MswPKYkEKTSYMQ7zcBPOcrQ_zn5wC_pG"},
{id: 171, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1Nmyb9mS27RFxJ1a3Ql9GvKcmRUVZA_qh"},
{id: 172, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1P7wXMLALx7g_ckquY1kI-tVYaTqc_lZC"},
{id: 173, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1QqIoSO7FUIlcXPIsMJWO_EGYvnYbxyWO"},
{id: 174, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1SVYTKRUtsbHCGFmJ9m0nWMntcsAZNEqI"},
{id: 175, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1WeCmmExZyHlNRRda01E6iqQuU3oanpN_"},
{id: 176, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1Wv0smx8K8f4iw_F2kh7ZP21Ly3pD294j"},
{id: 177, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1ahH3EpnRfoWwpcoeLG9Y-8iBsDe17MXH"},
{id: 178, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1fS_2MD2mPj6t5cv5VRS9Mn58xnD6rNJB"},
{id: 179, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1g5IBSdiydv_c0uKOEyWQwfxMNV8EinC0"},
{id: 180, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1gWW7rDL0v2dEuWvV-iBowtWYIRE_iK3w"},
{id: 181, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1kktg3HT3uuuwHQ-Yr8uPTX0D1_DI92WK"},
{id: 182, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1l0XBIIgiKmQ0PmAqs0ZilCr6M7f2CvRL"},
{id: 183, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1oRC7rFSNpzyFy7twos5jaRlXrdy4yxAC"},
{id: 184, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1pMKUSyH5bZ39Aa-vh9xuzOJnsNkmNSIe"},
{id: 185, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1qTi0JXKNneY3wCrFvNq5WOD8PSyCoWCM"},
{id: 186, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1roJUEua19Uo-eEMAPJkPaFyFVa93su2A"},
{id: 187, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1rpdEktfjpaEsKhfJg8OBBuMF6-eT2J7t"},
{id: 188, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1tnNS5ukjaPDqDaa5u9AZA_7Y8DR3oJZ-"},
{id: 189, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1vWE2lOO_dkUtHQskmWjbL2cc0DBCcQf6"},
{id: 190, course: "ME", sem: "semester 7", sub: "Others", anchor: "https://drive.google.com/uc?export=download&id=1x3CJPynMJDtuLeiQgu64kdv3-xFKdV3F"},
{id: 191, course: "BCA", sem: "semester 1", sub: "Communicative English", anchor: "https://drive.google.com/uc?export=download&id=1yTdtkSRGv96WAfmeyf3c247fuEZbU3VQ"},
{id: 192, course: "BCA", sem: "semester 1", sub: "Computer and Programming Fundamentals", anchor: "https://drive.google.com/uc?export=download&id=1ftRn-MJAnuPXP3-nBo_eRgoxiElE49sF"},
{id: 193, course: "BCA", sem: "semester 1", sub: "Logical Organisation Of computers-I", anchor: "https://drive.google.com/uc?export=download&id=1xIzcZTRiq9NE07Mv_kGnrK3_R_yIRaWD"},
{id: 194, course: "BCA", sem: "semester 1", sub: "Mathematical Foundation-I", anchor: "https://drive.google.com/uc?export=download&id=1UDJ7FwyESlWbnsysF2BXG5OEVwZslDIz"},
{id: 195, course: "BCA", sem: "semester 1", sub: "Programming in C", anchor: "https://drive.google.com/uc?export=download&id=1Zx_xyJOjl8wUqpUSGJ6VH7B6ZcKdZsiN"},
{id: 196, course: "BCA", sem: "semester 1", sub: "Windows and PC software", anchor: "https://drive.google.com/uc?export=download&id=1zUIBtozCD_6hstrUqKrCncTjXt2lROW1"},
{id: 197, course: "BCA", sem: "semester 2", sub: "Logical Organisation of Computers-II", anchor: "https://drive.google.com/uc?export=download&id=164GthLfu19mWU8Dm9aJDCB2K15NtKJ9o"},
{id: 198, course: "BCA", sem: "semester 2", sub: "Mathematical Foundations-II", anchor: "https://drive.google.com/uc?export=download&id=1aI5gQ3Ngz4dB64pYw685efx07U4qCoHW"},
{id: 199, course: "BCA", sem: "semester 2", sub: "Office Automation Tools", anchor: "https://drive.google.com/uc?export=download&id=12oPxGBeI_Jh48RVJ83FCDbfR6aJc00Pa"},
{id: 200, course: "BCA", sem: "semester 3", sub: "Computer Architecture", anchor: "https://drive.google.com/uc?export=download&id=1sNTfSPhRp_IYKERfZvZQeavRq2v2KPLY"},
{id: 201, course: "BCA", sem: "semester 3", sub: "Computer Architecture", anchor: "https://drive.google.com/uc?export=download&id=1y80Rq3oH1XjNgnb5ewgZ-pEYoxCBIIud"},
{id: 202, course: "BCA", sem: "semester 3", sub: "Computer Oriented Numerical Methods", anchor: "https://drive.google.com/uc?export=download&id=18hd66TsD9plog4HCuc-rb75UZvTB5xLw"},
{id: 203, course: "BCA", sem: "semester 3", sub: "Data Structures", anchor: "https://drive.google.com/uc?export=download&id=1EDe9DjwrEw6v9HjvNf1jSs9JH12MN1Rn"},
{id: 204, course: "BCA", sem: "semester 3", sub: "Data Structures", anchor: "https://drive.google.com/uc?export=download&id=1xvo9w9Rbx2wqTNrdr4r9-OfAyW7StxwJ"},
{id: 205, course: "BCA", sem: "semester 3", sub: "Fundamentals of Data Base Systems", anchor: "https://drive.google.com/uc?export=download&id=1xEwSuE7bmc9W_bEdnD9-j22g0B-svSDq"},
{id: 206, course: "BCA", sem: "semester 3", sub: "OOP using C++", anchor: "https://drive.google.com/uc?export=download&id=1xEwSuE7bmc9W_bEdnD9-j22g0B-svSDq"},
{id: 207, course: "BCA", sem: "semester 3", sub: "Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=1DH1VQEQ1KxQJsNd_tEcN4GQGGXzCSgvV"},
{id: 208, course: "BCA", sem: "semester 4", sub: "Advance Data Structure", anchor: "https://drive.google.com/uc?export=download&id=1oq5lm4hQgu3ktoEYXrT8TX-c669TuFKk"},
{id: 209, course: "BCA", sem: "semester 4", sub: "Advanced Programming using C++", anchor: "https://drive.google.com/uc?export=download&id=1y6xiHgHamIMok_WqVFgZsdgUgv0kOEIg"},
{id: 210, course: "BCA", sem: "semester 4", sub: "Computer Oriented Statistical Methods", anchor: "https://drive.google.com/uc?export=download&id=1z4DM0UTmjj9ONh5FyOAqMrvCnPh3gQZc"},
{id: 211, course: "BCA", sem: "semester 4", sub: "Management Information System", anchor: "https://drive.google.com/uc?export=download&id=1HxSwrcZg4ru-fJzV-X36a6B6bA0gGguX"},
{id: 212, course: "BCA", sem: "semester 4", sub: "Relational Data Base Management System", anchor: "https://drive.google.com/uc?export=download&id=12ym6uxHZmSdTHOXL5r_Vj2sfF9i-mAGv"},
{id: 213, course: "BCA", sem: "semester 4", sub: "Relational Data Base Management System", anchor: "https://drive.google.com/uc?export=download&id=1ep5_U4UpjD1hi_nETlqTu_AblBJaDEwd"},
{id: 214, course: "BCA", sem: "semester 5", sub: "AI", anchor: "https://drive.google.com/uc?export=download&id=1LddtT1YKdzOaRjiHVhJOVuqp5z9pDP-q"},
{id: 215, course: "BCA", sem: "semester 5", sub: "Computer Networks", anchor: "https://drive.google.com/uc?export=download&id=1fqfa7pGwe-PlS-n8VOIxTIzCEPL4SNE4"},
{id: 216, course: "BCA", sem: "semester 5", sub: "Multimedia Tools", anchor: "https://drive.google.com/uc?export=download&id=1JB0JJMQ0Z8u8hFYxzOB1posAWvVBbOP2"},
{id: 217, course: "BCA", sem: "semester 5", sub: "OS-I", anchor: "https://drive.google.com/uc?export=download&id=1UGVo356rdU5F_lBTse-cs9ehsyvHh1zS"},
{id: 218, course: "BCA", sem: "semester 5", sub: "Programming Using Visual Basic", anchor: "https://drive.google.com/uc?export=download&id=1e1IL__LjAgOGxXc7YgfpLu4ChH4jtW0Q"},
{id: 219, course: "BCA", sem: "semester 5", sub: "Web Designing Fundamentals", anchor: "https://drive.google.com/uc?export=download&id=134HP7wgSeirq8rw83hY8yclmu_4iEwGG"},
{id: 220, course: "BCA", sem: "semester 6", sub: "Advanced Programming With Visual basic", anchor: "https://drive.google.com/uc?export=download&id=1WUnErwAd7sz240ECij_AB3QHz7-tuf2a"},
{id: 221, course: "BCA", sem: "semester 6", sub: "Advanced Programming With Visual basic", anchor: "https://drive.google.com/uc?export=download&id=1qy8k42pnTJgoZJd_N6KnAP6YVGkQzNxs"},
{id: 222, course: "BCA", sem: "semester 6", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1T6XkZS3M1d_3FHa614mF0pzuwM9vtVAf"},
{id: 223, course: "BCA", sem: "semester 6", sub: "environment management", anchor: "https://drive.google.com/uc?export=download&id=1Pp88OMtZfxQI45zoik97uHUqDv__1Fr4"},
{id: 224, course: "BCA", sem: "semester 6", sub: "Internet Technologies", anchor: "https://drive.google.com/uc?export=download&id=1ETD7NR9kLESOxEPZjl7Z1y2H7yhnswuP"},
{id: 225, course: "BCA", sem: "semester 6", sub: "Internet Technologies", anchor: "https://drive.google.com/uc?export=download&id=1d4xTIF2jYIvKRQ-cqjiW-gauKLe7hD6W"},
{id: 226, course: "BCA", sem: "semester 6", sub: "OS-II", anchor: "https://drive.google.com/uc?export=download&id=1owa8bwX-jO-SCRg9i1X1dKyN_ViN1_aR"},
{id: 227, course: "BCA", sem: "semester 6", sub: "Programming in Core Java", anchor: "https://drive.google.com/uc?export=download&id=1dMth68Cwe6iXIwnV8i2qEd9cExceiXg0"},
{id: 228, course: "BCA", sem: "semester 6", sub: "Web Designing Using Advanced Tools", anchor: "https://drive.google.com/uc?export=download&id=104TPqeFPu3yySIA5yrdGtQteFkoaDrZQ"},
{id: 229, course: "BCA", sem: "semester 6", sub: "Web Designing Using Advanced Tools", anchor: "https://drive.google.com/uc?export=download&id=13ux9dOwvtOhJ_lSY39jg-eDIYCTXIqWW"},
{id: 230, course: "BCA", sem: "semester 6", sub: "Web Designing Using Advanced Tools", anchor: "https://drive.google.com/uc?export=download&id=1zvzQT1g-85Ao1gjXgDUmEaFDUHYAPWsi"},
{id: 231, course: "BBA", sem: "semester 1", sub: "Business Accounting", anchor: "https://drive.google.com/uc?export=download&id=1dvAaqWL4SGSD3WyGasr7JWQVtAZmLflm"},
{id: 232, course: "BBA", sem: "semester 1", sub: "business Mathematics", anchor: "https://drive.google.com/uc?export=download&id=1pPQtTnQhnZMwaJlMaed-JdREFzeL2-An"},
{id: 233, course: "BBA", sem: "semester 1", sub: "Business Organisation", anchor: "https://drive.google.com/uc?export=download&id=1Z3olwZAR0fpHS4p7K4KymxjXwakreCZP"},
{id: 234, course: "BBA", sem: "semester 1", sub: "Computer fundamentals", anchor: "https://drive.google.com/uc?export=download&id=1LvQT08FchBPDRe7pg_5iY5Pmqi0PLXAw"},
{id: 235, course: "BBA", sem: "semester 1", sub: "Hindi", anchor: "https://drive.google.com/uc?export=download&id=1sjnIs6oMqp2gCsz-y3yk4vqqaV3dvudT"},
{id: 236, course: "BBA", sem: "semester 1", sub: "Managerial economics", anchor: "https://drive.google.com/uc?export=download&id=1__nzKv3wIxrxRi7ha8vPLCAzX2y5w2UN"},
{id: 237, course: "BBA", sem: "semester 2", sub: "Analysis of financial statements", anchor: "https://drive.google.com/uc?export=download&id=1SLeY17XXe0pc2a3f4ls1uO7tH78pYaj2"},
{id: 238, course: "BBA", sem: "semester 2", sub: "Business mathematics", anchor: "https://drive.google.com/uc?export=download&id=1nPMx_63NoaBYFF20Sw06bnPjN3SsnVBZ"},
{id: 239, course: "BBA", sem: "semester 2", sub: "COmputer Architecture", anchor: "https://drive.google.com/uc?export=download&id=14qzKp3c7iKXEjZutvvD_-Vl0CtvRAedt"},
{id: 240, course: "BBA", sem: "semester 2", sub: "computer oriented statstical", anchor: "https://drive.google.com/uc?export=download&id=1wsPUmjIyRvoVdC7t-QNpsiA7pNkdzTPs"},
{id: 241, course: "BBA", sem: "semester 2", sub: "Managerial economics", anchor: "https://drive.google.com/uc?export=download&id=1US8yFNgA-yJek6H3SueqHtnAkvPIjOwX"},
{id: 242, course: "BBA", sem: "semester 2", sub: "Managerial economics", anchor: "https://drive.google.com/uc?export=download&id=1c-nUcZ2KOpRDyLcqQQKC0vIa_be0bkV3"},
{id: 243, course: "BBA", sem: "semester 2", sub: "Principles of management", anchor: "https://drive.google.com/uc?export=download&id=1ZEYBiLMrGYDgAlIkq-oyEwAwe7DC25vI"},
{id: 244, course: "BBA", sem: "semester 2", sub: "Principles of management", anchor: "https://drive.google.com/uc?export=download&id=1orLO-C_lkzd3mPYkwlP_caP6Sphq1mi5"},
{id: 245, course: "BBA", sem: "semester 2", sub: "Understanding Social Behaviour", anchor: "https://drive.google.com/uc?export=download&id=1G1Pv4uUsBHUFUzV0DOSt2pKb24tz-48P"},
{id: 246, course: "BBA", sem: "semester 3", sub: "Business Law-1", anchor: "https://drive.google.com/uc?export=download&id=17kTcNH8tgNL3DXb2zapoLkH4ikcHqQLa"},
{id: 247, course: "BBA", sem: "semester 3", sub: "Business Law-1", anchor: "https://drive.google.com/uc?export=download&id=1ijrk0pukOSQP0wXVU2_GebVsSsLUcsIM"},
{id: 248, course: "BBA", sem: "semester 3", sub: "Export", anchor: "https://drive.google.com/uc?export=download&id=1_boWUpWHuL1rp4Y4dLlhgEykfO5s8Joc"},
{id: 249, course: "BBA", sem: "semester 3", sub: "fundamentals of e commerce", anchor: "https://drive.google.com/uc?export=download&id=1PtJ7zOKEilt-piQEACblNMQpXkrIBO6p"},
{id: 250, course: "BBA", sem: "semester 3", sub: "principles of banking", anchor: "https://drive.google.com/uc?export=download&id=13BlpSOR25F4COw1gUjU5L39vXpIaY4Bj"},
{id: 251, course: "BBA", sem: "semester 3", sub: "principles of production management", anchor: "https://drive.google.com/uc?export=download&id=1zidZLaPOU-nLMkr57jmx43nGUvonq0BV"},
{id: 252, course: "BBA", sem: "semester 3", sub: "principles of retailing", anchor: "https://drive.google.com/uc?export=download&id=1qZh0RPO7jjnq42IaksMqvHc5mjSpSDv3"},
{id: 253, course: "BBA", sem: "semester 4", sub: "Business Statistics-II", anchor: "https://drive.google.com/uc?export=download&id=1p5dhmPv7oNCONs8yceqZ9zZhKwPN-zx_"},
{id: 254, course: "BBA", sem: "semester 4", sub: "Financial Management", anchor: "https://drive.google.com/uc?export=download&id=1r001dKHowRvtfS-v0DA0k6s_SGs-W9Xa"},
{id: 255, course: "BBA", sem: "semester 4", sub: "Human Behaviour at Work", anchor: "https://drive.google.com/uc?export=download&id=1MpIBGj-5o9Wg4Y6A2cV-PJKq85EbhFMZ"},
{id: 256, course: "BBA", sem: "semester 4", sub: "Macro Business Enviornment", anchor: "https://drive.google.com/uc?export=download&id=1kLB0JV04g2G15jeamJX5IEjFH_-Rk67W"},
{id: 257, course: "BBA", sem: "semester 4", sub: "Marketing Management", anchor: "https://drive.google.com/uc?export=download&id=1m7lJGPEsS85V_lOeACYD1I5IYAKMWmNU"},
{id: 258, course: "BBA", sem: "semester 5", sub: "Buseiness Law-I", anchor: "https://drive.google.com/uc?export=download&id=1CJFZYdIm_807reMVzPszHTNOmskgkoEz"},
{id: 259, course: "BBA", sem: "semester 5", sub: "Buseiness Law-I", anchor: "https://drive.google.com/uc?export=download&id=1POikZIWnwHcklYT5gqVnmn6dkvMMaDku"},
{id: 260, course: "BBA", sem: "semester 5", sub: "Export Procedures and Documentation", anchor: "https://drive.google.com/uc?export=download&id=1IOBtKB-jIXqZDyIzPNxkRWQL1VhHdoSa"},
{id: 261, course: "BBA", sem: "semester 5", sub: "Fundamentals of e-commerece", anchor: "https://drive.google.com/uc?export=download&id=1Cq480HoBF7a5Gl3P8iTjNXvgcHfSRj1G"},
{id: 262, course: "BBA", sem: "semester 5", sub: "Principles of Banking", anchor: "https://drive.google.com/uc?export=download&id=1QdYhW1hX56H8i09smoOooMUdURwjA7ym"},
{id: 263, course: "BBA", sem: "semester 5", sub: "Principles of Banking", anchor: "https://drive.google.com/uc?export=download&id=1cqnBdE05Qhi0YSGFsLjjXTvE-TiZVlCF"},
{id: 264, course: "BBA", sem: "semester 5", sub: "Principles of Production Management", anchor: "https://drive.google.com/uc?export=download&id=1ZB575sSkKL93KmKaI0bY-3H33-sHRQ22"},
{id: 265, course: "BBA", sem: "semester 5", sub: "Principles of retailing", anchor: "https://drive.google.com/uc?export=download&id=1J9x8ivQYYr2K1yvdqQR0mTmlS4BWe4Cu"},
{id: 266, course: "BBA", sem: "semester 6", sub: "Introduction to Financial Services", anchor: "https://drive.google.com/uc?export=download&id=13ypXx5uwIsZmaYA2DVuZn3IX1y3jruSJ"},
{id: 267, course: "BBA", sem: "semester 6", sub: "Logistic Management", anchor: "https://drive.google.com/uc?export=download&id=1yEqm4BsRdjUAEA442iODIYNYBClHiLfC"},
{id: 268, course: "BBA", sem: "semester 6", sub: "Principles of Insurance", anchor: "https://drive.google.com/uc?export=download&id=1krF00gOu_bPsPlmKGsUlGY_gzLB4ZNph"},
{id: 269, course: "MCA", sem: "semester 1", sub: "Computer Organisation", anchor: "https://drive.google.com/uc?export=download&id=10ottZ6qK20yLNRRoUPDvnZM-ZpvflD7f"},
{id: 270, course: "MCA", sem: "semester 1", sub: "Discreate Mathematics", anchor: "https://drive.google.com/uc?export=download&id=17uXhXO9CsA6bRBtA-H1oR0kpBjJ-NzO-"},
{id: 271, course: "MCA", sem: "semester 1", sub: "Programming in C", anchor: "https://drive.google.com/uc?export=download&id=1JZdqjiUC-Cv_1nyar2A6t0V07ZYwQTFW"},
{id: 272, course: "MCA", sem: "semester 1", sub: "Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=1-37OqedYZC97RtZCH1p30J-r6St2gBxK"},
{id: 273, course: "MCA", sem: "semester 2", sub: "Computer Networks and Data Communication", anchor: "https://drive.google.com/uc?export=download&id=1pv6qTTNmHkVMbYDTTVzngt1k8hN5VOUH"},
{id: 274, course: "MCA", sem: "semester 2", sub: "Computer Oriented and Statistical methods", anchor: "https://drive.google.com/uc?export=download&id=1IKhLhzqXyWzfPSR1VmVEtd0sIkfb0Yg1"},
{id: 275, course: "MCA", sem: "semester 2", sub: "Data Structures", anchor: "https://drive.google.com/uc?export=download&id=11x8NCNqUsx9j6jg25HWs59ZDWTqz-dEZ"},
{id: 276, course: "MCA", sem: "semester 2", sub: "Data Structures", anchor: "https://drive.google.com/uc?export=download&id=1M2U2ZlshhygArxwZMy9mrLM849eGNCgE"},
{id: 277, course: "MCA", sem: "semester 2", sub: "PPL", anchor: "https://drive.google.com/uc?export=download&id=1LnqMvNbUayy53eIMOB13_1RY0QxkqW6x"},
{id: 278, course: "MCA", sem: "semester 2", sub: "PPL", anchor: "https://drive.google.com/uc?export=download&id=1sXJiP9VQbJ0G_EGb1UV7YKARghCJL64j"},
{id: 279, course: "MCA", sem: "semester 2", sub: "Web Technologies", anchor: "https://drive.google.com/uc?export=download&id=1krzL4EdZZ_lc86r9hgQzBxS5eNnn4Ssa"},
{id: 280, course: "MCA", sem: "semester 3", sub: "computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1oOfqUE8RbqZNyZNBBA5C5eB2Lf1p6ESA"},
{id: 281, course: "MCA", sem: "semester 3", sub: "Computer Nretworks and Data Communication", anchor: "https://drive.google.com/uc?export=download&id=1O5LNynMYAGWgNFYRa78hNHKCnd3gni7Y"},
{id: 282, course: "MCA", sem: "semester 3", sub: "Databsase Management Systems", anchor: "https://drive.google.com/uc?export=download&id=1oMJ6-EZWBZ7bVk1DFORKpFOovczOOlnb"},
{id: 283, course: "MCA", sem: "semester 4", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1PmqMQFJfwTG3QbiFihMjJ2OAqy99AUHu"},
{id: 284, course: "MCA", sem: "semester 4", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=1aH8biqj9SIFfxpPrB7DXy0ujDqzkNEa6"},
{id: 285, course: "MCA", sem: "semester 4", sub: "Data Warehousing and mIning", anchor: "https://drive.google.com/uc?export=download&id=1Pllvs5JQpcpbaVIeqjpElLO3eMiayG5p"},
{id: 286, course: "MCA", sem: "semester 4", sub: "Data Warehousing and mIning", anchor: "https://drive.google.com/uc?export=download&id=1txnQC0VhXxC4H5QAQ7iBG-gPi0_ehgOV"},
{id: 287, course: "MCA", sem: "semester 4", sub: "Object Oriented Methodology", anchor: "https://drive.google.com/uc?export=download&id=1es2yDXpXyXM0PkjqpV9_jJKiUi76981I"},
{id: 288, course: "MCA", sem: "semester 5", sub: "advanced Web Technology", anchor: "https://drive.google.com/uc?export=download&id=13RoKrkj2G3gXR_hV9hmIbiFhhr5J-mHV"},
{id: 289, course: "MCA", sem: "semester 5", sub: "AI", anchor: "https://drive.google.com/uc?export=download&id=1S7cJGRDWBXThM-rNQyVL8407EtLC7Ta1"},
{id: 290, course: "MCA", sem: "semester 5", sub: "Cloud Computing", anchor: "https://drive.google.com/uc?export=download&id=1_L2myCHlZwfWLQxxMZG38ogh7TvjL3Rx"},
{id: 291, course: "MCA", sem: "semester 5", sub: "Computer Architecture and parallel Processing", anchor: "https://drive.google.com/uc?export=download&id=1-iPPl--OKE5fx9QRl3ZJyqlBcdacYNb_"},
{id: 292, course: "MCA", sem: "semester 5", sub: "Computer Graphics", anchor: "https://drive.google.com/uc?export=download&id=190YhkniVULVBada2rvxea0-6WVDOrGzg"},
{id: 293, course: "MCA", sem: "semester 5", sub: "Linux and shell Programming", anchor: "https://drive.google.com/uc?export=download&id=1gDGC0r0K0VAQc5YcI-ApCpORxc_6izzl"},
{id: 294, course: "MCA", sem: "semester 5", sub: "Linux and shell Programming", anchor: "https://drive.google.com/uc?export=download&id=1mlg9-P-boc8ZSZ6aaEonhrIoMRE_j6UJ"},
{id: 295, course: "MBA", sem: "semester 1", sub: "Business Communication", anchor: "https://drive.google.com/uc?export=download&id=1NOQZx3jIX5Kmct9c5vR0po-g9zxLTwpL"},
{id: 296, course: "MBA", sem: "semester 1", sub: "Business Communication", anchor: "https://drive.google.com/uc?export=download&id=1TUPIMTDQ9cEjgTJsBzuz21W_EeCM4sTy"},
{id: 297, course: "MBA", sem: "semester 1", sub: "Business Environment", anchor: "https://drive.google.com/uc?export=download&id=15GmSx61mz_4srvh8-8Wp7hXT1w9TV7U_"},
{id: 298, course: "MBA", sem: "semester 1", sub: "Computer Applications for Business", anchor: "https://drive.google.com/uc?export=download&id=18lEGx_U6RZhXsMYJRadyx-A9Y2tBFG0W"},
{id: 299, course: "MBA", sem: "semester 1", sub: "computer Oriented numerical", anchor: "https://drive.google.com/uc?export=download&id=1xovDTT8tlKho9tsrih2K-qTqyW2lQ1xX"},
{id: 300, course: "MBA", sem: "semester 1", sub: "Financial Reporting, Statements and Analysis", anchor: "https://drive.google.com/uc?export=download&id=1Tgl13swtoMQOR56aKm1cGcKVVhFzGjnV"},
{id: 301, course: "MBA", sem: "semester 2", sub: "Business Communication", anchor: "https://drive.google.com/uc?export=download&id=1KSE1XerICwO0o63RLom2EbBpnZznI87P"},
{id: 302, course: "MBA", sem: "semester 2", sub: "Business Communication", anchor: "https://drive.google.com/uc?export=download&id=1LgE8EurhDqTnqT4Erwu2EBmoy6QQ5M-u"},
{id: 303, course: "MBA", sem: "semester 2", sub: "Business laws", anchor: "https://drive.google.com/uc?export=download&id=1-6riadrkbRFxAvcBauA950I3DwdRTdn_"},
{id: 304, course: "MBA", sem: "semester 2", sub: "Business laws", anchor: "https://drive.google.com/uc?export=download&id=12SPEVx3471NOXmfY0NxxEAJNmXpxE0Se"},
{id: 305, course: "MBA", sem: "semester 2", sub: "Business laws", anchor: "https://drive.google.com/uc?export=download&id=1DQCku__f0OxYUaNzMqd6A_h9CycT4cDJ"},
{id: 306, course: "MBA", sem: "semester 2", sub: "Business Research Methodology", anchor: "https://drive.google.com/uc?export=download&id=1LBgUNFwRXTah8Jxm8wSjZDtoEH0lpxBT"},
{id: 307, course: "MBA", sem: "semester 2", sub: "Business Research Methodology", anchor: "https://drive.google.com/uc?export=download&id=1Y9h0-x_iIBvSmLqksiHUQYQ38fJGlabP"},
{id: 308, course: "MBA", sem: "semester 2", sub: "Business Research Methodology", anchor: "https://drive.google.com/uc?export=download&id=1ZZuc2RZN_tDmNo99tQkrXz-jTR3Nhp4I"},
{id: 309, course: "MBA", sem: "semester 2", sub: "Business Research Methodology", anchor: "https://drive.google.com/uc?export=download&id=1wvZAEtAmZVf6LVN2nZSWE-lZAxgX1P7Z"},
{id: 310, course: "MBA", sem: "semester 2", sub: "Business Statistics", anchor: "https://drive.google.com/uc?export=download&id=1LhUpsFBuqznrIzanMrT76qFg0zEbGrVu"},
{id: 311, course: "MBA", sem: "semester 2", sub: "Corporate Finance", anchor: "https://drive.google.com/uc?export=download&id=1gIn9FQGqPQEup7eHeNm56Q_7v0Rt-Piu"},
{id: 312, course: "MBA", sem: "semester 2", sub: "Ecrum", anchor: "https://drive.google.com/uc?export=download&id=15o5jlKoqoW2EWtTJUOz93vffbPoAGyI2"},
{id: 313, course: "MBA", sem: "semester 2", sub: "Financial Accounting and autiding", anchor: "https://drive.google.com/uc?export=download&id=1DAiFB6F2Ue1yw0F3QKF5Qy4cTrVoAWYl"},
{id: 314, course: "MBA", sem: "semester 2", sub: "Financial Accounting and autiding", anchor: "https://drive.google.com/uc?export=download&id=1ROvYMWvD_KywSlWIA5PzpU0su0dVTZlF"},
{id: 315, course: "MBA", sem: "semester 2", sub: "Financial Accounting and autiding", anchor: "https://drive.google.com/uc?export=download&id=1tV5-yXa9GdiflcaL8qpMBICxY2c-ywh1"},
{id: 316, course: "MBA", sem: "semester 2", sub: "Financial Management", anchor: "https://drive.google.com/uc?export=download&id=11pdtX4b7KSW6NivEhNbCCnCQ1yT-gDR0"},
{id: 317, course: "MBA", sem: "semester 2", sub: "Financial Management", anchor: "https://drive.google.com/uc?export=download&id=1VkdWy3eNj7ZfgJcx5wCEeLS5EvcLWKO6"},
{id: 318, course: "MBA", sem: "semester 2", sub: "Financial Management", anchor: "https://drive.google.com/uc?export=download&id=1ltfxbGwuFZiFY0y-dzbsDLtOp7Bizwxk"},
{id: 319, course: "MBA", sem: "semester 2", sub: "Financial Management", anchor: "https://drive.google.com/uc?export=download&id=1nB7BNB1_UzgeNzQAVOGYcRyUsiD4Qtnt"},
{id: 320, course: "MBA", sem: "semester 2", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1Ln6gA3kPyvWv1FI65FQfLidlmGRCN3yY"},
{id: 321, course: "MBA", sem: "semester 2", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1cDtho6oY4aFMZZURiEUbcEHnCBg_xfoR"},
{id: 322, course: "MBA", sem: "semester 2", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1j59YdCUdFgxtEoA6A2_inPX1hZnISNPQ"},
{id: 323, course: "MBA", sem: "semester 2", sub: "Legal Environment", anchor: "https://drive.google.com/uc?export=download&id=1FTkUa5x1wxtatih65HiK-03gxKnXKq3d"},
{id: 324, course: "MBA", sem: "semester 2", sub: "Marketing Management", anchor: "https://drive.google.com/uc?export=download&id=15_Sj5_ShTW7uo6I1bLj7n1KfzFiq3Vnp"},
{id: 325, course: "MBA", sem: "semester 2", sub: "Marketing Management", anchor: "https://drive.google.com/uc?export=download&id=1Uqu32fAZzUialxhFIGD7R40cssbEfn9u"},
{id: 326, course: "MBA", sem: "semester 2", sub: "Marketing Management", anchor: "https://drive.google.com/uc?export=download&id=1XpvBDvUvfgTPTO8N9w9othf_S47-gvAR"},
{id: 327, course: "MBA", sem: "semester 2", sub: "Marketing Management", anchor: "https://drive.google.com/uc?export=download&id=1o_ksbxC7aCiOlVtlsBQmahtJO7F6RF2b"},
{id: 328, course: "MBA", sem: "semester 2", sub: "Optimization Models for Business Decisions", anchor: "https://drive.google.com/uc?export=download&id=1cFBd-7KzSK3bGYh5EvikV_XurJ3wbkzI"},
{id: 329, course: "MBA", sem: "semester 2", sub: "Optimization Models for Business Decisions", anchor: "https://drive.google.com/uc?export=download&id=1q9agvpZumh0V9w9WFYmzflhxGM1jerr4"},
{id: 330, course: "MBA", sem: "semester 2", sub: "Organisational Behaviour", anchor: "https://drive.google.com/uc?export=download&id=1UAeqXjVqd2Xe4EJb9ufZjiWh_XVHb3UB"},
{id: 331, course: "MBA", sem: "semester 2", sub: "production and Operational Management", anchor: "https://drive.google.com/uc?export=download&id=1MS_zRtTN0N30jSOARgNBohfeiMxSwmAD"},
{id: 332, course: "MBA", sem: "semester 2", sub: "production and Operational Management", anchor: "https://drive.google.com/uc?export=download&id=1Nk-DML0Xe0qHBLQnTLXHCveDxHxoH7Q5"},
{id: 333, course: "MBA", sem: "semester 2", sub: "production and Operational Management", anchor: "https://drive.google.com/uc?export=download&id=1RL_HPAaX7U6kc32IhC72zf-hc_mSq0pC"},
{id: 334, course: "MBA", sem: "semester 3", sub: "Advertising Management", anchor: "https://drive.google.com/uc?export=download&id=1oFpWgy897nKII6yP5QYmLqLOJxtzbl8y"},
{id: 335, course: "MBA", sem: "semester 3", sub: "Banking and FInancial Services", anchor: "https://drive.google.com/uc?export=download&id=1FMDggtQ0I44jWPb8Tinvq0r3J7nIfrGI"},
{id: 336, course: "MBA", sem: "semester 3", sub: "compensation and Reward Management", anchor: "https://drive.google.com/uc?export=download&id=1MkwvXtmcmmlJC6pdx4oNpNtRVBdRieOd"},
{id: 337, course: "MBA", sem: "semester 3", sub: "Consumer Behaviour", anchor: "https://drive.google.com/uc?export=download&id=1JIAEvPl2VvJ1Qr1pte9oO2d3lZ-rk22X"},
{id: 338, course: "MBA", sem: "semester 3", sub: "Consumer Behaviour", anchor: "https://drive.google.com/uc?export=download&id=1skhRkPL8ojBGhgZ0RsVpqK4TX_NOdvqA"},
{id: 339, course: "MBA", sem: "semester 3", sub: "coporate restructuring and control", anchor: "https://drive.google.com/uc?export=download&id=1T8y70zV_fPyEYoofByoPuNypmZ7koD15"},
{id: 340, course: "MBA", sem: "semester 3", sub: "Corporate Startegy", anchor: "https://drive.google.com/uc?export=download&id=1PtPPNvQN1_XxkIG9mZ41DYdP9xIG20yr"},
{id: 341, course: "MBA", sem: "semester 3", sub: "Export import procedured and documentation", anchor: "https://drive.google.com/uc?export=download&id=1adt0HwnJfHKpssKGDMP3PBwj8IMlkMsL"},
{id: 342, course: "MBA", sem: "semester 3", sub: "HRD System and Strategies", anchor: "https://drive.google.com/uc?export=download&id=1brx21k7roLfnoTHbrNj3Y2Q2hWQTM0A9"},
{id: 343, course: "MBA", sem: "semester 3", sub: "Indian Ethos and Business Ethics", anchor: "https://drive.google.com/uc?export=download&id=1kDtoQpOcKc09CZ4gdI4f4nZVoDuAmiQp"},
{id: 344, course: "MBA", sem: "semester 3", sub: "indian Foreign Trade and policy", anchor: "https://drive.google.com/uc?export=download&id=1JDo03OzrqlPvZTPPldpUC6UewXQzqiyS"},
{id: 345, course: "MBA", sem: "semester 3", sub: "Management of Industrial Relations", anchor: "https://drive.google.com/uc?export=download&id=1Engb2P3UR0d083zIX5B7UVDbSt5kAu5p"},
{id: 346, course: "MBA", sem: "semester 3", sub: "Sales and Logistics Management", anchor: "https://drive.google.com/uc?export=download&id=1LRI017yujSoRgkcfcy85_AsLR99fxm3V"},
{id: 347, course: "MBA", sem: "semester 3", sub: "Secuirty Analysis", anchor: "https://drive.google.com/uc?export=download&id=160Dc8lhw4xyGlbWpdKeqYa4P-fS_wQsp"},
{id: 348, course: "MBA", sem: "semester 3", sub: "Strategic Brand Management", anchor: "https://drive.google.com/uc?export=download&id=1fHdDNG-s_KOUKtbArtbvFG2WRW9j9nGx"},
{id: 349, course: "MBA", sem: "semester 4", sub: "Behavioural Finamce", anchor: "https://drive.google.com/uc?export=download&id=1CVwEkCiIMaGW18bmASLpqycXQU7Ds5Ox"},
{id: 350, course: "MBA", sem: "semester 4", sub: "Behavioural Finamce", anchor: "https://drive.google.com/uc?export=download&id=1gfTvuindj8ifK3pu-V_6pq55BmizRguE"},
{id: 351, course: "MBA", sem: "semester 4", sub: "Business Economics", anchor: "https://drive.google.com/uc?export=download&id=1_e-YXEGi0DAcyl017p1s41fHXjKqxU8Q"},
{id: 352, course: "MBA", sem: "semester 4", sub: "Business Economics", anchor: "https://drive.google.com/uc?export=download&id=1mCRMVzT5Qyi6lxJQXTwKjwd_i5HYs-PA"},
{id: 353, course: "MBA", sem: "semester 4", sub: "Business Etics and Coroporate governence", anchor: "https://drive.google.com/uc?export=download&id=1I0G-Hn_qhXXsv1iWoKjfOVGjT-ZIuGn_"},
{id: 354, course: "MBA", sem: "semester 4", sub: "business Financial modelling", anchor: "https://drive.google.com/uc?export=download&id=1J3MWpvacEWxah2cKWpBv3Fp_mTz0KU7t"},
{id: 355, course: "MBA", sem: "semester 4", sub: "Business Research", anchor: "https://drive.google.com/uc?export=download&id=1AzyniFb8AyFi71jHD6A3TFXaaYD0S9Zl"},
{id: 356, course: "MBA", sem: "semester 4", sub: "Business Research", anchor: "https://drive.google.com/uc?export=download&id=1d3Np8CohikrJV1oOlPCo6s0A5thrhz17"},
{id: 357, course: "MBA", sem: "semester 4", sub: "Comodities and financial", anchor: "https://drive.google.com/uc?export=download&id=1DQMvNWA2hyUgEWEDokTrlZjEuMfWKdEz"},
{id: 358, course: "MBA", sem: "semester 4", sub: "compensation management", anchor: "https://drive.google.com/uc?export=download&id=19ocOnK3Beo_EBuW4Nsva6Dae1GoiaLIh"},
{id: 359, course: "MBA", sem: "semester 4", sub: "compensation management", anchor: "https://drive.google.com/uc?export=download&id=1aeV3ovl8RadUnOXCGCop9mLE20CHzhYy"},
{id: 360, course: "MBA", sem: "semester 4", sub: "competency mapping and asssessment centers", anchor: "https://drive.google.com/uc?export=download&id=1bMl5QnJ4_r1y9fzronSUJc9nA98GkBN4"},
{id: 361, course: "MBA", sem: "semester 4", sub: "Corporate Social Resposibility and sustainability", anchor: "https://drive.google.com/uc?export=download&id=16u-fjHO3fQT9YqWvkEFmRv3rSoAZQS7F"},
{id: 362, course: "MBA", sem: "semester 4", sub: "Counseling,Mentoring and Negotiation skills", anchor: "https://drive.google.com/uc?export=download&id=12o3q20gckrKpBNusUrtNqIx4JKSHsBta"},
{id: 363, course: "MBA", sem: "semester 4", sub: "Counseling,Mentoring and Negotiation skills", anchor: "https://drive.google.com/uc?export=download&id=17tGzhVoluw3gu9RQos6T4iuQ7FF2DD2y"},
{id: 364, course: "MBA", sem: "semester 4", sub: "Counseling,Mentoring and Negotiation skills", anchor: "https://drive.google.com/uc?export=download&id=1S4EOofK-SODvfZgW9uA3Kz9cA4U9JLuc"},
{id: 365, course: "MBA", sem: "semester 4", sub: "Counseling,Mentoring and Negotiation skills", anchor: "https://drive.google.com/uc?export=download&id=1uXw-v_Ru0k3v-FwQQvffgQJa2zGwC0tS"},
{id: 366, course: "MBA", sem: "semester 4", sub: "Cross Cultural and Gloabal HRM", anchor: "https://drive.google.com/uc?export=download&id=1Cgmf9kUTop5wKc_OzVN6tIyhmlu_rx9G"},
{id: 367, course: "MBA", sem: "semester 4", sub: "Cross Cultural and Gloabal HRM", anchor: "https://drive.google.com/uc?export=download&id=1CpNAHIK-ROZF9itNC4LHmkQWDB84yD7h"},
{id: 368, course: "MBA", sem: "semester 4", sub: "Cross Cultural and Gloabal HRM", anchor: "https://drive.google.com/uc?export=download&id=1cuIH32PwyTEEYw4D7xKJEUuS2F9CFz8b"},
{id: 369, course: "MBA", sem: "semester 4", sub: "Data warehouse and datamining", anchor: "https://drive.google.com/uc?export=download&id=11_Oud5BF8Ey8DRPPzK5csAQuRXLoRIoS"},
{id: 370, course: "MBA", sem: "semester 4", sub: "Database management", anchor: "https://drive.google.com/uc?export=download&id=1VYj2iB4J7Sh9YENM8WPsNFb7sZzG5ljv"},
{id: 371, course: "MBA", sem: "semester 4", sub: "Database management", anchor: "https://drive.google.com/uc?export=download&id=1VuDYRviqfKLhL9EkjzCqz1PIEhQYP063"},
{id: 372, course: "MBA", sem: "semester 4", sub: "Database management", anchor: "https://drive.google.com/uc?export=download&id=1X-IHFvPiqbBRO5YOFDZ4RhzBAbWsekBi"},
{id: 373, course: "MBA", sem: "semester 4", sub: "dynamics AND LEdership", anchor: "https://drive.google.com/uc?export=download&id=1RbWmgTjtIIyIa_3rH17U0Sc8FftT4p6c"},
{id: 374, course: "MBA", sem: "semester 4", sub: "dynamics AND LEdership", anchor: "https://drive.google.com/uc?export=download&id=1kCw-KHpy7n5Y21dPZcrtNdKDDzGlS0i7"},
{id: 375, course: "MBA", sem: "semester 4", sub: "E-commerce", anchor: "https://drive.google.com/uc?export=download&id=1EfxAxedl4-l5spvHmk3Kd2-2y50Pg6xR"},
{id: 376, course: "MBA", sem: "semester 4", sub: "E-commerce", anchor: "https://drive.google.com/uc?export=download&id=1yGoMH-9hvFYByk6vgRREx2xWk0GGbc2H"},
{id: 377, course: "MBA", sem: "semester 4", sub: "Enterprise resource planning", anchor: "https://drive.google.com/uc?export=download&id=1wc5822X4VqpW8XjfGMYUXdLFd7WlNTtz"},
{id: 378, course: "MBA", sem: "semester 4", sub: "Entrepeneurship", anchor: "https://drive.google.com/uc?export=download&id=19bZqLy5ki0dxFfc8fYBrVXIQtFUS8VTR"},
{id: 379, course: "MBA", sem: "semester 4", sub: "Financial derivatives", anchor: "https://drive.google.com/uc?export=download&id=1oGbZOaAHukwuPx334CGy336F2Acdg6og"},
{id: 380, course: "MBA", sem: "semester 4", sub: "Goal programming in management", anchor: "https://drive.google.com/uc?export=download&id=1UtA6fJVQwxg4yhmcF3hxr9sctCE4y2N5"},
{id: 381, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1J9fZgx8l4fZVG-r1uNFY0Yx_lp8X3OJ4"},
{id: 382, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1KW2nhQmL09q510Vu2faDd1Y_cun_gyhN"},
{id: 383, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1dicTNxKrA5aHkst6zjuQnjQS2AEy9GSK"},
{id: 384, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1vPer9OsGkqJCzuGeX9VjfJEmhfYMBLWJ"},
{id: 385, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1xNpVgHnoSLsGrxndsNnCtUkO6Np8lBqS"},
{id: 386, course: "MBA", sem: "semester 4", sub: "Human Resource Management", anchor: "https://drive.google.com/uc?export=download&id=1zXslisRFciEa8aZ6WMI7yBnUeZ0qviJb"},
{id: 387, course: "MBA", sem: "semester 4", sub: "Industrial Marketing", anchor: "https://drive.google.com/uc?export=download&id=1igpU0zM-pwPHuPusIiZHTRMfqzWFPszp"},
{id: 388, course: "MBA", sem: "semester 4", sub: "information secuirity and cyber laws", anchor: "https://drive.google.com/uc?export=download&id=1HqLPNHqN4BhgYPp7sYpkV0UznD4hHDTs"},
{id: 389, course: "MBA", sem: "semester 4", sub: "Insurance and Risk Management", anchor: "https://drive.google.com/uc?export=download&id=1NjPLxL1Q7vxvLo67KRLGTP_ZGIv0dFy4"},
{id: 390, course: "MBA", sem: "semester 4", sub: "Insurance and Risk Management", anchor: "https://drive.google.com/uc?export=download&id=1y8RkvW3LKRtvn9qkAHO0WxzsLie7nQ9o"},
{id: 391, course: "MBA", sem: "semester 4", sub: "international Mangement", anchor: "https://drive.google.com/uc?export=download&id=1wo7vgbO3QiUPE-sHpULcDvTMTuUJoFMk"},
{id: 392, course: "MBA", sem: "semester 4", sub: "international Mangement", anchor: "https://drive.google.com/uc?export=download&id=1z6lXNWfQIU0xpXnx62rrcLdSC97c7an8"},
{id: 393, course: "MBA", sem: "semester 4", sub: "International Marketing", anchor: "https://drive.google.com/uc?export=download&id=1OjfcqerH0LYh_jvilOZni36TEY7I_up5"},
{id: 394, course: "MBA", sem: "semester 4", sub: "International Marketing", anchor: "https://drive.google.com/uc?export=download&id=1Tid3mqyGzJaz1d9vz4fgXADUJIPmov91"},
{id: 395, course: "MBA", sem: "semester 4", sub: "International Marketing", anchor: "https://drive.google.com/uc?export=download&id=1V0yTmakZ_qhkP7XajsYdu1GD5a90M06P"},
{id: 396, course: "MBA", sem: "semester 4", sub: "International Strategic Management", anchor: "https://drive.google.com/uc?export=download&id=1LU3hZoOFOGPl_CZs4wit4G3ARMapyFtL"},
{id: 397, course: "MBA", sem: "semester 4", sub: "internet and web Designing", anchor: "https://drive.google.com/uc?export=download&id=1YpNZKCX_Qqhit8c67I0k9ZGEBGRylh14"},
{id: 398, course: "MBA", sem: "semester 4", sub: "introduction to Computer Mangement", anchor: "https://drive.google.com/uc?export=download&id=19ucxwcYp0ZJwqFlQEqPXpyI7XAqyzFGV"},
{id: 399, course: "MBA", sem: "semester 4", sub: "Iot and Big Data", anchor: "https://drive.google.com/uc?export=download&id=1qBDHCC-zSkTHimYRlCzDIxNO35NNZeL1"},
{id: 400, course: "MBA", sem: "semester 4", sub: "Management information system", anchor: "https://drive.google.com/uc?export=download&id=1uHHbiPITnnZv8LoShL7YSESqLNVgWIG6"},
{id: 401, course: "MBA", sem: "semester 4", sub: "Management of financial services", anchor: "https://drive.google.com/uc?export=download&id=1BtnkowNav1_DiRc76N-UEbaCnW1PjcL4"},
{id: 402, course: "MBA", sem: "semester 4", sub: "Management of financial services", anchor: "https://drive.google.com/uc?export=download&id=1ZiqffkKZCQsoB0MJi9PMxBocnr7hf0h6"},
{id: 403, course: "MBA", sem: "semester 4", sub: "management science", anchor: "https://drive.google.com/uc?export=download&id=1ivnve6H3THeiI6563riezf5GNUs0yl33"},
{id: 404, course: "MBA", sem: "semester 4", sub: "Managemnet and organisational Development", anchor: "https://drive.google.com/uc?export=download&id=17bTmplSu8QxxpNAUHFeBs7UFSh9ibSnD"},
{id: 405, course: "MBA", sem: "semester 4", sub: "Managemnet and organisational Development", anchor: "https://drive.google.com/uc?export=download&id=1IlbvUVEjqlU-13eUu6tuQMA_G23rmMcX"},
{id: 406, course: "MBA", sem: "semester 4", sub: "Managemnet and organisational Development", anchor: "https://drive.google.com/uc?export=download&id=1xZWH6tSzm6KhTq_uK-vcfpX_zmud1Od7"},
{id: 407, course: "MBA", sem: "semester 4", sub: "marketing Communication", anchor: "https://drive.google.com/uc?export=download&id=1x8pVzNnkfPv5UTD3dAU6IfiA2vuTmVX9"},
{id: 408, course: "MBA", sem: "semester 4", sub: "msme policy framework", anchor: "https://drive.google.com/uc?export=download&id=1ciGR6XpPieqkGgK0QIvPblCojSKuG9UT"},
{id: 409, course: "MBA", sem: "semester 4", sub: "performance management and managerial effectiveness", anchor: "https://drive.google.com/uc?export=download&id=1N2v1Y0aMs_MbdB1awD65eWoo3GUYPuhx"},
{id: 410, course: "MBA", sem: "semester 4", sub: "Portfolio Management", anchor: "https://drive.google.com/uc?export=download&id=123fIn9VY9BOvZgzyR9fWhSv1ulXX9mio"},
{id: 411, course: "MBA", sem: "semester 4", sub: "Portfolio Management", anchor: "https://drive.google.com/uc?export=download&id=19Dr93gnwXX7blAyv7igY_d3znL7S9seU"},
{id: 412, course: "MBA", sem: "semester 4", sub: "Portfolio Management", anchor: "https://drive.google.com/uc?export=download&id=1GE1qdBI6kNyI2YeS9j4qkIOJBK7hE5IQ"},
{id: 413, course: "MBA", sem: "semester 4", sub: "Portfolio Management", anchor: "https://drive.google.com/uc?export=download&id=1v17Z38wgWRKxhpCLqxTeTScyBZsdUW2K"},
{id: 414, course: "MBA", sem: "semester 4", sub: "Portfolio Management", anchor: "https://drive.google.com/uc?export=download&id=1y1c838vWTEKxHu_MMbTbN304OJqVNEgn"},
{id: 415, course: "MBA", sem: "semester 4", sub: "Programme management", anchor: "https://drive.google.com/uc?export=download&id=19YDXdLhOl-RlfTRbPi_UdomX0Ow5-ADw"},
{id: 416, course: "MBA", sem: "semester 4", sub: "Project Planning and Management", anchor: "https://drive.google.com/uc?export=download&id=1u1Pr1cUZ1WG434fy9sd6YEx-nUA_a7bD"},
{id: 417, course: "MBA", sem: "semester 4", sub: "R and D management", anchor: "https://drive.google.com/uc?export=download&id=18SrDwnrAmMsO1qIqxR98Erwn245irFh3"},
{id: 418, course: "MBA", sem: "semester 4", sub: "R and D management", anchor: "https://drive.google.com/uc?export=download&id=1aNAg27aZFVNbCcpYFZufPyYZCmTaQ0Zh"},
{id: 419, course: "MBA", sem: "semester 4", sub: "regional economic blocks", anchor: "https://drive.google.com/uc?export=download&id=1V95CA5_U8aVwoNY-sN8vl2OTix9FXXXS"},
{id: 420, course: "MBA", sem: "semester 4", sub: "regional economic blocks", anchor: "https://drive.google.com/uc?export=download&id=1aB3Iuex07zDa0KiUYb4DwgJ0ah8AHLNv"},
{id: 421, course: "MBA", sem: "semester 4", sub: "Retail and Mall Management", anchor: "https://drive.google.com/uc?export=download&id=1XfmHDUTgrZuNi6IIKn8okRKjpS2K9cB1"},
{id: 422, course: "MBA", sem: "semester 4", sub: "Rural and agricultural marketing", anchor: "https://drive.google.com/uc?export=download&id=13CeG290x09MDMHFHYsc9qLz0f_3FFL_w"},
{id: 423, course: "MBA", sem: "semester 4", sub: "Software Engineering", anchor: "https://drive.google.com/uc?export=download&id=1eAzIA2TcLAQSSrFdpWayeEK32g-cWQV6"},
{id: 424, course: "MBA", sem: "semester 4", sub: "Talent Acquisition and performance management", anchor: "https://drive.google.com/uc?export=download&id=1mKgrZpStfP7nGjEfNi76Y1rxSkh3jhhs"},
{id: 425, course: "MBA", sem: "semester 4", sub: "technology forcasting", anchor: "https://drive.google.com/uc?export=download&id=19twesfSq2uZoN3LF6oQ4DzCj1SfNiYw1"},
{id: 426, course: "MBA", sem: "semester 4", sub: "technology forcasting", anchor: "https://drive.google.com/uc?export=download&id=1F54Ro_Ahnwh16w5uyeurFbnKGH-XWwSv"},
{id: 427, course: "MBA", sem: "semester 4", sub: "Transporation Management", anchor: "https://drive.google.com/uc?export=download&id=1J8nkQMJZjC05WPqvGdw1phrkWxQOEQfd"},
{id: 428, course: "MBA", sem: "semester 4", sub: "Transporation Management", anchor: "https://drive.google.com/uc?export=download&id=1gajoXoW6sRz0BLPvaR4x1tHBjcfcwAq7"}

];
const qbSchema=new mongoose.Schema({
  id:Number,
  course:String,
  sem:String,
  sub:String,
  anchor:String
})
const QB=mongoose.model("questionbank",qbSchema);
app.get("/qb",function(req,res){
  QB.find(function(err,out20){
    if(!err){
      if(out20.length===0){
        QB.insertMany(arrayqb,function(err){
          if(!err){
            console.log("Question bank data inserted successfully!")
            res.redirect("/qb")
          }
        })
      }
      else{
      res.render("questionbank",{
        List:out20
      })
      }
    }

  })

})

app.get("/review",function(req,res){
  User.find({"review":{$ne:null}},function(err,outcome){
    if(err){
      res.redirect("/submission")
    }
    else{
      res.render("review",{
        List:outcome
      })
    }
  })

})
app.get("/submission",function(req,res){
  res.render("submission")
})
app.post("/submission",function(req,res){
  const u_i=req.body.name;
  const m_i=req.body.txt;
  User.findById(req.user.id,function(err,outputt){
    if(!err){
      outputt.name=u_i
      outputt.review=m_i
      outputt.save()
      res.redirect("/review")
    }
  })

})
app.listen(port,function(){
  console.log(`Server is running at ${port} port`)
})
