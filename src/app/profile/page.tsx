"use client";

import { useEffect, useState } from "react";
import { logout, db, storage } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useStore from "@/store";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

interface Post {
  id: string;
  title: string;
  description: string;
  images: string[];
  location: string;
  tags: string[];
  userId: string;
  createdAt: any;
}

export default function ProfilePage() {
  const { user, clearUser, initializeUser, isAuthenticated, setUser } =
    useStore((state) => ({
      user: state.user,
      clearUser: state.clearUser,
      initializeUser: state.initializeUser,
      isAuthenticated: state.isAuthenticated,
      setUser: state.setUser,
    }));
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    initializeUser();
    setLoading(false);
  }, [initializeUser]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (user) {
        const q = query(
          collection(db, "posts"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const userPosts: Post[] = querySnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Post)
        );
        setPosts(userPosts);
      }
    };

    fetchPosts();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    clearUser();
    router.push("/auth/login");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  console.log(user);

  return (
    <div className="ml-6 mt-6">
      <h1 className="text-xl">Profile</h1>
      <div>
        <p className="pt-4 pb-2">Hi, {user?.displayName}</p>
        <div className="">
          <div className="h-24 w-24 bg-gradient-to-bl from-sky-200 via-indigo-200 to-indigo-500 rounded-full border-4 border-indigo-500">
            <img
              src={user?.profilePicture || "/images/profile-placeholder.png"}
              alt="profile pic"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        </div>
        <p className="pt-2">Email: {user?.email}</p>

        <Link
          href="/profile/settings"
          className="mt-4 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Profile settings
        </Link>
        <Link
          href="/profile/create-post"
          className="mt-4 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Create a post
        </Link>
        <button
          onClick={handleLogout}
          className="mt-4 flex w-56 justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Log out
        </button>
      </div>
      {posts.length > 0 && (
        <div>
          <p className="text-3xl flex justify-center mb-1">Your posts</p>
          <p className="text-sm flex justify-center mb-4">click to edit</p>
        </div>
      )}

      <div className="flex space-x-4 justify-center">
        {posts.map((post) => (
          <Card
            key={post.id}
            id={post.id}
            title={post.title}
            description={post.description}
            imageUrl={
              post.images && post.images.length > 0
                ? post.images[0]
                : "/images/placeholder-image.webp"
            }
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const Card: React.FC<CardProps> = ({ id, title, description, imageUrl }) => {
  return (
    <Link href={`/profile/edit-post/${id}`}>
      <div className="da relative flex flex-col justify-center overflow-hidden bg-gray-50">
        <div className="absolute inset-0 bg-center dark:bg-black"></div>
        <div className="group relative m-0 flex h-72 w-96 rounded-xl shadow-xl ring-gray-900/5 sm:mx-auto sm:max-w-lg">
          <div className="z-10 h-full w-full overflow-hidden rounded-xl opacity-80 transition duration-300 ease-in-out group-hover:opacity-100 dark:opacity-70">
            <img
              src={imageUrl}
              className="animate-fade-in block h-full w-full scale-100 transform object-cover object-center opacity-100 transition duration-300 group-hover:scale-110"
              alt=""
            />
          </div>
          <div className="absolute bottom-0 z-20 m-0 pb-4 ps-4 transition duration-300 ease-in-out group-hover:-translate-y-1 group-hover:translate-x-3 group-hover:scale-110 bg-black/30 backdrop-blur-md w-full hover:bg-black/50">
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <h1 className="text-sm font-light text-gray-200">{description}</h1>
          </div>
        </div>
      </div>
    </Link>
  );
};
