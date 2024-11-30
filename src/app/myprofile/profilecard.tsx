import React from 'react';

interface ProfileCardProps {
    display_name: string;
    username: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ display_name, username }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg p-6 bg-white">
            <h1 className="text-3xl font-bold mb-4">My Profile</h1>
            <p className="text-xl mb-2">Display Name: {display_name}</p>
            <p className="text-xl">Username: {username}</p>
        </div>
    );
};

export default ProfileCard;