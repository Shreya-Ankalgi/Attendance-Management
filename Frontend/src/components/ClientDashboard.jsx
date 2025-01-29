import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore.js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const ClientDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const {
    employees,
    fetchEmployees,
    assignWork,
    isAssigning,
    assignments,
    fetchEmployeeAssignments,
    updateAssignmentStatus,
  } = useAuthStore();

  const [newAssignment, setNewAssignment] = useState({
    employeeName: "",
    title: "",
    description: "",
    deadline: "",
  });

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const fetchedEmployees = await fetchEmployees();
        if (fetchedEmployees?.length > 0) {
          const defaultEmployeeId = fetchedEmployees[0]._id;
          setSelectedEmployeeId(defaultEmployeeId);
          await fetchEmployeeAssignments(defaultEmployeeId);
        }
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      }
    };

    initializeDashboard();
  }, []);

  /*** Pie Chart Data Preparation ***/
  const prepareEmployeeCompletionData = () => {
    const totalPresent = assignments.filter(
      (a) => a.title === "Present"
    ).length;
    const totalAbsent = assignments.filter((a) => a.title === "Absent").length;

    return [
      { name: "Present", value: totalPresent },
      { name: "Absent", value: totalAbsent },
    ];
  };

  const handleEmployeeSelect = async (employeeId) => {
    setSelectedEmployeeId(employeeId);
    await fetchEmployeeAssignments(employeeId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignWork(newAssignment);
      setShowModal(false);
      setNewAssignment({
        employeeName: "",
        title: "",
        description: "",
        deadline: "",
      });
      await fetchEmployeeAssignments(selectedEmployeeId);
    } catch (error) {
      console.error("Error assigning work:", error);
    }
  };

  const handleStatusUpdate = async (assignmentId, status) => {
    try {
      await updateAssignmentStatus(assignmentId, status);
      await fetchEmployeeAssignments(selectedEmployeeId);
    } catch (error) {
      console.error("Error updating assignment status:", error);
    }
  };

  const COLORS = ["#28A745", "#DC3545"]; // Green for Present, Red for Absent

  return (
    <div className="p-6 bg-base-100 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mentor Dashboard</h2>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus /> Mark Attendance
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Attendance Status Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Total Classes</th>
                <th>Missed Classes</th>
                <th>Attended</th>
                <th>Attendance Rate</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const empAssignments = assignments.filter(
                  (a) => a.assignedTo === emp._id
                );
                const presentCount = empAssignments.filter(
                  (a) => a.title === "Present"
                ).length;
                const total = empAssignments.length;
                const absentCount = total - presentCount;

                return (
                  <tr key={emp.name}>
                    <td>{emp.fullName}</td>
                    <td>{total}</td>
                    <td>
                      <span className="badge badge-error">{absentCount}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {presentCount}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">
                        {total > 0
                          ? `${Math.round((presentCount / total) * 100)}%`
                          : "0%"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-4">
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Select Student
            <select
              className="ml-4 select select-bordered select-sm"
              value={selectedEmployeeId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.fullName}
                </option>
              ))}
            </select>
          </h3>
          <div className="overflow-x-auto">
            <table className="table w-3/4">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Day</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.title}</td>
                    <td>
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 ml-4">
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={prepareEmployeeCompletionData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#FFFFFF"
                  dataKey="value"
                >
                  {prepareEmployeeCompletionData().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg mb-4">Mark Attendance</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-control w-full">
                  <label className="label">Student Name</label>
                  <select
                    className="select select-bordered w-full"
                    value={newAssignment.employeeName}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        employeeName: e.target.value,
                      })
                    }
                    required
                  >
                    <option disabled value="">
                      Select student
                    </option>
                    {employees?.map((emp) => (
                      <option key={emp._id} value={emp.fullName}>
                        {emp.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label">Attendance</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="Present"
                        className="radio"
                        checked={newAssignment.title === "Present"}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                      <span>Present</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="Absent"
                        className="radio"
                        checked={newAssignment.title === "Absent"}
                        onChange={(e) =>
                          setNewAssignment({
                            ...newAssignment,
                            title: e.target.value,
                          })
                        }
                        required
                      />
                      <span>Absent</span>
                    </label>
                  </div>
                </div>
                <div className="form-control w-full">
                  <label className="label">Deadline</label>
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={newAssignment.deadline}
                    min={getTomorrowDate()}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        deadline: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isAssigning}
                  >
                    {isAssigning ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
