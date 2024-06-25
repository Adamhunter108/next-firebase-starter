"use client";

import { useEffect, useState } from "react";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  User as FirebaseUser,
  getAuth,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "@/store";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../../../firebase/firebaseConfig";

export default function ProfileSettingsPage() {
  const { user, initializeUser, setUser, isAuthenticated } = useStore(
    (state) => ({
      user: state.user,
      initializeUser: state.initializeUser,
      setUser: state.setUser,
      isAuthenticated: state.isAuthenticated,
    })
  );
  const router = useRouter();
  const [email, setEmail] = useState<string>(user?.email || "");
  const [username, setUsername] = useState<string>(user?.displayName || "");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
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

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        console.log("Updating profile...");
        console.log("Current user object:", currentUser);

        // Ensure user object is fully initialized
        if (!currentUser.displayName || !currentUser.email) {
          throw new Error("User object is not fully initialized.");
        }

        // Log user object properties
        console.log("User UID:", currentUser.uid);
        console.log("User Email:", currentUser.email);
        console.log("User Display Name:", currentUser.displayName);

        // Update display name
        if (username && currentUser.displayName !== username) {
          console.log("Updating display name...");
          await updateProfile(currentUser, { displayName: username });
        }

        // Update email
        if (email && currentUser.email !== email) {
          console.log("Updating email...");
          await updateEmail(currentUser, email);
        }

        // Update password
        if (password) {
          console.log("Updating password...");
          await updatePassword(currentUser, password);
        }

        // Update Zustand state with the latest user data
        setUser({
          ...currentUser,
          email: currentUser.email,
          displayName: currentUser.displayName,
        });

        setSuccess("Profile updated successfully.");
        setError(null);
      } catch (error) {
        setError("Failed to update profile. Please try again.");
        setSuccess(null);
        if (error instanceof Error) {
          console.error("Error updating profile:", error.message);
        } else {
          console.error("Error updating profile:", error);
        }
      }
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewProfilePicture(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (newProfilePicture && user) {
      setUploading(true);
      try {
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(profilePicRef, newProfilePicture);
        const downloadURL = await getDownloadURL(profilePicRef);

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            displayName: user.displayName,
            profilePicture: downloadURL,
          });
        } else {
          await updateDoc(userDocRef, {
            profilePicture: downloadURL,
          });
        }

        setUser({ ...user, profilePicture: downloadURL });
        setProfilePicture(downloadURL);
        setNewProfilePicture(null);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (profilePicture && user) {
      try {
        const profilePicRef = ref(storage, `profilePictures/${user.uid}`);
        await deleteObject(profilePicRef);

        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          profilePicture: null,
        });

        setProfilePicture(null);
        setUser({ ...user, profilePicture: null });
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  console.log(user);

  return (
    <div className="mx-6">
      <Link
        href="/profile/"
        className="m-6 flex w-56 justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        &#x25c0; Back to profile
      </Link>
      <h1 className="text-xl text-center">Profile Settings</h1>
      <p className="text-center mb-2">
        hey {user?.displayName}, update your profile deets here
      </p>

      <div className="mt-4 flex justify-center rounded-lg">
        <div className="text-center">
          <div className="flex justify-center text-sm leading-6 text-gray-600">
            <label
              htmlFor="profilePicture"
              className="cursor-pointer rounded-full bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 border-4 border-indigo-500"
            >
              <div className="flex justify-center">
                <div className="h-24 w-24 bg-gradient-to-bl from-sky-200 via-indigo-200 to-indigo-500 rounded-full">
                  <img
                    src={profilePicture || "/images/profile-placeholder.png"}
                    alt="profile pic"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                className="sr-only"
                onChange={handleProfilePictureChange}
              />
            </label>
          </div>
          {!profilePicture && (
            <p className="text-slate-300 text-xs mt-1">
              Click profile pic to upload your own
            </p>
          )}
          {newProfilePicture && (
            <button
              onClick={handleProfilePictureUpload}
              disabled={uploading}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {uploading ? "Uploading..." : "Upload Profile Picture"}
            </button>
          )}
          {profilePicture && (
            <div>
              <p className="text-slate-300 text-xs mt-1">
                Click profile pic to replace with a new image
              </p>
              <button
                onClick={handleDeleteProfilePicture}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-500"
              >
                Delete Profile Picture
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <div className="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={user.email || ""}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder={user.displayName || ""}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
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
