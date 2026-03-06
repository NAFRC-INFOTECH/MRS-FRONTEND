import { useParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateVitalMutation } from "@/api-integration/mutations/vitals";

const schema = z.object({
  temperature: z.coerce.number().min(0).optional(),
  pulse: z.coerce.number().min(0).optional(),
  respirationRate: z.coerce.number().min(0).optional(),
  bp: z.string().trim().optional(),
  spo2: z.coerce.number().min(0).max(100).optional(),
  fbsRbs: z.string().trim().optional(),
  height: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
});

export default function AddVitalsSigns() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const createVital = useCreateVitalMutation();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      temperature: undefined,
      pulse: undefined,
      respirationRate: undefined,
      bp: "",
      spo2: undefined,
      fbsRbs: "",
      height: undefined,
      weight: undefined,
    },
  });

  return (
    <div className="p-4 space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Add Vital Signs</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={form.handleSubmit((values) => {
                if (!patientId) {
                  toast.error("Missing patient id");
                  return;
                }
                createVital.mutate(
                  {
                    patientId,
                    recordedAt: new Date().toISOString(),
                    ...values,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Vitals recorded");
                      navigate("/gopd/patients-in-queue");
                    },
                    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : "Failed to record vitals"),
                  }
                );
              })}
            >
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pulse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pulse (bpm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="respirationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Respiration Rate (rpm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Pressure (e.g., 120/80)</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="spo2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SpO₂ (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fbsRbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FBS/RBS (mg/dL)</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" value={field.value as number | undefined} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/gopd/patients-in-queue")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#56bbe3] text-white hover:bg-[#56bbe3]/80"
                  disabled={createVital.isPending}
                >
                  {createVital.isPending ? "Saving..." : "Save Vitals"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
