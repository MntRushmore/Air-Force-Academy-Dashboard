"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle2, Circle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LogItem = {
  id: string
  text: string
  completed: boolean
}

export function DailyLog() {
  const [items, setItems] = useState<LogItem[]>([
    { id: "1", text: "Complete physics homework", completed: true },
    { id: "2", text: "Run 2 miles", completed: false },
    { id: "3", text: "Work on personal statement", completed: false },
  ])
  const [newItem, setNewItem] = useState("")

  const addItem = () => {
    if (!newItem.trim()) return

    const item: LogItem = {
      id: String(Date.now()),
      text: newItem,
      completed: false,
    }

    setItems([...items, item])
    setNewItem("")
  }

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItem()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleItem(item.id)}>
              {item.completed ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
            </Button>
            <span className={item.completed ? "line-through text-muted-foreground" : ""}>{item.text}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new item..."
          className="flex-1"
        />
        <Button size="icon" onClick={addItem}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
