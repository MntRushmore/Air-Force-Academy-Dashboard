"use client";

import { useState } from "react";
import { db } from "@/lib/db";

export default function AddAssignment({ courseId }: { courseId: string }) {
  const [assignmentName, setAssignmentName] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [weight, setWeight] = useState(100); // New: weight of the assignment
  const [dueDate, setDueDate] = useState(""); // New: due date

  const handleAddAssignment = async () => {
    if (!assignmentName.trim()) {
      alert("Please enter an assignment name.");
      return;
    }
    await db.assignments.add({
      courseId,
      assignmentName,
      maxScore,
      weight,
      dueDate: dueDate || "",
      createdAt: new Date(),
    });
    alert("Assignment added!");
    setAssignmentName("");
    setMaxScore(100);
    setWeight(100);
    setDueDate("");
  };

  return (
    <div className="flex flex-col gap-2">
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
      <button
        onClick={handleAddAssignment}
        className="bg-blue-600 text-white p-2 rounded"
      >
        Add Assignment
      </button>
    </div>
  );
}