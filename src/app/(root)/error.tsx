"use client";
import { Button } from "@/components/ui/button";
import { CircleAlert } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex size-full min-h-screen grow flex-col items-center justify-center gap-2">
      <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-8 shadow-lg">
        <CircleAlert size={64} />
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
          An Error Occured
        </h1>

        <Button onClick={() => reset()}>Reload</Button>
      </div>
    </div>
  );
}
