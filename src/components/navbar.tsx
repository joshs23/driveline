import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import SignOut from "@/app/(root)/signout";

const routes = [
  { name: "Home", href: "/" },
  { name: "Communities", href: "/communities" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Following", href: "/following" },
  { name: "New Post", href: "/newpost" },
];

async function UserButton() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (!data?.user) {
    return <p>No user found</p>;
  }

  const { data: profileData, error: profileError } = await supabase
    .from("UserProfile")
    .select("*")
    .eq("user_id", data?.user?.id) // Assuming the `id` in the profiles table matches the user's ID
    .single(); // `single()` assumes only one profile exists per user

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return <p>Error fetching profile data</p>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md border px-4 py-2 shadow-lg">
        <Avatar className="border-2 shadow-md">
          <AvatarImage
            src={profileData.profile_picture_url as string | undefined}
            alt="Avatar"
          />
          <AvatarFallback>{profileData.display_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-left">
          <p className="font-bold">{profileData.display_name}</p>
          <p className="text-sm">@{profileData.username}</p>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href={`/user/${profileData.username}`}>View Profile</Link>
        </DropdownMenuItem>
        <SignOut>
          <DropdownMenuItem className="cursor-pointer">
            Sign Out
          </DropdownMenuItem>
        </SignOut>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default async function Navbar() {
  return (
    <nav className="flex flex-col items-center justify-between gap-4 border-r-2 p-4 shadow-xl">
      <div className="flex min-w-64 flex-col items-center gap-4">
        <div className="w-56 p-2">
          <Image
            src="/driveline.png"
            width={806}
            height={624}
            alt="Driveline Logo"
          />
        </div>

        <Separator className="mx-auto h-[2px] w-[60%] rounded-lg bg-primary shadow-xl" />

        <div className="flex w-full flex-col">
          {routes.map((route) => (
            <Link
              key={route.name}
              href={route.href}
              className="w-full rounded-sm py-2 text-center text-xl font-medium transition-all hover:bg-primary hover:text-primary-foreground"
            >
              {route.name}
            </Link>
          ))}
        </div>

        <Separator className="mx-auto h-[2px] w-[60%] rounded-lg bg-primary shadow-xl" />
      </div>

      <Suspense
        fallback={
          <div className="flex w-full items-center gap-2 rounded-md border px-4 py-2 shadow-lg">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-3 w-[80%]" />
              <Skeleton className="h-3 w-[70%]" />
            </div>
          </div>
        }
      >
        <UserButton />
      </Suspense>
    </nav>
  );
}
