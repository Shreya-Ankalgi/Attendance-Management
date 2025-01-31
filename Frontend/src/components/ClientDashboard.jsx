import React, { useState, useEffect } from "react";
import { Facebook, Plus } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [isineligibleOpen, setIsineligibleOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState();

  const countFlatClasses = (studentId) => {
    let allClassesData = getAllClassesData()
    console.log(allClassesData.data);
  }
  const {
    employees = [],
    fetchEmployees,
    assignments = [],
    fetchEmployeeAssignments,
    authUser,
    checkAuth,
    getAllClassesData
  } = useAuthStore();

  useEffect(() => {
    const initializeDashboard = async () => {
      checkAuth();
      setUser(authUser);

      try {
        const fetchedEmployees = await fetchEmployees();

      } catch (error) {
        console.error("Error initializing dashboard:", error);
      }
    };

    initializeDashboard();
  }, [fetchEmployees, fetchEmployeeAssignments,navigate]);

  // Helper function to safely handle attendance calculations
  const calculateAttendance = (attended, total) => {
    // Check if attended is NaN, null, undefined, or not a number
    const validAttended = typeof attended === 'number' && !isNaN(attended) ? attended : 0;
    const validTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

    if (validTotal === 0) return {
      presentCount: 0,
      attendanceRate: "0%"
    };

    return {
      presentCount: validAttended,
      attendanceRate: `${Math.round((validAttended / validTotal) * 100)}%`
    };
  };

  return (
    <div className="p-6 bg-base-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button
          onClick={() => navigate('/client-attendance')}
          className="btn btn-primary"
        >
          <Plus /> Start New Class
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Attendance Status Overview</h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Total Classes</th>
                <th>Attended</th>
                <th>Absent</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ?
                (
                  employees.map((emp) => {
                    const total = user?.NoOfClassesTaken || 0;
                    const { presentCount, attendanceRate } = calculateAttendance(emp.Attended, total);
                    const flatClasesPresent = countFlatClasses(emp._id);
                    console.log(flatClasesPresent);

                    let absent = total - emp.Attended
                    return (
                      <tr key={emp._id}>
                        <td>{emp.fullName}</td>
                        <td>{total}</td>
                        <td>
                          <span className="badge badge-success">
                            {presentCount}
                          </span>
                        </td>
                        <td>
                          <span className="badge ">
                            {absent}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {attendanceRate}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) :
                <p className=" mx-auto  text-center  py-4"> No students registered</p>
              }
            </tbody>
          </table>
        </div>
      </div>

      {employees.length > 0 &&
        <button>
          <button
            onClick={() => setIsineligibleOpen(!isineligibleOpen)}
            className="btn btn-secondary"
          >
            {isineligibleOpen ? "Hide Ineligible Students" : "Show Ineligible Students"}
          </button>
        </button>

      }

      {isineligibleOpen &&
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Ineligible Students list attendance is less than 70%</h3>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Total Classes</th>
                  <th>Attended</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter((emp) => {
                    const total = user?.NoOfClassesTaken || 0;
                    const { attendanceRate } = calculateAttendance(emp.Attended, total);
                    return parseFloat(attendanceRate) < 70;
                  })
                  .map((emp) => {
                    const total = user?.NoOfClassesTaken || 0;
                    const { presentCount, attendanceRate } = calculateAttendance(emp.Attended, total);
                    return (
                      <tr key={emp._id}>
                        <td>{emp.fullName}</td>
                        <td>{total}</td>
                        <td>
                          <span className="badge badge-success">
                            {presentCount}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            {attendanceRate}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      }


    </div>
  );
};

export default ClientDashboard;