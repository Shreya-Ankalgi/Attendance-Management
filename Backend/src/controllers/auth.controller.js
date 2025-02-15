import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import Assign from "../models/assign.model.js"
import bcrypt from "bcryptjs";
import Class from "../models/class.model.js"


export const signup = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
        role: newUser.role,
      });
    }
  } catch (error) {
    console.log("Error in Signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      role: user.role, // Added role to the response
    });
  } catch (error) {
    console.log("Error in login credentials", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", "{maxAge:0}");
    res.status(200).json({ message: "Logged out Successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const assignWork = async (req, res) => {
  try {
    const { employeeName, title, description, deadline } = req.body;

    // Find the employee by name
    const employee = await User.findOne({ fullName: employeeName });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Create new assignment
    const newAssignment = new Assign({
      title,
      description,
      deadline: new Date(deadline),
      assignedTo: employee._id,
      status: 'pending'
    });

    await newAssignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: {
        _id: newAssignment._id,
        title: newAssignment.title,
        description: newAssignment.description,
        deadline: newAssignment.deadline,
        status: newAssignment.status,
        employeeName: employee.fullName
      }
    });
  } catch (error) {
    console.error('Error assigning work:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const fetchEmployeeAssignments = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    const assignments = await Assign.find({ assignedTo: employeeId })
      .sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const updateAssignmentStatus = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "in-progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const assignment = await Assign.findOneAndUpdate(
      { 
        _id: assignmentId, 
        assignedTo: req.user._id // Use assignedTo from your schema
      }, 
      { status },
      { new: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error updating assignment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Corresponding controller method (in auth controller)
export const fetchEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'student' }).select('-password');
    console.log(employees);
    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
export const markAttendance = async (req, res) => {
  try {
    console.log("Received students:", req.body);
    const students_present = req.body.presentStudents;
    let subject=req.body.subjectSelected;


    let adminId=req.user._id;
    let admin=await User.findById(adminId);
    console.log('Admin');
    
    admin.NoOfClassesTaken=(typeof admin.NoOfClassesTaken === 'number' ? admin.NoOfClassesTaken : 0) + 1;
    await admin.save();

    const totalPresent = students_present.length;

    // Process students in parallel using Promise.all
    await Promise.all(students_present.map(async (userId) => {
      const student = await User.findById(userId);
      
      if (!student) {
        throw new Error(`Student with ID ${userId} not found`);
      }

      // Ensure Attended is initialized as a number
      student.Attended = (typeof student.Attended === 'number' ? student.Attended : 0) + 1;
      await student.save();
    }));

    // Create new class record
    const newClass = await Class.create({
      subjectName: 'FAFL',
      totalPresent,
      date: Date.now(),
      students_present
    });

    res.status(200).json({ 
      message: "Attendance marked successfully",
      classDetails: {
        id: newClass._id,
        totalPresent,
        date: newClass.date
      }
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    // Send appropriate error response based on error type
    if (error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        details: error.message 
      });
    }

    res.status(500).json({ 
      message: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllClassesData=async (req,res) => { 
  try {
    const allClases = await Class.find({});    
    console.log(allClases);
    
    res.status(200).json(allClases);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

};

