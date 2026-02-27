import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginMutation } from "@/api-integration/mutations/auth";
import { useIsAuthenticated, useUser } from "@/api-integration/redux/selectors";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import type { LoginSchemaType } from "@/lib/validations/auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const login = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loading = login.isPending;

  const onSubmit = async (data: LoginSchemaType) => {
    login.mutate(
      { email: data.email, password: data.password },
      {
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err ?? "");
          toast.error(msg || "Login failed");
        },
      }
    );
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      const to = (location.state as any)?.from?.pathname ?? "/";
      const role = user.roles?.[0];
      if (role === "super_admin") navigate("/mrs-admin");
      else if (role === "doctor") navigate("/doctors-dashboard");
      else if (role === "nurse") navigate("/nurses-dashboard");
      else if (role === "recording") navigate("/recordings");
      else navigate(to);
    }
  }, [isAuthenticated, user, navigate, location.state]);

  return (
    <div className="max-h-screen h-full w-full flex items-center justify-center overflow-y-none">
      <div className=" w-full h-full bg-transparent overflow-hidden">
        <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZG9jdG9yfGVufDB8fDB8fHww" alt="o" className="w-full h-screen bg-cover"/>
      </div>
      <div className="absolute bg-black/50 px-4 backdrop-blur-lg h-full w-full flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 rounded-lg backdrop-blur-xl border border-white/20 shadow-md">
          <CardHeader className="mb-3">
            <CardTitle className="text-2xl font-semibold text-[#56bbe3]">
              Welcome back
            </CardTitle>
            <p className="text-sm text-gray-400">
              Enter your credentials to access your account
            </p>
          </CardHeader>

          <CardContent className="">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5"
              >
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@email.com"
                          className="bg-white/10 border border-gray-400 text-gray-400 placeholder:text-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            className="bg-white/10 border border-gray-400 text-gray-400 placeholder:text-gray-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full bg-[#56bbe3] text-white hover:bg-[#56bbe3]/50 font-medium mt-5"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>


              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
