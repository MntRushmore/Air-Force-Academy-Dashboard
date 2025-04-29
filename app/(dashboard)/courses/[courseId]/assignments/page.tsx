'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-utils';
import { useToast } from '@/hooks/use-toast';
import { AssignmentCard } from '../../../../components/assignments/AssignmentCard';
import { AssignmentDialog } from '../../../../components/assignments/AssignmentDialog';

interface Assignment {
  id: string;
  course_id: string;
  title: string;
  due_date?: string;
  created_at: string;
}

export default function AssignmentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  async function fetchAssignments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });
  
      if (error) throw error;
      if (data) {
        setAssignments(data as unknown as Assignment[]);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: 'Error',
        description: 'Could not load assignments!',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAssignment(title: string, dueDate: string, courseId: string) {
    try {
      const { error } = await supabase.from('assignments').insert({
        course_id: courseId,
        title,
        due_date: dueDate || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment added successfully!',
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error adding assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add assignment.',
        variant: 'destructive',
      });
    }
  }

  // Handler for deleting an assignment
  async function handleDeleteAssignment(id: string) {
    try {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) throw error;
      toast({
        title: 'Deleted!',
        description: 'Assignment has been deleted.',
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete assignment.',
        variant: 'destructive',
      });
    }
  }

  // Open the edit dialog with the selected assignment's data
  function handleEditAssignment(id: string) {
    const assignment = assignments.find((a) => a.id === id);
    if (assignment) {
      setEditingAssignment(assignment);
      setEditDialogOpen(true);
    }
  }

  // Update an assignment in Supabase
  async function handleUpdateAssignment(title: string, dueDate: string) {
    if (!editingAssignment) return;

    try {
      const { error } = await supabase.from('assignments').update({
        title,
        due_date: dueDate || null,
      }).eq('id', editingAssignment.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment updated successfully!',
      });

      setEditDialogOpen(false);
      setEditingAssignment(null);
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground">Assignments for this course</p>
        </div>
        {/* Add Assignment Dialog */}
        <AssignmentDialog onAddAssignment={handleAddAssignment} courseId={courseId} />
        {/* Edit Assignment Dialog */}
        {editingAssignment && (
          <AssignmentDialog
            onAddAssignment={handleUpdateAssignment}
            initialTitle={editingAssignment.title}
            initialDueDate={editingAssignment.due_date || ''}
            open={editDialogOpen}
            setOpen={(open: boolean) => {
              setEditDialogOpen(open);
              if (!open) setEditingAssignment(null);
            }}
            courseId={courseId}
          />
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* You can keep Skeleton loaders here if you want */}
        </div>
      ) : assignments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((assignment: Assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onEdit={handleEditAssignment}
              onDelete={handleDeleteAssignment}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">No assignments yet!</div>
      )}
    </div>
  );
}