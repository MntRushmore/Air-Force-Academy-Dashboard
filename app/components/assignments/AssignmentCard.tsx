

'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AssignmentCardProps {
  assignment: {
    id: string;
    title: string;
    due_date?: string;
  };
  onEdit: (assignmentId: string) => void;
  onDelete: (assignmentId: string) => void;
}

export function AssignmentCard({ assignment, onEdit, onDelete }: AssignmentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <CardDescription>
          {assignment.due_date
            ? `Due ${new Date(assignment.due_date).toLocaleDateString()}`
            : 'No due date'}
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(assignment.id)}>
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(assignment.id)}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}