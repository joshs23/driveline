import { createClient } from "../../../../utils/supabase/client";
import { useEffect, useState } from "react";



interface UserPageProps {
    username: string;
}

// get user details from supabase
const getUserDetails = async (username: string) => {
    // connect to Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
                            .from("UserProfile")
                            .select("id, username, display_name, profile_picture_url, banner_url")
                            .eq("username", username);
    if (error) {
        console.error("Error retrieving user details", error);
    }
    return data;
};

const UserPage: React.FC<UserPageProps> = ({username}) => {

    const [userDetails, setUserDetails] = useState<{
                                            id: number;
                                            username: string;
                                            display_name: string;
                                            profile_picture_url: string | null
                                            banner_url: string | null} [] | null 
                                            >(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            const data = await getUserDetails(username);
            setUserDetails(data || null);
            setLoading(false);
        };
            fetchData();
        }, []);
    
        if (loading) {
            return (
              <div className="flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-800">Loading profile...</p>
              </div>
            );
          }
        return (
            <div className="max-w-sm rounded overflow-hidden shadow-lg p-6 bg-white">
                {userDetails && (
                    <>
                        <p className="text-xl mb-2">Display Name: {userDetails[0].display_name}</p>
                        <p className="text-xl">Username: {username}</p>
                    </>
                )}
            </div>
        );
}

export default UserPage;