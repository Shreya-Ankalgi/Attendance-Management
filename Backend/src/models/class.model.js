import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
 
  subjectName: {
    type: String,
    required: true
  },
  totalPresent: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: null
  },
  students_present:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }

}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);

export default Message;