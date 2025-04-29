"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import AddGrade from "@/components/AddGrade";

export default function AssignmentList({ courseId }: { courseId: string }) {
  const assignments = useLiveQuery(() =>
    db.assignments
      .where("courseId")
      .equals(courseId)
      .toArray()
  , [courseId]) || [];

  const [showGradeFormId, setShowGradeFormId] = useState<string | null>(null);

  // Sort assignments by due date, if present
  const sortedAssignments = assignments.sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date();
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date();
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4">Assignments</h2>
      {sortedAssignments.length === 0 ? (
        <p className="text-muted-foreground">No assignments added yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {sortedAssignments.map((assignment) => (
            <li key={assignment.id} className="border p-4 rounded shadow">
              <div className="font-semibold">{assignment.assignmentName}</div>
              <div>Max Score: {assignment.maxScore}</div>
              <div>Weight: {assignment.weight}%</div>
              <div>
                Due Date:{" "}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No date set"}
              </div>
              <div className="mt-2">
                <button
                  onClick={() => setShowGradeFormId(
                    assignment.id ? (assignment.id === showGradeFormId ? null : assignment.id) : null
                  )}
                  className="text-blue-500 underline"
                >
                  {assignment.id === showGradeFormId ? "Cancel" : "➕ Add Grade"}
                </button>
                {assignment.id === showGradeFormId && (
                  <div className="mt-2">
                    <AddGrade assignmentId={assignment.id} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}