"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Book, Calendar, Edit, Search, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { db, type JournalEntry, addItem, deleteItem } from "@/lib/db"
import { useLiveQuery } from "dexie-react-hooks"

export default function JournalPage() {
  // Use Dexie's useLiveQuery hook to get real-time updates from the database
  const entries = useLiveQuery(() => db.journalEntries.orderBy("date").reverse().toArray(), []) || []

  const [newEntry, setNewEntry] = useState<Partial<JournalEntry>>({
    title: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    category: "Application",
    tags: [],
    mood: "neutral",
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [tagInput, setTagInput] = useState("")

  // Reset selected entry when entries change
  useEffect(() => {
    if (selectedEntry && entries.length > 0) {
      const stillExists = entries.some((entry) => entry.id === selectedEntry.id)
      if (!stillExists) {
        setSelectedEntry(null)
      }
    }
  }, [entries, selectedEntry])

  const addEntry = async () => {
    if (!newEntry.title || !newEntry.content) return

    const entry: JournalEntry = {
      title: newEntry.title,
      content: newEntry.content,
      date: newEntry.date || new Date().toISOString().split("T")[0],
      category: newEntry.category || "Application",
      tags: newEntry.tags || [],
      mood: newEntry.mood || "neutral",
    }

    // Add to database
    await addItem(db.journalEntries, entry)

    // Reset form
    setNewEntry({
      title: "",
      content: "",
      date: new Date().toISOString().split("T")[0],
      category: "Application",
      tags: [],
      mood: "neutral",
    })
  }

  const removeEntry = async (id: string) => {
    if (!id) return

    await deleteItem(db.journalEntries, id)

    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry(null)
    }
  }

  const addTag = () => {
    if (!tagInput.trim() || !newEntry.tags) return

    setNewEntry({
      ...newEntry,
      tags: [...(newEntry.tags || []), tagInput.trim()],
    })
    setTagInput("")
  }

  const removeTag = (tag: string) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags?.filter((t) => t !== tag),
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput) {
      e.preventDefault()
      addTag()
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || entry.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "excited":
        return "😃"
      case "proud":
        return "😊"
      case "focused":
        return "🧐"
      case "anxious":
        return "😟"
      case "tired":
        return "😴"
      case "motivated":
        return "💪"
      case "frustrated":
        return "😤"
      default:
        return "😐"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Personal Journal</h1>
        <p className="text-muted-foreground">Document your USAFA journey and reflect on your experiences</p>
      </div>

      <Tabs defaultValue="entries" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entries">Journal Entries</TabsTrigger>
          <TabsTrigger value="new">New Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Application">Application</SelectItem>
                <SelectItem value="Academic">Academic</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Leadership">Leadership</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center md:col-span-2 lg:col-span-3">
                <Book className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No journal entries found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || categoryFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create your first journal entry"}
                </p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className={`overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    selectedEntry?.id === entry.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{entry.title}</CardTitle>
                        <CardDescription>{formatDate(entry.date)}</CardDescription>
                      </div>
                      <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                        {entry.category}
                      </span>
                      {entry.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 2 && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                          +{entry.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {selectedEntry && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedEntry.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(selectedEntry.date)}
                      <span className="text-lg">{getMoodEmoji(selectedEntry.mood)}</span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (selectedEntry.id) {
                        removeEntry(selectedEntry.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="whitespace-pre-line">{selectedEntry.content}</p>
                <div className="flex flex-wrap gap-1">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    {selectedEntry.category}
                  </span>
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Journal Entry</CardTitle>
              <CardDescription>Record your thoughts, experiences, and reflections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entry-title">Title</Label>
                <Input
                  id="entry-title"
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                  placeholder="Enter a title for your journal entry"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="entry-date">Date</Label>
                  <Input
                    id="entry-date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-category">Category</Label>
                  <Select
                    value={newEntry.category}
                    onValueChange={(value) => setNewEntry({ ...newEntry, category: value })}
                  >
                    <SelectTrigger id="entry-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Application">Application</SelectItem>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entry-mood">Mood</Label>
                  <Select value={newEntry.mood} onValueChange={(value) => setNewEntry({ ...newEntry, mood: value })}>
                    <SelectTrigger id="entry-mood">
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excited">Excited 😃</SelectItem>
                      <SelectItem value="proud">Proud 😊</SelectItem>
                      <SelectItem value="focused">Focused 🧐</SelectItem>
                      <SelectItem value="neutral">Neutral 😐</SelectItem>
                      <SelectItem value="anxious">Anxious 😟</SelectItem>
                      <SelectItem value="tired">Tired 😴</SelectItem>
                      <SelectItem value="motivated">Motivated 💪</SelectItem>
                      <SelectItem value="frustrated">Frustrated 😤</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-content">Journal Entry</Label>
                <Textarea
                  id="entry-content"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                  placeholder="Write your thoughts, experiences, and reflections here..."
                  rows={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entry-tags">Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="entry-tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add tags (press Enter to add)"
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={addTag}>
                    <Tag className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {newEntry.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        className="ml-1 rounded-full text-muted-foreground hover:text-foreground"
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={addEntry} className="w-full">
                <Edit className="mr-2 h-4 w-4" /> Save Journal Entry
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
