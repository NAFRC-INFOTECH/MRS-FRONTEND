import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function Step4CME({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Continuing Medical Education (CME)</h2>

      <FormField
        control={form.control}
        name="workshops"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Workshops / Conferences</FormLabel>
            <FormControl>
              <Textarea placeholder="List workshops, conferences, and seminars attended (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="research"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Research / Publications</FormLabel>
            <FormControl>
              <Textarea placeholder="List research, publications, and journals (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fellowships"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Training / Fellowships</FormLabel>
            <FormControl>
              <Textarea placeholder="List trainings and fellowships (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
