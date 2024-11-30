"use client";
import { useEffect, useState } from "react";
import { Database } from "@/database.types";
import { createClient } from "@/utils/supabase/client";

async function getUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error getting user:", error);
  }
  return data;
}

async function insertPost(content: string) {
  const supabase = await createClient();
  const user = await getUser();
  const { data, error } = await supabase
    .from('Post')
    .insert([
      { creator: String(user?.user?.id), body: content },
    ])
    .select();
  if (error) {
    console.error("Error inserting post:", error);
  }
  return data;
}

export default function CreatePost() {
  const [content, setContent] = useState("");

  // handle submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // insert the row
    insertPost(content);
    // Reset the input after submission
    setContent("");
  };

  return (
<div className="flex min-h-screen items-center justify-center bg-gray-100 w-full">
  <form
    onSubmit={handleSubmit}
    className="rounded-lg bg-white p-6 shadow-md w-full max-w-2xl"
  >
    <h1 className="mb-4 text-2xl font-bold text-gray-800">
      Create a New Post
    </h1>
    <div className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="h-64 w-full resize-none rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>
    <button
      type="submit"
      className="w-full rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600"
    >
      Submit
    </button>
  </form>
</div>
  );
}
