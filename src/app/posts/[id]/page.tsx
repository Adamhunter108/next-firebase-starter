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
  profilePicture?: string;
  username?: string; // Added username to the interface
}

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      try {
        const postDoc = await getDoc(doc(db, "posts", id as string)); // Cast id to string
        if (postDoc.exists()) {
          const postData = postDoc.data() as Post;
          const userDoc = await getDoc(doc(db, "users", postData.userId));
          const userData = userDoc.data();
          setPost({
            ...postData,
            id: postDoc.id,
            profilePicture: userData?.profilePicture || null,
            username: userData?.displayName || "Unknown User", // Added username
          });
        } else {
          console.error("No such document!");
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

  console.log(post);

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
        {post.profilePicture && (
          <img
            src={post.profilePicture}
            alt="Profile"
            className="w-10 h-10 rounded-full mr-4"
          />
        )}
        <p className="text-lg font-semibold">{post.username}</p>
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
