import React, { useEffect, useState } from "react";
import QrScanner from "react-qr-scanner";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Check, X } from "lucide-react";

const TOAST_DURATION = 1000;
const SCAN_COOLDOWN = 500; // Cooldown period between scans

const ClientAttendance = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [students, setStudents] = useState([]);
    const [presentStudents, setPresentStudents] = useState([]);
    const [lastScanned, setLastScanned] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [canScan, setCanScan] = useState(true);
    const [subjectSelected, setSubjectSelected] = useState('');



    const { employees, fetchEmployees, markAttendance } = useAuthStore();

    const getUsers = async () => {
        await fetchEmployees();
        setStudents(employees);
    };

    useEffect(() => {
        getUsers();
    }, [fetchEmployees]);

    const showToastAndDisableScan = (message, isSuccess = true) => {
        setCanScan(false);

        toast[isSuccess ? "success" : "error"](message, {
            duration: TOAST_DURATION,
            position: "top-center",
            style: {
                background: isSuccess ? "#10B981" : "#EF4444",
                color: "#fff",
                fontSize: "16px",
                padding: "16px",
                borderRadius: "8px",
            },
        });

        // Re-enable scanning after the cooldown period
        setTimeout(() => {
            setCanScan(true);
        }, SCAN_COOLDOWN);
    };

    const handleScan = (data) => {
        if (!data?.text || !canScan) return;
        const studentId = data.text;
        console.log(studentId);
        
        const student = students.find((s) => s._id === studentId);

        if (!student) return; // Exit if no student found

        if (presentStudents.includes(studentId)) {
            showToastAndDisableScan("Student already marked present", false);
            return;
        }

        // Mark student as present
        setPresentStudents((prev) => [...prev, studentId]);
        setLastScanned(student);
        setShowFeedback(true);

        showToastAndDisableScan(`${student.fullName} marked present`, true);
    };

    // Rest of the component remains the same...

    const handleEndClass = () => {
        const presentCount = presentStudents.length;
        const totalCount = students.length;
        markAttendance(presentStudents,subjectSelected);
        showToastAndDisableScan(`Class ended. ${presentCount}/${totalCount} students present`);
        setPresentStudents([]);
        setIsModalOpen(false);
    };

    const handleError = (err) => {
        console.error("QR Scanner Error:", err);
        showToastAndDisableScan("Scanner error. Please try again.", false);
    };

    return (
        <div className="min-h-screen bg-base-100 text-white p-8 relative">
            <div className="flex justify-between items-center mb-3 mt-16">
                <h1 className="text-xl font-bold">Attendance Portal</h1>
                <div className="space-x-2">
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary btn-sm">
                        Take Attendance
                    </button>
                    <button onClick={handleEndClass} className="btn btn-error btn-sm">
                        End Class
                    </button>
                </div>
            </div>
            <div className="flex">
               
                <select name="Subject" id="" className="px-2 py-2 mb-3" 
                 value={subjectSelected}
                 onChange={(e)=>setSubjectSelected(e.target.value)}
                >
                    <option value="" disabled>Choose subject</option>
                    <option value="FAFL">FAFL</option>
                    <option value="MCES">MCES</option>
                </select>   
            </div>

            <div className="border border-primary/50 p-4 rounded-lg backdrop-blur-md bg-base-200/50 shadow-lg">
                <div className="mb-4 flex justify-between text-sm">
                    <span>Total Students: {students.length}</span>
                    <span>Present: {presentStudents.length}</span>
                </div>

                {students?.map((student) => (
                    <div
                        key={student._id}
                        className={`flex justify-between items-center p-3 border rounded-lg mb-2 transition-all duration-300 ${presentStudents.includes(student._id)
                            ? "border-green-500 bg-green-500/10"
                            : "border-red-500"
                            }`}
                    >
                        <span className="text-md font-medium">{student.fullName}</span>
                        <div className="flex items-center gap-2">
                            <span
                                className={`text-sm font-bold ${presentStudents.includes(student._id) ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {presentStudents.includes(student._id) ? "Present" : "Absent"}
                            </span>
                            {presentStudents.includes(student._id) ? (
                                <Check className="h-4 w-4 text-green-500" />
                            ) : (
                                <X className="h-4 w-4 text-red-500" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 backdrop-blur-md">
                    <div className="bg-base-200 p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Scan QR Code</h2>
                        <QrScanner
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: "100%" }}
                            constraints={{
                                video: { facingMode: "environment" }, // Correctly specify the video constraint
                            }}
                        />
                        <button onClick={() => setIsModalOpen(false)} className="mt-4 btn btn-error w-full">
                            Close Scanner
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientAttendance;
