import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  HandThumbUpIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../../../../redux/alerts";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../../../utils/avatarUtils";

const Posts = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState(null);

  const fetchData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/alumni/posts`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        }
      );
      if (response.data.success) {
        setPosts(
          response.data.posts.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } else {
        toast.error("Something went wrong!");
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      toast.error("Something went wrong!");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLike = async (postId) => {
    try {
      dispatch(ShowLoading());
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/alumni/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        }
      );
      if (response.data.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, likes: response.data.likes } : p
          )
        );
      } else {
        toast.error("Failed to like post");
      }
      dispatch(HideLoading());
    } catch (error) {
      dispatch(HideLoading());
      toast.error("Error liking post");
    }
  };

  const handleComment = async (postId, text, setCommentText) => {
  if (!text.trim()) return;
  try {
    dispatch(ShowLoading());
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/alumni/posts/${postId}/comment`,
       {text},  // ✅ only send text, backend fills user info
      {
        headers: {
          Authorization: `Bearer ${
            document.cookie
              .split("; ")
              .find((row) => row.startsWith("token="))
              ?.split("=")[1]
          }`,
        },
      }
    );
    if (response.data.success) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, comments: response.data.comments } : p
        )
      );
      setCommentText("");
    } else {
      toast.error("Failed to add comment");
    }
    dispatch(HideLoading());
  } catch (error) {
    dispatch(HideLoading());
    toast.error("Error adding comment");
  }
};


  return (
    <div className="bg-gray-900 max-h-screen p-8 pt-0 text-white">
      {posts?.length > 0 ? (
        <>
          <div className="space-y-6 pt-2">
            <div className="justify-self-end">
              <Link
                to="/dashboard/create-post"
                className=" bg-blue-500 text-white h-full px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Create Post
              </Link>
            </div>
            {posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                handleLike={handleLike}
                handleComment={handleComment}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-xl my-4">No posts found</p>
          <Link
            className="text-center hover:underline"
            to="/dashboard/create-post"
          >
            <p>create post</p>
          </Link>
        </>
      )}
    </div>
  );
};

const Post = ({ post, handleLike, handleComment }) => {
  const { user, content, image, createdAt, likes, comments } = post;
  const [commentText, setCommentText] = useState("");

  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-md p-4 mx-2 my-4 flex flex-col md:flex-row md:space-x-4">
      {/* Left Side: Post Content */}
      <div className="flex-1 flex flex-col justify-between">
        {/* User Information and Content */}
        <div>
          <Link to={`/dashboard/profile/${user.id}`}>
            <div className="flex items-center mb-4">
              <img
                src={getAvatarUrl(
                  user.profilePicture,
                  user.name.split(" ")[0],
                  user.name.split(" ").slice(1).join(" ")
                )}
                alt={`${user.name}'s profile`}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold hover:underline">
                  {user.name}
                </h3>
                <p className="text-gray-400 text-sm">{user.headline}</p>
                <p className="text-gray-500 text-xs">
                  {moment(createdAt).fromNow()}
                </p>
              </div>
            </div>
          </Link>

          {/* Post Content */}
          <div className="mb-4">
            <p className="text-sm">{content}</p>
          </div>

          {/* Post Image (if any) */}
          {image && (
            <div className="mb-4">
              <img
                src={image}
                alt="Post content"
                className="rounded-lg w-full max-h-40 object-cover"
              />
            </div>
          )}
        </div>

        {/* Reaction Buttons */}
        <div className="mt-auto border-t border-gray-700 pt-2">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400"
                onClick={() => handleLike(post._id)}
              >
                <HandThumbUpIcon className="h-5 w-5" />
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400">
                <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />
                <span>Comment</span>
              </button>
            </div>
            <div>
              <span className="text-gray-500 text-sm">
                {likes?.length || 0} Likes • {comments?.length || 0} Comments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Comments Section */}
      <div
        className="md:w-1/3 w-full mt-4 md:mt-0 bg-gray-700 rounded-lg p-4 flex flex-col"
        style={{ maxHeight: "100%" }}
      >
        <div
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: "inherit" }}
        >
          <h4 className="text-sm font-semibold mb-2">Comments</h4>
          <div className="text-gray-300 text-xs space-y-2">
            {comments?.length > 0 ? (
              comments.map((c, i) => (
                <p key={i}>
                  <span className="font-bold">{c.user.name}:</span> {c.text}
                </p>
              ))
            ) : (
              <p className="text-gray-500 text-xs">No comments yet</p>
            )}
          </div>
        </div>

        {/* Add a Comment Input */}
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 bg-gray-600 text-sm rounded-md outline-none focus:bg-gray-500"
          />
          <button
            onClick={() => handleComment(post._id, commentText, setCommentText)}
            className="bg-blue-500 px-3 py-1 rounded-md text-sm hover:bg-blue-600"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default Posts;
