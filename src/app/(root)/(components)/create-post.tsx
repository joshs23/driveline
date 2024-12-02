"use client";
import { createClient } from "@/utils/supabase/client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { LoaderCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

async function insertPost(content: string) {
  const supabase = createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Error getting user:", userError);
  }

  const { data: postData, error: postError } = await supabase
    .from("Post")
    .insert([{ creator: String(user?.user?.id), body: content }])
    .select();

  if (postError) {
    console.error("Error inserting post: ", postError);
  }

  return postData;
}

const formSchema = z.object({
  content: z
    .string()
    .min(2, {
      message: "Your post must be at least 2 characters long.",
    })
    .max(240, {
      message: "Your post cannot be more than 240 characters long.",
    }),
});

export default function CreatePost() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(values);
    await insertPost(values.content);

    setDialogOpen(false);

    form.reset();

    setLoading(false);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <Plus className="absolute bottom-4 right-4 size-12 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-colors hover:bg-primary/90" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl">
            Create a New Post
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="What's on your mind?" {...field} />
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
                "Create Post"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
