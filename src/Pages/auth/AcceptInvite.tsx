import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useInvitationLookupQuery, useAcceptInvitationMutation } from "@/api-integration/mutations/invitations";

const schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(8, "Confirm your password"),
    name: z.string().min(3, "Full name is required"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords do not match" });

export default function AcceptInvite() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token") || "";
  const lookup = useInvitationLookupQuery(token, !!token);
  const accept = useAcceptInvitationMutation();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", confirm: "", name: "" },
  });

  useEffect(() => {
    // Show the expected email in a hint, but still require user to type it
    if (lookup.data?.email) {
      // do nothing; we want the user to enter email manually as per requirement
    }
  }, [lookup.data]);

  if (!token) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#56bbe3] px-4">
        <Card className="w-full max-w-md bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-[#56bbe3]">Invalid invitation link</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#56bbe3] px-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#56bbe3]">Accept Invitation</CardTitle>
          {lookup.data?.email && (
            <p className="text-sm text-gray-500">Invitation for: <strong>{lookup.data.email}</strong></p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                accept.mutate(
                  { token, email: values.email, password: values.password, name: values.name || undefined },
                  {
                    onSuccess: () => {
                      toast.success("Invitation accepted. You can now log in.");
                      navigate("/login");
                    },
                    onError: (err: unknown) => {
                      const msg = err instanceof Error ? err.message : String(err ?? "");
                      toast.error(msg || "Failed to accept invitation");
                    },
                  }
                );
              })}
              className="space-y-4"
            >
               <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Dr. Jane Doe" {...field} />
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Create Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Re-enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full bg-[#56bbe3] text-white hover:bg-[#56bbe3]/70" type="submit" disabled={accept.isPending}>
                {accept.isPending ? "Submitting..." : "Accept Invitation"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
