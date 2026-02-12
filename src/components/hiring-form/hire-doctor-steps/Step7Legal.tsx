import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Step7Legal({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Legal and Regulatory Compliance</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="validLicense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valid Medical License(s)</FormLabel>
              <FormControl>
                <Input placeholder="License details" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backgroundCheck"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Criminal Background Check</FormLabel>
              <FormControl>
                <Input placeholder="Background check reference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="insurance"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Medical Malpractice Insurance</FormLabel>
            <FormControl>
              <Input placeholder="Insurance policy details" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
