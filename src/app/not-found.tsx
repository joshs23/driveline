import Navbar from "@/components/navbar";
import RelationshipBar from "@/components/relationship-bar";
import { Button } from "@/components/ui/button";
import { House } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navbar />

      <div className="flex size-full min-h-screen grow flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border p-8 shadow-lg">
          <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight">
            404 - Page Not Found
          </h1>

          <Link href="/">
            <Button>
              <House /> Go Home
            </Button>
          </Link>
        </div>
      </div>
      <RelationshipBar />
    </>
  );
}
