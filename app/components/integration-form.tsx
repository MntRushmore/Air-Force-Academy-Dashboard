import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Integration,
  IntegrationProvider,
  IntegrationStatus,
} from "@/lib/types";
import { Loader2 } from "lucide-react";

interface IntegrationFormProps {
  integration?: Integration;
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationForm({
  integration,
  isOpen,
  onClose,
}: IntegrationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!integration;

  const [formData, setFormData] = useState<Partial<Integration>>(
    integration || {
      provider: "google" as IntegrationProvider,
      status: "active" as IntegrationStatus,
      settings: {},
    }
  );

  // Create integration mutation
  const createIntegration = useMutation({
    mutationFn: async (data: Partial<Integration>) => {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create integration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration created successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
    },
  });

  // Update integration mutation
  const updateIntegration = useMutation({
    mutationFn: async (data: Partial<Integration>) => {
      const response = await fetch("/api/integrations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: integration?.id, ...data }),
      });
      if (!response.ok) throw new Error("Failed to update integration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
      toast({
        title: "Success",
        description: "Integration updated successfully",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update integration",
        variant: "destructive",
      });
    },
  });

  const isLoading = createIntegration.isPending || updateIntegration.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      updateIntegration.mutate(formData);
    } else {
      createIntegration.mutate(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Integration" : "Add Integration"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your integration settings"
              : "Connect a new integration"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value: IntegrationProvider) =>
                setFormData({ ...formData, provider: value })
              }
              disabled={isEditMode}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="microsoft">Microsoft</SelectItem>
                <SelectItem value="canvas">Canvas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: IntegrationStatus) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">Access Token</Label>
            <Input
              id="access_token"
              type="password"
              value={formData.access_token || ""}
              onChange={(e) =>
                setFormData({ ...formData, access_token: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refresh_token">Refresh Token (Optional)</Label>
            <Input
              id="refresh_token"
              type="password"
              value={formData.refresh_token || ""}
              onChange={(e) =>
                setFormData({ ...formData, refresh_token: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
