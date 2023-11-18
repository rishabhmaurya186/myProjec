if(process.env.NODE_ENV != "production"){
    require('dotenv').config()
}

const {storage} = require("./cloud.js")

const express = require("express")
const mongoose = require("mongoose")
const Listing = require("./models/listing.js")
const path = require("path")
const app = express()
const ejsMate = require('ejs-mate')
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")))
var methodOverride = require('method-override')
const ExpressError = require("./utils/ExpressError.js")
// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))
app.set("view engine","ejs")
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
const MONGO_URL =process.env.ATLASDB_URL
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const flash = require('connect-flash');
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js")
const uri = "mongodb+srv://rmauryaji47:3DaPtlX1d0svZ45d@cluster0.fbzdcmx.mongodb.net/?retryWrites=true&w=majority";


async function main(){
    await mongoose.connect(uri)
}


main().then(()=>{
    console.log("connected")
}).catch((err)=>{
    console.log(err)
})



const session = require('express-session')
const MongoStore = require('connect-mongo');
const store = MongoStore.create({
    mongoUrl: uri,
    crypto:{
        secret:"mysupersecretcode",

    },
    touchAfter: 24*3600,
});

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE",err);
})

const sessionOptions = {
    store,
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }

};


app.use(session(sessionOptions))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async (req,res)=>{
//     let fackUser = new User({
//         email : "abc@gamil.com",
//         username:"rishabh"
//     })

//     let registeredUser = await User.register(fackUser,"helloword");
//     res.send(registeredUser)
// })



app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter);



app.get("/",(req,res)=>{
  res.redirect("/listings")
})

app.all("*",(req,res,next)=>{
    console.log("error")
    
    next(new ExpressError(404,"Page not Found!"))
})

app.use("/",(err,req,res,next)=>{
    let {statusCode=505 , message="something went wrong!"} = err
  
     
     res.status(statusCode).render("error.ejs",{message})
    
})



const port = 8080
app.listen(port,()=>{
    console.log(`listing at port ${port}`)
})
