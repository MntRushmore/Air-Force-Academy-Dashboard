"use client";

import { useState } from "react";
import { db } from "@/lib/db";

export default function AddGrade({ assignmentId }: { assignmentId: string }) {
  const [scoreReceived, setScoreReceived] = useState<number | "">("");

  const handleAddGrade = async () => {
    if (scoreReceived === "") {
      alert("Please enter a score!");
      return;
    }
    await db.grades.add({
      assignmentId,
      scoreReceived: Number(scoreReceived),
      createdAt: new Date(),
    });
    setScoreReceived("");
    alert("Grade added!");
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        type="number"
        placeholder="Score Received"
        value={scoreReceived}
        onChange={(e) => setScoreReceived(Number(e.target.value))}
        className="border p-2 rounded"
      />
      <button
        onClick={handleAddGrade}
        className="bg-green-600 text-white p-2 rounded"
      >
        Save Grade
      </button>
    </div>
  );
}