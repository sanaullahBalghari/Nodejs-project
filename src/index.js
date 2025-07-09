import dotenv from "dotenv"
import e from "express";

import connectDB from "./db/index.js";

dotenv.config({
    path: '.env'  
});

connectDB()
.then( ()=>{

  app.listen(process.env.PORT || 80000,  ()=>{
    console.log(`server is running at :${process.env.PORT}`)

  })

   app.on("error", error => {
      console.log("Error", error);
      throw error;
    });

})
.catch( (err)=>{
  console.log("Db connection failed",err)
})
/*
option 2 to connect database 
import express from "express";
const app = express()(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", error => {
      console.log("Error", error);
      throw error;
    });

app.listen( process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`)
})

  } catch (error) {
    console.error("ERROR", error);
    throw error;
  }
})();

*/