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
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { IconLoader2 } from "@tabler/icons-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

async function insertPost(content: string) {
  const supabase = createClient();

  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError) {
    console.error("Error getting user:", userError);
  }

  const { data: postData, error: postError } = await supabase
    .from("Post")
    .insert([{ creator: String(user?.user?.id), body: content }])
    .select()
    .single();

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
  images: z.array(z.instanceof(File)).optional(),
});

export default function CreatePost({ inFlow }: { inFlow?: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(-1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createClient();

    setLoading(true);
    setProgress(0);

    const post = await insertPost(values.content);

    if (!post) return;

    if (values.images) {
      setProgress(-1);

      const fakeInterval = setInterval(
        () => {
          setProgress((oldProgress) => {
            if (oldProgress >= 98) {
              clearInterval(fakeInterval);
              return 98;
            }

            return oldProgress + Math.floor(Math.random() * (12 - 8) + 8);
          });
        },
        Math.floor(Math.random() * (600 - 300) + 300),
      );

      const imagePromises = values.images.map((image, i) => {
        const storagePromise = supabase.storage
          .from("feed")
          .upload(`${post.id}/${i}_${image.name}`, image, {
            cacheControl: "3600",
            upsert: false,
          });

        return storagePromise;
      });

      const imageUploads = await Promise.all(imagePromises);

      for (const imageUpload of imageUploads) {
        const { data, error } = imageUpload;

        if (data) {
          await supabase.from("PostImage").insert([
            {
              post: post.id,
              image_url: data.path,
            },
          ]);
          console.log("Image uploaded successfully:", data);
        }

        if (error) {
          console.error("Error uploading image:", error);
        }
      }

      clearInterval(fakeInterval);

      setProgress(100);

      // fake time to simulate progress finish
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setDialogOpen(false);
    form.reset();
    setLoading(false);
    setProgress(-1);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger
        className={cn(
          !inFlow && "absolute bottom-4 right-4",
          "flex cursor-pointer items-center rounded-full border bg-primary/70 px-4 py-2 text-2xl font-bold text-primary-foreground shadow-md outline outline-primary-foreground transition-colors hover:bg-primary/90",
        )}
      >
        <Plus className="mr-2 size-8 cursor-pointer" />
        <p className="mr-2">New Post</p>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
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
            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {progress >= 0 && <Progress value={progress} className="my-4" />}

            <Button
              type="submit"
              className="h-20 w-full text-xl [&_svg]:size-10"
            >
              {(loading && <IconLoader2 className="animate-spin" />) ||
                "Create Post"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
