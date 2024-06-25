"use client";

import { useState } from "react";
import Link from "next/link";
import useStore from "@/store";
import { useRouter } from "next/navigation";
import { db, storage } from "@/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, Timestamp } from "firebase/firestore";

export default function CreatePostPage() {
  const { user } = useStore((state) => ({
    user: state.user,
  }));
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imageFileNames, setImageFileNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  //   const [latitude, setLatitude] = useState<number | null>(null);
  //   const [longitude, setLongitude] = useState<number | null>(null);

  const [tagSelections, setTagSelections] = useState<string[]>([]);
  const tagOptions = [
    "Option 1",
    "Option 2",
    "Option 3",
    "Option 4",
    "Option 5",
    "Option 6",
    "Option 7",
    "Option 8",
    "Option 9",
    "Option 10",
  ];

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTag = e.target.value;
    if (
      !tagSelections.includes(selectedTag) &&
      selectedTag !== "Select all that apply"
    ) {
      setTagSelections((prevTags) => [...prevTags, selectedTag]);
    }
    // Reset the select value to "Select all that apply"
    e.target.value = "Select all that apply";
  };

  const removeTag = (tag: string) => {
    setTagSelections((prevTags) => prevTags.filter((t) => t !== tag));
  };

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to create a post.");
      return;
    }

    try {
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const imageRef = ref(storage, `posts/${user.uid}/${image.name}`);
          const snapshot = await uploadBytes(imageRef, image);
          const downloadURL = await getDownloadURL(snapshot.ref);
          imageUrls.push(downloadURL);
        }
      }

      const post = {
        title,
        description,
        price,
        tags: tagSelections,
        images: imageUrls,
        location,
        userId: user.uid,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "posts"), post);

      setSuccess("Post created successfully.");
      setError(null);
      // Reset form fields
      setTitle("");
      setDescription("");
      setPrice("");
      setTagSelections([]);
      setImages([]);
      setImageFileNames([]);
      setLocation("");
      //   router.push("/profile"); // Redirect to the profile or posts page
    } catch (error) {
      setError("Failed to create post. Please try again.");
      setSuccess(null);
      console.error("Error creating post:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setImages((prevImages) => [...prevImages, ...newFiles]);
      const newFileNames = newFiles.map((file) => file.name);
      setImageFileNames((prevNames) => [...prevNames, ...newFileNames]);
    }
  };

  //   console.log(imageFileNames);
  //   console.log(images);

  return (
    <div className="mx-6">
      <Link
        href="/profile/"
        className="m-6 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        &#x25c0; Back to profile
      </Link>
      <h1 className="text-xl text-center">Create a post</h1>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <p className="text-gray-700 mb-2">Make a post!</p>
          <form className="space-y-6" onSubmit={handleCreatePost}>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Title
              </label>
              <div className="mt-2">
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Your new post's title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Description
              </label>
              <div className="mt-2">
                <textarea
                  rows={4}
                  id="description"
                  name="description"
                  placeholder="Description or body of your post goes here."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Price
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  name="price"
                  id="price"
                  className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="4.20"
                  aria-describedby="price-currency"
                  value={price}
                  //   required
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Location
              </label>
              <div className="mt-2">
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="New York City"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <label
              htmlFor="images"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Upload images
            </label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              <div className="text-center">
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="images"
                    className="cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                  >
                    <div className="flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="mx-auto h-12 w-12 hover:fill-indigo-500"
                        aria-hidden="true"
                      >
                        <path d="M19.5 12c-2.483 0-4.5 2.015-4.5 4.5s2.017 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.017-4.5-4.5-4.5zm2.5 5h-2v2h-1v-2h-2v-1h2v-2h1v2h2v1zm-18 0l4-5.96 2.48 1.96 2.52-4 1.853 2.964c-1.271 1.303-1.977 3.089-1.827 5.036h-9.026zm10.82 4h-14.82v-18h22v7.501c-.623-.261-1.297-.422-2-.476v-5.025h-18v14h11.502c.312.749.765 1.424 1.318 2zm-9.32-11c-.828 0-1.5-.671-1.5-1.5 0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5c0 .829-.672 1.5-1.5 1.5z" />
                      </svg>
                    </div>
                    <p className="text-sm leading-5 text-gray-600 hover:text-indigo-500">
                      Click here or drag and drop
                    </p>
                    <input
                      id="images"
                      name="images"
                      type="file"
                      className="sr-only"
                      multiple={true}
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                <p className="text-xs leading-5 text-gray-600">
                  PNG or JPG up to 10MB
                </p>
              </div>
            </div>
            {imageFileNames.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                <h4 className="font-semibold">Selected files:</h4>
                <ul>
                  {imageFileNames.map((fileName, index) => (
                    <li key={index}>{fileName}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Tags
              </label>
              {tagSelections.length > 0 && (
                <p className="text-sm text-gray-400">Click tag to remove</p>
              )}
              <div className="mt-2 space-x-2">
                {tagSelections.map((selection) => (
                  <button
                    key={selection}
                    type="button"
                    onClick={() => removeTag(selection)}
                    className="mt-1 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-100 hover:ring-red-500 hover:text-red-500"
                  >
                    {selection}
                  </button>
                ))}
              </div>
              <select
                id="tags"
                name="tags"
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                defaultValue="Select all that apply"
                onChange={handleTagChange}
              >
                <option disabled>Select all that apply</option>
                {tagOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Create post
              </button>
            </div>
            {success && <p className="text-green-500">{success}</p>}
            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
