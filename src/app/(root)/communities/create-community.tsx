"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";

// Using the values from the form we insert a new row into the community table
async function insertCommunity(community: z.infer<typeof formSchema>) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Community")
    .insert([
      {
        name: community.name,
        description: community.description,
      },
    ])
    .select();

  if (error) console.error("Error inserting Community:", error);

  return data;
}

// Form schema for creating a community
const formSchema = z.object({
  name: z.string(),
  description: z.string(),
});

// CreateCommunity component
export default function CreateCommunity() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Handles the form submission by passing the form values to the insertCommunity function
  // and resetting the form.
  function onSubmit(values: z.infer<typeof formSchema>) {
    insertCommunity(values);
    form.reset();
    window.location.reload(); // Just refreshing to show changes.
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* Button to open the dialog */}
      <DialogTrigger asChild>
        <Button className="size-9 rounded-full p-2 shadow-md transition-colors">
          <Plus />
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="w-1/3">
        <DialogHeader>
          <DialogTitle className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">
            Make a New Community
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Community Name" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Discription Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of the community."
                      required
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
