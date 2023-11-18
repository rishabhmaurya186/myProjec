const mongoose = require("mongoose")
const Schema = mongoose.Schema
const review = require("./review.js")
const { string } = require("joi")

const listingSchema = new Schema({
   title:{
    type:String,
    required:true
   },
   description:String,
   image:{
      url:{
         type:String,
         default:"https://media.istockphoto.com/id/687073462/vector/3d-rendering-of-modern-cozy-house-in-chalet-style.jpg?s=1024x1024&w=is&k=20&c=zSFm8aYMnqHV9jGU1juzt2L6fTeGlbTbydc4ShDK7nk="
         ,
         set:(v)=> v===""?"https://media.istockphoto.com/id/687073462/vector/3d-rendering-of-modern-cozy-house-in-chalet-style.jpg?s=1024x1024&w=is&k=20&c=zSFm8aYMnqHV9jGU1juzt2L6fTeGlbTbydc4ShDK7nk=":v,

      },
      filename : String,
   
    
   },
   price:Number,
   location:String,
   country:String,
   reviews: [
      {
        type: Schema.Types.ObjectId,
        ref:"Review"
      }
   ],
   owner:{
      type: Schema.Types.ObjectId,
        ref:"user"
   },
   geometry:{
      type: {
         type: String,
         enum: ['Point'],
         required:true
      },
      coordinates:{
         type:[Number],
         required:true,
      }
   }

})

listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing){
      await review.deleteMany({_id:{$in: listing.reviews}})
   }
})

const Listing = mongoose.model("Listing",listingSchema)
module.exports = Listing;