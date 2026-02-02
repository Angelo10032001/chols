import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: String,
  date: Date,       
  time: String,      
  title: String,          
  details: String,     
  amount: Number

});

export default mongoose.model("History", historySchema);
