"use client";

import { useEffect, useState } from "react";
import { logout } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useStore from "@/store";

export default function ProfilePage() {
  const { user, clearUser, initializeUser, isAuthenticated } = useStore(
    (state) => ({
      user: state.user,
      clearUser: state.clearUser,
      initializeUser: state.initializeUser,
      isAuthenticated: state.isAuthenticated,
    })
  );
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
    setLoading(false);
  }, [initializeUser]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    await logout();
    clearUser();
    router.push("/auth/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="ml-6 mt-6">
      <h1 className="text-xl">Profile</h1>
      <div>
        <p>Welcome, {user?.displayName}</p>
        <p>Email: {user?.email}</p>
        <Link
          href="/profile/settings"
          className="mt-4 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Update profile
        </Link>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-56 justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
