import axios from "axios";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setAlumni } from "../../redux/alumni";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { CometChatUIKit } from "@cometchat/chat-uikit-react";

export default function AlumniLoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCometChatLogout = async () => {
    try {
      const loggedInUser = await CometChat.getLoggedinUser();
      if (loggedInUser) {
        await CometChat.logout();
      }
    } catch (error) {
      console.log("CometChat logout error:", error);
    }
  };

  const AlumniLogin = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/alumni/login`,
        formData
      );

      if (response.data.success) {
        Cookies.set("token", response.data.data, { expires: 1 });

        const UID = response.data.user._id; // CometChat UID = same as Mongo _id

        // Inside AlumniLogin after creating user
try {
  // Ensure user exists in CometChat
  const cometUser = new CometChat.User(UID);
  cometUser.setName(response.data.user.name || response.data.user.email);

  await CometChat.createUser(cometUser, process.env.REACT_APP_COMET_AUTH_KEY)
    .catch(() => {}); // Ignore if already exists

  // ✅ Only ONE login
  await CometChatUIKit.login(UID);

  dispatch(setAlumni(response.data.user));

  if (response.data.user.onboardingStatus === false) {
    navigate("/signup/onboard");
  } else {
    navigate("/dashboard");
  }

  toast.success(response.data.message);
} catch (chatError) {
  console.error("CometChat login error:", chatError);
  toast.warning("Chat functionality might be limited");
  navigate(response.data.user.onboardingStatus ? "/dashboard" : "/signup/onboard");
}

      } else {
        Cookies.remove("token");
        await handleCometChatLogout();
        dispatch(setAlumni(null));
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      Cookies.remove("token");
      await handleCometChatLogout();
      dispatch(setAlumni(null));
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) navigate("/dashboard");
  }, []);

  return (
    <div className="bg-gray-900 w-full h-[90%] text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-5">
        <div className="text-center pb-3">
          <h3 className="text-xl font-bold sm:text-3xl">
            Log in to your account
          </h3>
        </div>
        <form onSubmit={AlumniLogin} className="space-y-5">
          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              onChange={handleChange}
              required
              className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-400 shadow-sm rounded-lg"
            />
          </div>
          <div>
            <label className="font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              onChange={handleChange}
              required
              className="w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-400 shadow-sm rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`${
              isLoading
                ? "cursor-wait bg-gray-500"
                : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600"
            } w-full px-4 py-2 text-white font-medium rounded-lg duration-150`}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="text-center">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-indigo-500 hover:text-indigo-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
