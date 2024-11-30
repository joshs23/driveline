'use client';

import CreateVehicle from "./createvehicle";
import MyVehicles from "./myvehicles";

export default function NewPostPage() {
    return (
        <div className="w-full flex-auto justify-center items-center min-h-screen bg-gray-100">
            <MyVehicles />
            <CreateVehicle />
        </div>
    );
}