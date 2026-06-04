import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";

export default function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user); // Access current user
  const defaultImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyZkgPExp3GvoGr01uTL2X32Z83V2vd8P2FQ&s";

  const [avatar, setAvatar] = useState(currentUser?.avatar || defaultImage); // Temporary avatar state
  const [successMessage, setSuccessMessage] = useState(""); // Success message
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false); // Change to boolean
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // Make sure the avatar is set correctly when currentUser changes
    if (currentUser?.avatar) {
      setAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSuccessMessage(""); // Reset success message

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "Mern_Project");
    data.append("cloud_name", "dyuvpsbmq");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dyuvpsbmq/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const uploadedImage = await res.json();
      console.log("Uploaded Image URL:", uploadedImage.url);

      // Update the avatar state with the new URL
      setAvatar(uploadedImage.url || defaultImage);

      // (Optional) Send the new avatar URL to the backend
      await fetch("/api/update-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser._id,
          avatar: uploadedImage.url,
        }),
      });

      // Show success message
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 5000);
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart()); // Dispatch sign-out start action
      const res = await fetch("/api/auth/signout");
      const data = await res.json();

      if (data.success === false) {
        dispatch(signOutUserFailure(data.message)); // Dispatch failure if the response is not successful
        return;
      }

      dispatch(signOutUserSuccess(data)); // Dispatch success action
    } catch (error) {
      dispatch(signOutUserFailure(error.message)); // Dispatch failure if an error occurs
    }
  };

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId)=>{
    try {
      const res= await fetch(`/api/listing/delete/${listingId}`,{
        method:'DELETE',

      });
      const data =await res.json();
      if(data.success === false){
        console.log(data.message);
        return ;
      }
      
      setUserListings((prev)=>prev.filter((listing)=> listing._id != listingId));
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Hidden file input */}
        <input
          onChange={handleFileUpload}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />

        {/* Profile Image */}
        <img
          onClick={() => fileRef.current.click()}
          src={avatar} // Use the local state to show the updated avatar
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />

        {/* Success Message */}
        {successMessage && (
          <p className="text-green-600 text-center font-medium">
            {successMessage}
          </p>
        )}

        {/* User Details */}
        <input
          type="text"
          placeholder="username"
          id="username"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.username}
          onChange={handleChange}
          value={formData.username}
        />
        <input
          type="email"
          placeholder="email"
          id="email"
          className="border p-3 rounded-lg"
          defaultValue={currentUser.email}
          onChange={handleChange}
          value={formData.email}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        {/* Update Button */}
        <button
          className="bg bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
          disabled={loading} // Disable while loading
        >
          {loading ? "Updating..." : "Update"}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={"/create-listing"}
        >
          Create Listing
        </Link>
      </form>

      {/* Footer Actions */}
      <div className="flex justify-between mt-5">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign Out
        </span>
      </div>

      {/* Success Message after Update */}
      {updateSuccess && (
        <p className="text-green-700 mt-5">User Updated Successfully</p>
      )}
      <button onClick={handleShowListings} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>

          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imagesUrls[0]}
                  alt="listing cover"
                  className="h-16 w-16 object-contain"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold  hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col item-center">
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className="text-red-700 uppercase"
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className="text-green-700 uppercase">Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
