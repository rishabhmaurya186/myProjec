const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js")
const {listingSchema ,reviewSchema}= require("../schema.js");
const ExpressError = require("../utils/ExpressError.js")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const {isLoggedIn ,isOwner} = require("../middleware.js")


const multer  = require('multer')
const upload = multer({ storage})


const validateListing = (req,res,next)=>{
    let {error} =listingSchema.validate(req.body); 
       
       if(error){
        throw new ExpressError(400,error)
       }else{
        next();
       }
   
}



// Index Route

router.get("/",async (req,res)=>{
    try{
    const allListing = await Listing.find({})
    res.render("listings/index.ejs",{allListing})
}catch(err){
    next(err);
  }
})

// New Route

router.get("/new" ,isLoggedIn,(req,res)=>{
  
    res.render("listings/new.ejs")
})

// Show Route

router.get("/:id",async (req,res)=>{
    try{
    let {id} = req.params
    let listing = await Listing.findById(id).populate("owner").populate({path:"reviews", populate:[{path:"author"}]
  });
    if(!listing){
      req.flash("error", "the listing you want to access does not exist !");
     return res.redirect("/listings")
    }
    res.render("listings/show.ejs",{listing})
}catch(err){
    next(err);
  }
})

// Create Route



router.post("/" ,upload.single("listing[image]"),async (req,res,next)=>{
  
    // try{
      // let response =await geocodingClient.forwardGeocode({
      //   query: req.body.listing.location,
      //   limit: 1
      // }).send();
      
     
        
         
          let url = req.file.path;
          let filename = req.file.filename;
          
          let a = req.body.listing
          
          const newListing = new Listing(a)
          newListing.owner = req.user._id;
          newListing.image = {url, filename};
          newListing.geometry = response.body.features[0].geometry
          let savedListing=await newListing.save()
          
          req.flash("success", "New Listing Created!");
          return res.redirect("/listings")
  
    // }catch(err){
    //   next(err);
    // }
      
  })

  // Edit Route

  router.get("/:id/edit",isLoggedIn,isOwner,async (req,res)=>{
    try{
    let {id}= req.params;
  
    let listing = await Listing.findById(id)
    if(!listing){
      req.flash("error","Listing you requested for does not exist!")
      return res.redirect("/listings")
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload","upload/w_300")
    res.render("listings/edit.ejs",{listing,originalImageUrl})
}catch(err){
    next(err);
  }
})

// Update Route
router.put("/:id",isLoggedIn,upload.single("listing[image]"),validateListing,isOwner, async (req,res)=>{
    try{
      
       let {id}= req.params;
      
      
    let listing= await Listing.findByIdAndUpdate(id,{...req.body.listing})

    if(typeof req.file !== undefined){
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image ={ url,filename};
      await listing.save();
    }
    req.flash("success", "Listing Updated!");
    return res.redirect(`/listings/${id}`)
   }catch(err){
       next(err);
     }
})

// delete route
router.delete("/:id",isLoggedIn,isOwner, async (req,res)=>{
    try{
     let {id}= req.params;
     await Listing.findByIdAndDelete(id)
     req.flash("success", "Listing Deleted!");
     return res.redirect(`/listings`)
 }catch(err){
     next(err);
   }
 })




 module.exports = router;
