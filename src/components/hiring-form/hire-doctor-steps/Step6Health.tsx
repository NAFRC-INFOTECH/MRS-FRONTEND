import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function Step6Health({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Health and Wellness</h2>

      <FormField
        control={form.control}
        name="medicalHistory"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Medical History</FormLabel>
            <FormControl>
              <Textarea placeholder="Provide relevant medical history" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="vaccination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vaccination Records</FormLabel>
              <FormControl>
                <Input placeholder="Hepatitis B, TB, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="screening"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Health Screening</FormLabel>
              <FormControl>
                <Input placeholder="Tuberculosis, blood tests, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
