import Feed from "./feed";

export default function Home() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start bg-black w-full min-h-screen">
      <Feed />
    </main>
  );
}
