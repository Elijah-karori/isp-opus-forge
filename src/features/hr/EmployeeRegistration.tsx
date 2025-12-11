import { apiClient } from '@/lib/api';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EmployeeRegistration() {
  const [form, setForm] = useState({ full_name: "", email: "", department: "", designation: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
        // This is a placeholder for creating an employee and starting a workflow.
        // In a real application, you would have a user and role system to get the IDs from.
        const employee: any = await apiClient.post("/hr/employees", {
            user_id: 1, // Placeholder user_id
            employee_code: `EMP-${Date.now()}`,
            engagement_type: 'FULL_TIME',
            hire_date: new Date().toISOString().split('T')[0],
            ...form
        });

        await apiClient.post("/api/v1/workflows/start", {
          workflow_id: 1, // Employee Onboarding Workflow
          related_model: "EmployeeProfile",
          related_id: employee.id, // ID from the created employee
          initiated_by: 1, // Placeholder initiated_by
        });
        setSuccess("Employee registered and workflow started!");
        setForm({ full_name: "", email: "", department: "", designation: "" });
    } catch (err) {
        setError("Failed to register employee. Please check the details and try again.");
        console.error(err);
    }
  }

  return (
    <Card className="w-full max-w-lg mx-auto mt-10">
        <CardHeader>
            <CardTitle>Employee Registration</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {success && (
                    <Alert variant="default">
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input id="full_name" placeholder="Full name" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" placeholder="Department" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" placeholder="Designation" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} />
                </div>
              <Button type="submit" className="w-full">Register</Button>
            </form>
        </CardContent>
    </Card>

  );
}
