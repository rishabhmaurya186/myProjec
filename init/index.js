const mongoose = require("mongoose")
const initData = require("./data.js")
const Listing = require("../models/listing")
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"

main().then(()=>{
    console.log("connection is success")
}).catch((err)=>{
    console.log(err)
})

async function main(){
    await mongoose.connect(MONGO_URL)
}

const initDB = async ()=>{
    await Listing.deleteMany({})
    initData.data = initData.data.map((obj)=>({...obj,owner:"6545081e19687de142b14f42"}))
    await Listing.insertMany(initData.data)
    console.log("data inserted")
}

initDB()