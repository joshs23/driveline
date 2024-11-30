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

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

// Registration will all happen on a different route called /signup, we don't need both of these flows to be handled in the same place, for simplicty
/* const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    setError(error.message);
  } else if (authData.user) {
    const { error: profileError } = await supabase.from("UserProfile").insert([
      {
        user_id: authData.user
          .id as `${string}-${string}-${string}-${string}-${string}`,
        username,
        display_name: displayName,
      },
    ]);
    if (profileError) {
      setError(profileError.message);
    } else {
      setError(null);
      //onLoginSuccess();
    }
  }
}; */

export default function Login() {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      setError(undefined);
      redirect("/");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mx-auto max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="#" className="underline">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
