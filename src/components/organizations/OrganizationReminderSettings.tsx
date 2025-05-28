
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { useOrganizationReminderSettings } from '@/hooks/useOrganizationReminderSettings';

export function OrganizationReminderSettings() {
  const { 
    reminderSettings, 
    isLoading, 
    createSettings, 
    updateSettings, 
    isCreating, 
    isUpdating 
  } = useOrganizationReminderSettings();

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([5, 1]);
  const [newReminderDay, setNewReminderDay] = useState<string>('');

  useEffect(() => {
    if (reminderSettings) {
      setReminderEnabled(reminderSettings.reminder_enabled);
      setReminderDays(reminderSettings.reminder_days_before);
    }
  }, [reminderSettings]);

  const handleSave = () => {
    const settings = {
      reminder_enabled: reminderEnabled,
      reminder_days_before: reminderDays,
    };

    if (reminderSettings) {
      updateSettings(settings);
    } else {
      createSettings(settings);
    }
  };

  const addReminderDay = () => {
    const day = parseInt(newReminderDay);
    if (day > 0 && !reminderDays.includes(day)) {
      const newDays = [...reminderDays, day].sort((a, b) => b - a);
      setReminderDays(newDays);
      setNewReminderDay('');
    }
  };

  const removeReminderDay = (dayToRemove: number) => {
    setReminderDays(reminderDays.filter(day => day !== dayToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addReminderDay();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Supplier Reminder Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplier Reminder Settings</CardTitle>
        <CardDescription>
          Configure automatic reminders to suppliers about upcoming quote deadlines
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="reminder-enabled">Enable Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Send automatic reminder notifications to suppliers
            </p>
          </div>
          <Switch
            id="reminder-enabled"
            checked={reminderEnabled}
            onCheckedChange={setReminderEnabled}
          />
        </div>

        {/* Reminder Days Configuration */}
        {reminderEnabled && (
          <div className="space-y-4">
            <div>
              <Label>Reminder Days</Label>
              <p className="text-sm text-muted-foreground">
                Number of days before the deadline to send reminders
              </p>
            </div>

            {/* Current Reminder Days */}
            <div className="flex flex-wrap gap-2">
              {reminderDays.map((day) => (
                <Badge key={day} variant="secondary" className="flex items-center gap-1">
                  {day} day{day !== 1 ? 's' : ''} before
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeReminderDay(day)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>

            {/* Add New Reminder Day */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="new-reminder-day">Add Reminder Day</Label>
                <Input
                  id="new-reminder-day"
                  type="number"
                  min="1"
                  max="30"
                  placeholder="Enter days before deadline"
                  value={newReminderDay}
                  onChange={(e) => setNewReminderDay(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addReminderDay}
                disabled={!newReminderDay || parseInt(newReminderDay) <= 0}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
