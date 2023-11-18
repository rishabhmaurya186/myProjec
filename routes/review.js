const express = require("express");
const Listing = require("../models/listing.js")
const router = express.Router({mergeParams:true});
const Review = require("../models/review.js")
const {listingSchema ,reviewSchema}= require("../schema.js");
const ExpressError = require("../utils/ExpressError.js")
const { isLoggedIn,isReviewAuthor }  = require("../middleware.js")






const validateReview = (req,res,next)=>{
    let {error} =reviewSchema.validate(req.body); 
       
       if(error){
        throw new ExpressError(400,error)
       }else{
        next();
       }
      
}


//Reviews 

router.post("/", validateReview,isLoggedIn, async(req,res)=>{
    try {
       let listing = await Listing.findById(req.params.id)
       let newReview = new Review(req.body.review)
       newReview.author = req.user._id;

       listing.reviews.push(newReview)
       
       await newReview.save();
       await listing.save();
       console.log("new review saved")
       let {id}= req.params
       req.flash("success", "New Review Created!");
       res.redirect(`/listings/${id}`) 

        
    } catch (err) {
        next(err)
    }
})

// Delete route

router.delete("/:reviewId",isLoggedIn,isReviewAuthor, async(req,res)=>{
    
    try{

        let{id, reviewId} = req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);

        
        res.redirect(`/listings/${id}`) 

    }catch(err){
        next(err)
    }
})


module.exports = router;
