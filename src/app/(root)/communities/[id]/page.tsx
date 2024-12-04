"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Feed from "@/app/(root)/feed";

interface Community {
  id: number;
  name: string;
  description: string | null;
}

interface Member {
  username: string;
  display_name: string;
  profile_picture_url: string | null;
}

interface Post {
  id: number;
  body: string;
  community: number | null;
  created_at: string;
  creator: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [amMember, setAmMember] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<Member[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [memberIds, setMemberIds] = useState<string[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      const supabase = await createClient();

      const { data: communityData } = await supabase
        .from("Community")
        .select("*")
        .eq("id", id)
        .single();

      if (!communityData) {
        return notFound();
      }

      const { data: memberIds } = await supabase
        .from("CommunityMember")
        .select("user_id")
        .eq("community_id", id);

      const { data: membersData } = await supabase
        .from("UserProfile")
        .select("*")
        .in("user_id", memberIds?.map((member) => member.user_id) || []);

      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: userMembership } = await supabase
        .from("CommunityMember")
        .select("*")
        .eq("community_id", id)
        .eq("user_id", userId ?? "")
        .single();

      setCommunity(communityData);
      setMembers(membersData || []);
      setAmMember(!!userMembership);

      const { data: profiles } = await supabase
        .from("UserProfile")
        .select("*")
        .in("user_id", membersData?.map((member) => member.user_id) || []);
      setMemberProfiles(profiles || []);
      setMemberIds(membersData?.map((member) => member.user_id) || []);
    };

    fetchData();
  }, [params]);

  useEffect(() => {
    const supabase = createClient();
    async function getData() {
      const { data, error } = await supabase
        .from("Post")
        .select("*, PostImage(*), Comment(*)")
        .in("creator", memberIds)
        .order("id", { ascending: false });
      if (error) {
        console.error(error);
      }
      const formattedData =
        data?.map((post) => ({
          ...post,
          Comment: Array.isArray(post.Comment) ? post.Comment : [],
          content: post.body,
          author: post.creator,
          createdAt: post.created_at,
        })) || [];
      setPosts(formattedData);
    }
    getData();
  }, [memberIds]);

  const handleJoin = async () => {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId || !community?.id) return;

    const { data } = await supabase
      .from("CommunityMember")
      .insert([{ community_id: Number(community.id), user_id: userId }]);

    window.location.reload();
  };

  const handleLeave = async () => {
    const supabase = await createClient();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId || !community?.id) return;

    const { data } = await supabase
      .from("CommunityMember")
      .delete()
      .eq("community_id", Number(community.id))
      .eq("user_id", userId);

    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 ">
      <div className="rounded-lg p-6">
        <div className="flex items-center justify-between border-4 p-4">
          {/* Community Header */}
          <div>
            <h1 className="mb-4 text-3xl font-bold text-primary">
              {community?.name}
            </h1>
            <p className="mb-6">{community?.description}</p>
          </div>
          {/* Actions Section */}
          <div className="p-6">
            {/* Join/Leave buttons */}
            {!amMember ? (
              <Button
                onClick={handleJoin}
                className="rounded-md bg-primary px-4 text-white"
              >
                Join Community
              </Button>
            ) : (
              <Button
                onClick={handleLeave}
                className="rounded-md bg-primary px-4 text-white"
              >
                Leave Community
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-8">
          {/* Feed */}
          <div className="mt-4 items-center justify-between border-4 p-4 w-full">
            <h1 className="px-6 pt-4 text-3xl font-bold">Feed</h1>
            {posts.length > 0 ? <Feed initalPosts={posts} 
                                      feedUserId={memberIds}
                                      disableCreatePost/> : 
                                      <p className="text-center">There are no posts yet. Create one!</p>}
          </div>
          {/* Members Section */}
          <div className="mt-4 items-center justify-between border-4 p-4 w-1/4">
            <h2 className="mb-3 p-4 text-2xl font-semibold">Members</h2>
            {(members.length ?? 0) <= 0 ? (
              <p className="italic">There are no members in this community.</p>
            ) : (
              <ul className="space-y-2">
                {memberProfiles?.map(
                  (memberProfile: {
                    username: string;
                    display_name: string;
                    profile_picture_url: string | null;
                  }) => (
                    <li
                      key={memberProfile.username}
                      className="items-center rounded-md bg-card p-2 shadow-lg transition-shadow duration-300 hover:bg-primary"
                    >
                      <Link href={`/user/${memberProfile.username}`}>
                        <div className="flex">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage
                              src={
                                memberProfile.profile_picture_url as
                                  | string
                                  | undefined
                              }
                              alt={`${memberProfile.display_name}'s avatar`}
                              className="rounded-full"
                            />
                            <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full font-bold">
                              {memberProfile.display_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="px-4">
                            <p className="text-lg font-medium">
                              {memberProfile.display_name}
                            </p>
                            <p className="text-sm">@{memberProfile.username}</p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
