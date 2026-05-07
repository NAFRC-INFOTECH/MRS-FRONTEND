import { useMemo } from "react";
import { ArrowRightLeft, CreditCard, ReceiptText, ShieldCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNHIAReferredPatientsQuery } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildNHIARows, summarizeNHIARows } from "./nhiaPatients";

export default function NHIADashboard() {
  const navigate = useNavigate();
  const q = useNHIAReferredPatientsQuery();

  const rows = useMemo(() => buildNHIARows((q.data as any[]) || []), [q.data]);
  const summary = useMemo(() => summarizeNHIARows(rows), [rows]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NHIA Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor patients routed to NHIA and keep track of verification workload before opening the
            detailed patients list.
          </p>
        </div>
        <Button onClick={() => navigate("/nhia/patients")}>
          <ArrowRightLeft className="h-4 w-4" />
          Open Patients List
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Total NHIA Patients</CardTitle>
              <CardDescription>All active records under NHIA workflow</CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Awaiting Verification</CardTitle>
              <CardDescription>Records still pending NHIA desk completion</CardDescription>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.awaiting}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Personnel Desk</CardTitle>
              <CardDescription>Veteran and service-member NHIA lane</CardDescription>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.personnel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Civilian Desk</CardTitle>
              <CardDescription>Civilian and dependent NHIA lane</CardDescription>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.civilian}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>NHIA Workflow Overview</CardTitle>
            <CardDescription>
              Use the dashboard for queue visibility, then open the patients list to complete per-patient
              NHIA verification actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">1. Receive Transfer</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Patients appear here after the recording desk transfers them to NHIA.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">2. Verify Coverage</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Review the patient card details and confirm the correct NHIA processing lane.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">3. Complete Desk Step</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Finalize the NHIA desk step from the patients list when verification is done.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Snapshot</CardTitle>
            <CardDescription>Quick operational picture for the current NHIA desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Completed Desk Reviews</p>
                <p className="text-xs text-muted-foreground">Patients already cleared from NHIA</p>
              </div>
              <span className="text-xl font-semibold">{summary.completed}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Patients List</p>
                <p className="text-xs text-muted-foreground">Open the operational queue table</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/nhia/patients")}>
                <ReceiptText className="h-4 w-4" />
                Open
              </Button>
            </div>

            {q.isLoading && (
              <p className="text-sm text-muted-foreground">Loading NHIA dashboard data...</p>
            )}

            {q.isError && !q.isLoading && (
              <p className="text-sm text-red-600">Unable to load NHIA dashboard data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
