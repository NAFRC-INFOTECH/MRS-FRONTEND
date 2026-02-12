import type { UseFormReturn } from "react-hook-form";
import type { DoctorFormValues } from "@/lib/validations/doctorFormSchema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Step2Qualifications({ form }: { form: UseFormReturn<DoctorFormValues> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Professional Qualifications</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="degree"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Degree</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select degree" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MBBS">MBBS</SelectItem>
                    <SelectItem value="MD">MD</SelectItem>
                    <SelectItem value="DO">DO</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Cardiology" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="licenseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical License Number</FormLabel>
              <FormControl>
                <Input placeholder="License/Registration number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicalSchool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical School</FormLabel>
              <FormControl>
                <Input placeholder="University name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="graduationYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Graduation Year</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 2012" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="boardCertifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Board Certifications</FormLabel>
            <FormControl>
              <Textarea placeholder="List board certifications (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="additionalCertifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Certifications</FormLabel>
            <FormControl>
              <Textarea placeholder="CPR, ACLS, etc. (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
