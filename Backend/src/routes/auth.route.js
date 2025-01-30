import express from 'express' ;
import { assignWork, checkAuth, fetchEmployeeAssignments, fetchEmployees, login, logout, markAttendance, signup, updateAssignmentStatus,  } from '../controllers/auth.controller.js';
import { protectRoute } from '../middlewares/auth.middleware.js';

const router = express.Router() ;

router.post("/signup" , signup);
router.post("/login" , login);
router.post("/logout" , logout);
router.post('/assign-work', assignWork);
router.get('/assignments/:employeeId', fetchEmployeeAssignments);
router.get('/employees', fetchEmployees);
router.patch('/assignments/:assignmentId/status', protectRoute, updateAssignmentStatus);


router.get("/check",protectRoute, checkAuth)
router.post("/markattendance",protectRoute, markAttendance)

export default router ;