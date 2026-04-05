import { useState, useEffect } from "react";
import { Settings, Save, Loader2, RefreshCw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessSettings, useInventorySettings, useAllSettings, useBulkUpdateSettings, useResetSettings } from "@/hooks/api/useSettings";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemSetting } from "@/types/api.types";

const SettingsPage = () => {
  const { data: allSettings, isLoading } = useAllSettings();
  const bulkUpdateMutation = useBulkUpdateSettings();
  const resetMutation = useResetSettings();

  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (allSettings?.data) {
      const initialForm: Record<string, string> = {};
      allSettings.data.forEach((s) => {
        initialForm[s.key] = s.value;
      });
      setSettingsForm(initialForm);
    }
  }, [allSettings]);

  const handleChange = (key: string, value: string) => {
    setSettingsForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggle = (key: string, checked: boolean) => {
    setSettingsForm((prev) => ({ ...prev, [key]: checked ? 'true' : 'false' }));
  };

  const handleSave = async () => {
    // Determine which settings actually changed
    const updates: Array<{ key: string; value: string }> = [];
    allSettings?.data.forEach((s) => {
      if (settingsForm[s.key] !== undefined && settingsForm[s.key] !== s.value) {
        updates.push({ key: s.key, value: settingsForm[s.key] });
      }
    });

    if (updates.length > 0) {
      await bulkUpdateMutation.mutateAsync(updates);
    }
  };

  const handleReset = async () => {
    await resetMutation.mutateAsync();
  };

  const isSaving = bulkUpdateMutation.isPending;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your application preferences and business settings" icon={Settings} />
        <Skeleton className="h-10 w-[400px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Settings" 
        description="Manage your application preferences and business settings" 
        icon={Settings}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={handleReset} disabled={resetMutation.isPending}>
              {resetMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reset Defaults
            </Button>
            <Button className="gap-2" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Core system settings overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select 
                    value={settingsForm['DATE_FORMAT'] || 'DD/MM/YYYY'} 
                    onValueChange={(val) => handleChange('DATE_FORMAT', val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input 
                    value={settingsForm['TIMEZONE'] || ''} 
                    onChange={(e) => handleChange('TIMEZONE', e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details that appear on reports and invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input 
                    value={settingsForm['COMPANY_NAME'] || ''} 
                    onChange={(e) => handleChange('COMPANY_NAME', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business Registration No.</Label>
                  <Input 
                    value={settingsForm['REGISTRATION_NUMBER'] || ''} 
                    onChange={(e) => handleChange('REGISTRATION_NUMBER', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input 
                    value={settingsForm['TAX_ID'] || ''} 
                    onChange={(e) => handleChange('TAX_ID', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input 
                    value={settingsForm['CURRENCY'] || 'INR'} 
                    onChange={(e) => handleChange('CURRENCY', e.target.value)} 
                    placeholder="e.g. INR, USD"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  value={settingsForm['ADDRESS'] || ''} 
                  onChange={(e) => handleChange('ADDRESS', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={settingsForm['CONTACT_EMAIL'] || ''} 
                    onChange={(e) => handleChange('CONTACT_EMAIL', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input 
                    value={settingsForm['CONTACT_PHONE'] || ''} 
                    onChange={(e) => handleChange('CONTACT_PHONE', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory & Production</CardTitle>
              <CardDescription>Rules and thresholds for your stock level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                  <Label>Default Oil Yield Ratio (%)</Label>
                  <Input 
                    type="number"
                    value={settingsForm['DEFAULT_OIL_YIELD_RATIO'] || '0'} 
                    onChange={(e) => handleChange('DEFAULT_OIL_YIELD_RATIO', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Low Stock Threshold (Units)</Label>
                  <Input 
                    type="number"
                    value={settingsForm['LOW_STOCK_THRESHOLD'] || '100'} 
                    onChange={(e) => handleChange('LOW_STOCK_THRESHOLD', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive critical alerts via email</p>
                </div>
                <Switch 
                  checked={settingsForm['ENABLE_EMAIL_ALERTS'] === 'true'}
                  onCheckedChange={(checked) => handleToggle('ENABLE_EMAIL_ALERTS', checked)}
                />
              </div>
              <Separator />
               <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Summary Reports</Label>
                  <p className="text-sm text-muted-foreground">Automatically email a summary every day</p>
                </div>
                <Switch 
                  checked={settingsForm['AUTO_GENERATE_DAILY_SUMMARY'] === 'true'}
                  onCheckedChange={(checked) => handleToggle('AUTO_GENERATE_DAILY_SUMMARY', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
