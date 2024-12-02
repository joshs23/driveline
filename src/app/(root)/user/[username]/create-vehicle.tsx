"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { LoaderCircle, Plus } from "lucide-react";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
  }
  return data;
}

async function insertVehicle(vehicle: z.infer<typeof formSchema>) {
  const supabase = createClient();
  const user = await getUser();
  const { data, error } = await supabase
    .from("Vehicle")
    .insert([
      {
        owner: user?.user?.id,
        make: vehicle.make,
        model: vehicle.model,
        year: Number(vehicle.year),
        color: vehicle.color,
      },
    ])
    .select();

  if (error) console.error("Error inserting Vehicle:", error);

  return data;
}

const formSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z
    .string()
    .length(4, { message: "Invalid year, must be of format: YYYY" })
    .refine((val) => !isNaN(Number(val)), { message: "Invalid year" }),
  color: z.string().optional(),
});

export default function CreateVehicle() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: "",
      model: "",
      year: "",
      color: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    insertVehicle(values);
    form.reset();
    window.location.reload(); // Just refreshing for now instead of subscribing to changes.
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Plus className="size-10 cursor-pointer rounded-full bg-primary p-2 text-primary-foreground shadow-md transition-colors hover:bg-primary/90" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-2xl">
            Add a New Vehicle
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Make Field */}
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Make<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Dodge" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Model Field */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Model<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Charger" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Year Field */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Year<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2018"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Color Field (Optional) */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="Blue" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" className="w-full transition-colors">
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
