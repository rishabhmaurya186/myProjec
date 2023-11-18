const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

router.get("/signup",(req,res)=>{
    res.render("user/signup.ejs")
})

router.post("/singup", async(req,res)=>{
    try{
    let {username,email,password}= req.body;
    const newUser = new User({email,username});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
        if(err){
            return next(err)
        }
        req.flash("success", "welcome to wanderlust")
        res.redirect("/listings")
    })
    
    }
    catch(e){
        req.flash("error",e.message)
        res.redirect('signup')
    }

})

router.get("/login",(req,res)=>{
    res.render("user/login.ejs")
})

router.post("/login", saveRedirectUrl,
passport.authenticate('local',{failureRedirect:'/login',failureFlash:true}),
 async(req,res)=>{
    req.flash("success",'welcome to wondelust you are loged in')

    res.redirect(!res.locals.redirectUrl?"/listings":res.locals.redirectUrl)
})

router.get("/logout",(req,res)=>{
    req.logout(err=>{
        if(err){
          return next(err)
        }
        req.flash("success","you are logged out")
        res.redirect("/listings");
    })
})

// router.all("*",(req,res,next)=>{
//     console.log("error")
    
//     next(new ExpressError(404,"Page not Found!"))
// })

// router.use("/",(err,req,res,next)=>{
//     let {statusCode=505 , message="something went wrong!"} = err
  
     
//      res.status(statusCode).render("error.ejs",{message})
    
// })


module.exports = router