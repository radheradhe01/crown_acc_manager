import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentCompany } from "@/hooks/use-current-company";
import { apiRequest } from "@/lib/queryClient";

interface CustomerReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: number;
    name: string;
    enablePaymentReminders?: boolean;
    reminderDays?: string;
    reminderFrequency?: number;
  };
}

export function CustomerReminderSettingsModal({ isOpen, onClose, customer }: CustomerReminderSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentCompany } = useCurrentCompany();
  
  const [settings, setSettings] = useState({
    enablePaymentReminders: customer.enablePaymentReminders ?? true,
    reminderDays: customer.reminderDays ?? "0,7,15,30",
    reminderFrequency: customer.reminderFrequency ?? 30,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      return apiRequest(`/api/customers/${customer.id}`, {
        method: "PUT",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer reminder settings updated successfully",
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/companies/${currentCompany?.id}/customers-with-balance`] 
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update reminder settings",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reminder Settings for {customer.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableReminders"
              checked={settings.enablePaymentReminders}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, enablePaymentReminders: !!checked }))
              }
            />
            <Label htmlFor="enableReminders">
              Enable automatic payment reminders
            </Label>
          </div>
          
          {settings.enablePaymentReminders && (
            <>
              <div>
                <Label htmlFor="reminderDays">Reminder Days</Label>
                <Input
                  id="reminderDays"
                  value={settings.reminderDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderDays: e.target.value }))}
                  placeholder="0,7,15,30"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Days after due date (comma-separated)
                </p>
              </div>
              
              <div>
                <Label htmlFor="reminderFrequency">Recurring Frequency (days)</Label>
                <Input
                  id="reminderFrequency"
                  type="number"
                  value={settings.reminderFrequency}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderFrequency: parseInt(e.target.value) || 30 }))}
                  placeholder="30"
                  className="mt-1"
                />
                <p className="text-xs text-gray-600 mt-1">
                  How often to repeat reminders after the initial schedule
                </p>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}