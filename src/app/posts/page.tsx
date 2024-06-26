"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc as firestoreDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

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
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
        } else {
          const postsData: Post[] = await Promise.all(
            querySnapshot.docs.map(async (postDoc) => {
              const postData = postDoc.data() as Post;

              if (postData.userId) {
                try {
                  const userDocRef = firestoreDoc(db, "users", postData.userId);
                  const userDoc = await getDoc(userDocRef);
                  const userData = userDoc.data() || {};

                  return {
                    ...postData,
                    id: postDoc.id,
                    profilePicture: userData.profilePicture || null,
                  };
                } catch (userError) {
                  console.error("Error fetching user data:", userError);
                  return {
                    ...postData,
                    id: postDoc.id,
                    profilePicture: null,
                  };
                }
              } else {
                console.warn("Post missing userId:", postData);
                return {
                  ...postData,
                  id: postDoc.id,
                  profilePicture: null,
                };
              }
            })
          );
          setPosts(postsData);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="mx-6 mt-6">
      <h1 className="text-xl text-center">Posts Feed</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            location={post.location}
            tags={post.tags}
            price={post.price}
            profilePicture={post.profilePicture}
          />
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  location: string;
  tags: string[];
  price: string;
  profilePicture?: string | null;
}

const Card: React.FC<CardProps> = ({
  id,
  title,
  description,
  imageUrl,
  location,
  tags,
  price,
  profilePicture,
}) => {
  return (
    <Link href={`/posts/${id}`}>
      <div className="relative flex flex-col justify-center overflow-hidden bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover"
          />
          {profilePicture && (
            <img
              src={profilePicture}
              alt="Profile"
              className="absolute top-2 left-2 w-10 h-10 rounded-full border-2 border-white"
            />
          )}
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600">Description: {description}</p>
          <p className="text-gray-600">Location: {location}</p>
          <p className="text-gray-600">Price: ${price}</p>
          <div className="flex flex-wrap mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="mr-2 mb-2 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};
