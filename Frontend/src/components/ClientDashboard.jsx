import React, { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

const ClientDashboard = () => {
  const [isineligibleOpen, setIsineligibleOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState();

  const {
    employees = [],
    fetchEmployees,
    authUser,
    checkAuth,
  } = useAuthStore();

  useEffect(() => {
    const initializeDashboard = async () => {
      checkAuth();
      setUser(authUser);
      try {
        await fetchEmployees();
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      }
    };

    initializeDashboard();
  }, [fetchEmployees]);

  const calculateAttendance = (attended, total) => {
    const validAttended = typeof attended === 'number' && !isNaN(attended) ? attended : 0;
    const validTotal = typeof total === 'number' && !isNaN(total) ? total : 0;

    if (validTotal === 0) return {
      presentCount: 0,
      attendanceRate: "0%",
    };

    return {
      presentCount: validAttended,
      attendanceRate: `${Math.round((validAttended / validTotal) * 100)}%`,
    };
  };

  const downloadIneligibleStudents = () => {
    const ineligibleStudents = employees
      .filter((emp) => {
        const total = user?.NoOfClassesTaken || 0;
        const { attendanceRate } = calculateAttendance(emp.Attended, total);
        return parseFloat(attendanceRate) < 70;
      })
      .map((emp) => {
        const total = user?.NoOfClassesTaken || 0;
        const { presentCount, attendanceRate } = calculateAttendance(emp.Attended, total);

        return {
          "Student Name": emp.fullName,
          "Total Classes": total,
          "Attended": presentCount,
          "Attendance Rate": attendanceRate,
        };
      });

    const worksheet = XLSX.utils.json_to_sheet(ineligibleStudents);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ineligible Students");

    XLSX.writeFile(workbook, "Ineligible_Students.xlsx");
  };

  return (
    <div className="p-6 bg-base-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <button onClick={() => navigate('/client-attendance')} className="btn btn-primary">
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
              {employees.length > 0 ? (
                employees.map((emp) => {
                  const total = user?.NoOfClassesTaken || 0;
                  const { presentCount, attendanceRate } = calculateAttendance(emp.Attended, total);
                  let absent = total - emp.Attended || 0;

                  return (
                    <tr key={emp._id}>
                      <td>{emp.fullName}</td>
                      <td>{total}</td>
                      <td><span className="badge badge-success">{presentCount}</span></td>
                      <td><span className="badge">{absent}</span></td>
                      <td><span className="badge badge-primary">{attendanceRate}</span></td>
                    </tr>
                  );
                })
              ) : (
                <p className="mx-auto text-center py-4">No students registered</p>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {employees.length > 0 && (
        <button onClick={() => setIsineligibleOpen(!isineligibleOpen)} className="btn btn-secondary">
          {isineligibleOpen ? "Hide Ineligible Students" : "Show Ineligible Students"}
        </button>
      )}

      {isineligibleOpen && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Ineligible Students (Attendance &lt; 70%)</h3>
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
                        <td><span className="badge badge-success">{presentCount}</span></td>
                        <td><span className="badge badge-primary">{attendanceRate}</span></td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <button onClick={downloadIneligibleStudents} className="btn btn-outline btn-accent mt-4 flex items-center">
            <Download className="mr-2" /> Download Ineligible Students
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
