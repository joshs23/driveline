"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Must be a valid email address." }),
  password: z
    .object({
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
      confirm: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long." }),
    })
    .refine((data) => data.password === data.confirm, {
      message: "Passwords don't match",
      path: ["confirm"],
    }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long." })
    .max(20, { message: "Username cannot be more than 20 characters long." }),
  displayName: z
    .string()
    .min(3, { message: "Display name must be at least 3 characters long." })
    .max(20, {
      message: "Display name cannot be more than 20 characters long.",
    }),
});

export default function SignUp() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: { password: "", confirm: "" },
      username: "",
      displayName: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password.password,
      options: {
        data: {
          username: values.username,
          display_name: values.displayName,
        },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      redirect("/");
      setError(undefined);
      redirect("/");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <Card className="mx-auto max-w-[40rem]">
            <CardHeader>
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Create an account to start posting on Driveline!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {error && <p className="text-red-500">{error}</p>}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>

                      <FormControl>
                        <Input placeholder="m@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password.password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormDescription>
                        Must be at least 8 characters long.
                      </FormDescription>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password.confirm"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Password (Confirm)</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormDescription>
                        A unique value to identify your account on Driveline.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormDescription>
                        A public facing value of which will be used to refer to
                        you on Driveline.
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  {(loading && (
                    <LoaderCircle
                      size={32}
                      strokeWidth={2.75}
                      className="animate-spin"
                    />
                  )) ||
                    "Sign Up"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
