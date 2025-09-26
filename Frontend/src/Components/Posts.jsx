import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import NotLoggedIn from './helper/NotLoggedIn';
import { fetchPosts, createPost, toggleLikePost, addCommentToPost, deletePost } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon,
  PlusCircleIcon,
  XMarkIcon,
  TrashIcon,
  HashtagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

function Posts() {
  // Use Redux hooks directly like other components
  const loggedIn = useSelector((state) => state.loggedIn);
  const user = useSelector((state) => state.currentUser);
  
  // Debug authentication state
  console.log('Posts component - loggedIn:', loggedIn);
  console.log('Posts component - user:', user);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Create post form state
  const [postForm, setPostForm] = useState({
    title: '',
    content: '',
    postType: 'general',
    tags: '',
    visibility: 'department'
  });

  // Comment states
  const [commentForms, setCommentForms] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    if (loggedIn) {
      loadPosts();
    }
  }, [loggedIn]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await fetchPosts();
      setPosts(res.data.data.posts);
      
      if (res.data.meta && res.data.meta.totalPosts === 0) {
        console.log('No posts found for your department');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      const postData = {
        ...postForm,
        tags: postForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      };
      
      await createPost(postData);
      toast.success('Post created successfully!');
      setPostForm({
        title: '',
        content: '',
        postType: 'general',
        tags: '',
        visibility: 'department'
      });
      setShowCreateForm(false);
      loadPosts(); // Refresh posts
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await toggleLikePost(postId);
      
      // Update posts state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post, 
                likeCount: res.data.data.likeCount,
                isLikedByUser: res.data.data.action === 'liked'
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (postId) => {
    const commentContent = commentForms[postId];
    if (!commentContent || !commentContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      const res = await addCommentToPost(postId, { content: commentContent });
      
      // Update posts state with new comment
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post._id === postId 
            ? {
                ...post,
                comments: [...post.comments, res.data.data.comment],
                commentCount: res.data.data.commentCount
              }
            : post
        )
      );
      
      // Clear comment form
      setCommentForms(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await deletePost(postId);
      setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  };

  const getPostTypeColor = (type) => {
    const colors = {
      thought: 'bg-blue-100 text-blue-800',
      achievement: 'bg-green-100 text-green-800',
      experience: 'bg-purple-100 text-purple-800',
      opportunity: 'bg-yellow-100 text-yellow-800',
      question: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.general;
  };

  const canUserCreatePosts = user && (user.role === 'alumni' || user.role === 'student');
  const canDeletePost = (post) => {
    return user && (user._id === post.author || user.role === 'admin');
  };

  // Show loading state while checking authentication
  if (loggedIn === undefined || loggedIn === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return <NotLoggedIn />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Posts</h1>
          <p className="text-gray-600">Share your thoughts and connect with colleagues in {user?.department}</p>
        </div>

        {/* Create Post Button */}
        {canUserCreatePosts && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors duration-200"
              >
                <PlusCircleIcon className="h-5 w-5 text-indigo-500" />
                <span className="text-gray-600">Share something with your department...</span>
              </button>
            ) : (
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Create a Post</h3>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Post title..."
                  value={postForm.title}
                  onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  maxLength={100}
                />

                <textarea
                  placeholder="What's on your mind?"
                  value={postForm.content}
                  onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  maxLength={2000}
                />

                <div className="flex gap-4">
                  <select
                    value={postForm.postType}
                    onChange={(e) => setPostForm(prev => ({ ...prev, postType: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="general">General</option>
                    <option value="thought">Thought</option>
                    <option value="achievement">Achievement</option>
                    <option value="experience">Experience</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="question">Question</option>
                  </select>

                  <select
                    value={postForm.visibility}
                    onChange={(e) => setPostForm(prev => ({ ...prev, visibility: e.target.value }))}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="department">Department</option>
                    <option value="branch">Branch</option>
                    <option value="public">Public</option>
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Tags (comma-separated)..."
                  value={postForm.tags}
                  onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
                  >
                    {loading ? 'Posting...' : 'Share Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {loading && posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <ChatBubbleLeftIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500">
                {canUserCreatePosts 
                  ? "Be the first to share something with your department!" 
                  : "No posts available for your department."}
              </p>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="bg-white rounded-xl shadow-sm p-6">
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {post.authorInfo?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.authorInfo?.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{post.authorInfo?.role}</span>
                        <span>•</span>
                        <span>{post.authorInfo?.department}</span>
                        <span>•</span>
                        <ClockIcon className="h-3 w-3" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getPostTypeColor(post.postType)}`}>
                      {post.postType}
                    </span>
                    {canDeletePost(post) && (
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        <HashtagIcon className="h-3 w-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(post._id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors duration-200 ${
                        post.isLikedByUser
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {post.isLikedByUser ? (
                        <HeartSolidIcon className="h-4 w-4" />
                      ) : (
                        <HeartIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm">{post.likeCount || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post._id)}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      <span className="text-sm">{post.commentCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {/* Add Comment */}
                    <div className="flex gap-3 mb-4">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-xs">
                          {user?.firstName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={commentForms[post._id] || ''}
                          onChange={(e) => setCommentForms(prev => ({ ...prev, [post._id]: e.target.value }))}
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                          maxLength={500}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm transition-colors duration-200"
                        >
                          Post
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {post.comments && post.comments.map((comment, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-xs">
                              {comment.user?.firstName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="font-medium text-sm text-gray-900 mb-1">
                                {comment.user?.firstName} {comment.user?.lastName}
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 ml-3">
                              {formatTimeAgo(comment.commentedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Posts;