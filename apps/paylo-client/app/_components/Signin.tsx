"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

export default function Signin() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      phone: "",
      password: "",
      remember: false,
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="py-13 px-8 w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-blue-600">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (data) => {
                form.clearErrors();

                const result = await signIn("credentials", {
                  phone: data.phone,
                  password: data.password,
                  redirect: false,
                  callbackUrl: "/dashboard",
                });

                if (result?.error) {
                  form.setError("password", {
                    message: "Invalid phone or password",
                  });
                  form.setError("root", {
                    message: "Invalid phone or password",
                  });
                  return;
                }

                router.push(result?.url ?? "/dashboard");
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        type="tel"
                        {...field}
                      />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm cursor-pointer"
                      >
                        Remember me
                      </label>
                    </div>
                  )}
                />
                <Link
                  href="#"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {form.formState.errors.root?.message ? (
                <p className="text-sm text-red-500 text-center">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center text-sm">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-600 font-medium hover:underline ml-1"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
