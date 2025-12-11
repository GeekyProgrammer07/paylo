"use client";

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
import axios from "axios";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

type SignupForm = {
  name: string;
  phone: string;
  email: string;
  password: string;
  remember?: boolean;
};

export default function Signup() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupForm>({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      remember: false,
    },
    mode: "onTouched",
  });

  const { handleSubmit, control, setError, clearErrors, formState } = form;
  const { isSubmitting } = formState;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="py-8 px-8 w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-blue-600">
            Create Account
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            Sign up to get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(async (data) => {
                clearErrors();
                try {
                  const res = await axios.post("/api/signup", {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    password: data.password,
                  });

                  if (res.data?.success) {
                    router.push("/signin");
                  } else {
                    // fallback error handling
                    setError("root", { message: res.data?.error || "Signup failed" });
                  }
                } catch (err: unknown) {
                  if (axios.isAxiosError(err)) {
                    const message = (err.response?.data as any)?.error || "Signup failed";
                    setError("root", { message });
                  } else {
                    setError("root", { message: "Signup failed" });
                  }
                }
              })}
              noValidate
            >
              <FormField
                control={control}
                name="name"
                rules={{ required: "Name is required" }}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="pb-2">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="phone"
                rules={{
                  required: "Phone is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter a valid 10-digit phone number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="pt-4 pb-1">Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="9999999999" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="pt-4 pb-1">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="johndoe@example.com"
                        type="email"
                        {...field}
                        inputMode="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="pt-4 pb-1">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          {...field}
                          aria-label="Password"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-pressed={showPassword}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.formState.errors.root?.message ? (
                <p className="text-sm text-red-500 text-center mt-2">
                  {form.formState.errors.root.message}
                </p>
              ) : null}

              <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Sign up"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="text-center text-sm">
          Already have an account?
          <Link href="/signin" className="text-blue-600 font-medium hover:underline ml-1">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
