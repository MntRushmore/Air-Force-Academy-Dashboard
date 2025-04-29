"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import EditAssignment from "@/components/EditAssignment";

export default function EditAssignment({
  assignmentId,
  closeEdit,
}: {
  assignmentId: string;
  closeEdit: () => void;
}) {
  const [assignmentName, setAssignmentName] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [weight, setWeight] = useState(100);
  const [dueDate, setDueDate] = useState("");

  // Fetch assignment data to pre-fill the form
  useEffect(() => {
    const fetchAssignment = async () => {
      const assignment = await db.assignments.get(assignmentId);
      if (assignment) {
        setAssignmentName(assignment.assignmentName);
        setMaxScore(assignment.maxScore);
        setWeight(assignment.weight);
        setDueDate(assignment.dueDate || "");
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const handleSaveChanges = async () => {
    if (!assignmentName.trim()) {
      alert("Please enter an assignment name.");
      return;
    }

    await db.assignments.update(assignmentId, {
      assignmentName,
      maxScore,
      weight,
      dueDate,
    });

    alert("Assignment updated!");
    closeEdit(); // Close the edit form
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-white shadow-lg rounded-md">
      <input
        type="text"
        placeholder="Assignment Name"
        value={assignmentName}
        onChange={(e) => setAssignmentName(e.target.value)}
        className="border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Max Score"
        value={maxScore}
        onChange={(e) => setMaxScore(Number(e.target.value))}
        className="border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Weight (%)"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="border p-2 rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="border p-2 rounded"
      />
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleSaveChanges}
          className="bg-blue-600 text-white p-2 rounded"
        >
          Save Changes
        </button>
        <button
          onClick={closeEdit}
          className="bg-gray-400 text-white p-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}