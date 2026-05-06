import { useMemo } from "react";
import { ArrowRightLeft, CreditCard, ReceiptText, UserRoundCheck, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePaypointReferredPatientsQuery } from "@/api-integration/queries/patients";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildPaypointRows, summarizePaypointRows } from "./paypointPatients";

export default function PaypointDashboard() {
  const navigate = useNavigate();
  const q = usePaypointReferredPatientsQuery();

  const rows = useMemo(() => buildPaypointRows((q.data as any[]) || []), [q.data]);
  const summary = useMemo(() => summarizePaypointRows(rows), [rows]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Paypoint Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitor patients currently routed to the paypoint desk and keep track of operational workload
            before opening the detailed queue list.
          </p>
        </div>
        <Button onClick={() => navigate("/paypoint/patients")}>
          <ArrowRightLeft className="h-4 w-4" />
          Open Patients List
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Total Paypoint Patients</CardTitle>
              <CardDescription>All active records under paypoint workflow</CardDescription>
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
              <CardTitle>Awaiting Clearance</CardTitle>
              <CardDescription>Records still pending desk completion</CardDescription>
            </div>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.awaiting}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Personnel Desk</CardTitle>
              <CardDescription>Soldier and veteran billing lane</CardDescription>
            </div>
            <UserRoundCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.personnel}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Civilian Desk</CardTitle>
              <CardDescription>Civilian and dependent billing lane</CardDescription>
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
            <CardTitle>Desk Workflow Overview</CardTitle>
            <CardDescription>
              Use the dashboard for queue visibility, then open the patients list to complete per-patient desk
              actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">1. Receive Transfer</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Patients appear here after the recording desk transfers them to paypoint.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">2. Review Queue</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Confirm whether the patient belongs to the civilian or personnel billing lane.
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">3. Clear Desk Step</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Complete desk processing from the patients list when the paypoint review is done.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Queue Snapshot</CardTitle>
            <CardDescription>Quick operational picture for the current paypoint desk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Completed Desk Reviews</p>
                <p className="text-xs text-muted-foreground">Patients already cleared from paypoint</p>
              </div>
              <span className="text-xl font-semibold">{summary.completed}</span>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Patients List</p>
                <p className="text-xs text-muted-foreground">Open the operational queue table</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/paypoint/patients")}>
                <ReceiptText className="h-4 w-4" />
                Open
              </Button>
            </div>

            {q.isLoading && (
              <p className="text-sm text-muted-foreground">Loading paypoint dashboard data...</p>
            )}

            {q.isError && !q.isLoading && (
              <p className="text-sm text-red-600">Unable to load paypoint dashboard data.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
