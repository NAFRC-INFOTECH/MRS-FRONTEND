import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogoutMutation } from "@/api-integration/mutations/auth";
import { useProfileQuery } from "@/api-integration/queries/profile";
import { useProfileUpdateMutation, useProfileImageUploadMutation } from "@/api-integration/mutations/profile";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const schema = z.object({
  imageUrl: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  emergencyPhone: z.string().optional(),
});

export default function UserSettings() {
  const { data } = useProfileQuery();
  const logout = useLogoutMutation();
  const uploadImage = useProfileImageUploadMutation();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(data?.imageUrl ?? null);
  const [file, setFile] = React.useState<File | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      imageUrl: data?.imageUrl || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      country: data?.country || "",
      state: data?.state || "",
      email: data?.email || "",
      emergencyPhone: data?.emergencyPhone || "",
    },
    values: {
      imageUrl: data?.imageUrl || "",
      name: data?.name || "",
      phone: data?.phone || "",
      address: data?.address || "",
      country: data?.country || "",
      state: data?.state || "",
      email: data?.email || "",
      emergencyPhone: data?.emergencyPhone || "",
    },
  });
  const mutation = useProfileUpdateMutation();
  return (
    <section className="md:p-4 w-full space-y-6">
      <h1 className="text-xl font-semibold">User Settings</h1>

        <Form {...form}>
          <form
            className="gap-6  w-full grid grid-cols-1 md:grid-cols-2"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate(values, {
                onSuccess: () => toast.success("Profile updated"),
                onError: () => toast.error("Failed to update profile"),
              })
            )}
          >
            <div className="space-y-2">
              <FormLabel>User Image</FormLabel>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border">
                  {previewUrl ? (
                    <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      if (f) {
                        const url = URL.createObjectURL(f);
                        setPreviewUrl(url);
                      } else {
                        setPreviewUrl(data?.imageUrl ?? null);
                      }
                    }}
                  />
                <Button
                    className="bg-[#56bbe3] hover:bg-[#45a0d6]"
                    type="button"
                    onClick={() => {
                      if (!file) return;
                      uploadImage.mutate(file, {
                        onSuccess: (res) => {
                          setPreviewUrl(res.imageUrl);
                          form.setValue("imageUrl", res.imageUrl);
                          toast.success("Image uploaded");
                        },
                        onError: () => toast.error("Upload failed"),
                      });
                    }}
                    disabled={uploadImage.isPending || !file}
                  >
                    {uploadImage.isPending ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 111-1111" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button className="bg-[#56bbe3] hover:bg-[#45a0d6]" type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>

            <div className="pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  logout.mutate(undefined, {
                    onSuccess: () => toast.success("Logged out"),
                    onError: () => toast.error("Logout failed"),
                  })
                }
              >
                Logout
              </Button>
            </div>
          </form>
        </Form>

    </section>
  );
}
