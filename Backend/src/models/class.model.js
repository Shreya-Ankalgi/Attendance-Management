import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
 
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
  students_present:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }]

}, { timestamps: true });

const Class = mongoose.model('Class', classSchema);

export default Class;