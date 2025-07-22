import dotenv from "dotenv"
import e from "express";
import {app} from './app.js'
import connectDB from "./db/index.js";
import path from 'path';

import { fileURLToPath } from 'url';


// Simulate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file from root
dotenv.config({
  path: path.resolve(__dirname, '../.env')
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