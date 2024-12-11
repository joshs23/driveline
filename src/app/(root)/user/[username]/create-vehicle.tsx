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

// using the values from the form we insert a new vehicle into the vehicle table
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

// schema for the new vehicle form
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

  // Handles the form submission by passing the form values to the InsertVehicle function
  // and resetting the form.
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    insertVehicle(values);
    form.reset();
    window.location.reload(); // Just refreshing for now instead of subscribing to changes.
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {/* Button to open the dialog */}
      <DialogTrigger asChild>
        <Plus className="size-9 text-red-400 cursor-pointer rounded-full bg-primary/20 p-2 text-primary-foreground shadow-md transition-colors hover:bg-primary/10" />
      </DialogTrigger>
      {/* Dialog Content */}
      <DialogContent className="w-1/3">
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
            <Button
              type="submit"
              className="w-full transition-colors hover:bg-primary/60"
            >
              Submit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}