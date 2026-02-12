import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Step5Skills({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Skills and Competencies</h2>

      <FormField
        control={form.control}
        name="clinicalSkills"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Clinical Skills</FormLabel>
            <FormControl>
              <Textarea placeholder="Patient assessment, diagnosis, treatment plans, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="surgicalExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surgical Experience</FormLabel>
              <FormControl>
                <Textarea placeholder="If applicable (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="equipment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment & Technology</FormLabel>
              <FormControl>
                <Input placeholder="Proficiency with medical equipment/technology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="leadership"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Leadership & Management</FormLabel>
            <FormControl>
              <Textarea placeholder="For senior roles (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
