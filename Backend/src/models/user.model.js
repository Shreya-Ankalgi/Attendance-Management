import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ['student', 'mentor'],
      required: true
    },
    QrCode: {
      type: String,
    },
    Attended:{type:Number},   //students 
   
    NoOfClassesTaken: {  
      type:Number,
      default:0 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;