import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <LoaderCircle size={32} strokeWidth={2.75} className="animate-spin" />
    </div>
  );
}
