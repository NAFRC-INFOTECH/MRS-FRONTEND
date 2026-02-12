import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

export default function Step8Statement({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Personal Statement</h2>

      <FormField
        control={form.control}
        name="motivation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivation</FormLabel>
            <FormControl>
              <Textarea placeholder="Why are you applying for this position?" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="careerGoals"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Career Goals</FormLabel>
            <FormControl>
              <Textarea placeholder="Outline your career goals" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="whyHospital"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Why Our Hospital?</FormLabel>
            <FormControl>
              <Textarea placeholder="Tell us why you want to work here" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
