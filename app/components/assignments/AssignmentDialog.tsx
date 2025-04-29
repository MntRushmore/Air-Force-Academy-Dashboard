'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AssignmentDialogProps {
  onAddAssignment: (title: string, dueDate: string, courseId: string) => Promise<void>;
  courseId: string;
  initialTitle?: string;
  initialDueDate?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export function AssignmentDialog({ onAddAssignment, courseId, initialTitle = '', initialDueDate = '', open, setOpen }: AssignmentDialogProps) {
  const [newTitle, setNewTitle] = useState(initialTitle);
  const [newDueDate, setNewDueDate] = useState(initialDueDate);

  useEffect(() => {
    setNewTitle(initialTitle);
    setNewDueDate(initialDueDate);
  }, [initialTitle, initialDueDate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onAddAssignment(newTitle, newDueDate, courseId);
    if (setOpen) setOpen(false);
    setNewTitle('');
    setNewDueDate('');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          {initialTitle ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {initialTitle ? 'Edit Assignment' : 'Add Assignment'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialTitle ? 'Edit Assignment' : 'Add New Assignment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}