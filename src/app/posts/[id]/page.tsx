"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";

interface Post {
  id: string;
  title: string;
  description: string;
  images: string[];
  location: string;
  tags: string[];
  userId: string;
  createdAt: any;
  price: string;
}

interface User {
  displayName: string;
  profilePicture?: string | null;
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postDoc = await getDoc(doc(db, "posts", id as string));
        if (postDoc.exists()) {
          const postData = postDoc.data() as Post;
          setPost({
            ...postData,
            id: postDoc.id,
          });

          const userDoc = await getDoc(doc(db, "users", postData.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("User data:", userData);

            setUser({
              displayName: userData?.displayName,
              profilePicture: userData?.profilePicture || null,
            });
          } else {
            console.error(
              `No user document found for userId: ${postData.userId}`
            );
          }
        } else {
          console.error(`No post document found for id: ${id}`);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!post) {
    return <p>No post found.</p>;
  }

  console.log("Post data:", post);
  console.log("User data:", user);

  return (
    <div className="mx-6 mt-6">
      <Link
        href="/posts"
        className="mb-6 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        &#x25c0; Back to all posts
      </Link>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <div className="flex items-center mt-4">
        {user?.profilePicture && (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-4"
          />
        )}
        <p className="text-lg font-semibold">{user?.displayName}</p>
      </div>
      <div className="flex mt-4">
        {post.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={post.title}
            className="w-1/2 h-auto"
          />
        ))}
      </div>
      <p className="mt-4">{post.description}</p>
      <p className="mt-2">Location: {post.location}</p>
      <p className="mt-2">Price: ${post.price}</p>
      <div className="flex flex-wrap mt-2">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="mr-2 mb-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full px-2 py-1"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
