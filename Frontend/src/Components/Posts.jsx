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
  ClockIcon,
  SparklesIcon,
  GlobeAltIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, FireIcon } from '@heroicons/react/24/solid';

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
      thought: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
      achievement: 'bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 border-green-300',
      experience: 'bg-gradient-to-r from-purple-100 to-violet-200 text-purple-800 border-purple-300',
      opportunity: 'bg-gradient-to-r from-yellow-100 to-amber-200 text-yellow-800 border-yellow-300',
      question: 'bg-gradient-to-r from-red-100 to-rose-200 text-red-800 border-red-300',
      general: 'bg-gradient-to-r from-gray-100 to-slate-200 text-gray-800 border-gray-300'
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <SparklesIcon className="h-4 w-4 text-indigo-400 absolute top-2 right-2 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return <NotLoggedIn />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl transform -rotate-1"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-3">
                <ChatBubbleLeftIcon className="h-5 w-5 sm:h-6 lg:h-8 sm:w-6 lg:w-8 text-white" />
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-full p-1 sm:p-2">
                <SparklesIcon className="h-4 w-4 sm:h-5 lg:h-6 sm:w-5 lg:w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              Department Posts
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-2 sm:px-0">
              Share your thoughts and connect with colleagues in 
              <span className="font-semibold text-indigo-600 ml-1">{user?.department}</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center mt-3 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-gray-500">
              <div className="flex items-center">
                <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Department Community
              </div>
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {user?.branch}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Create Post Section */}
        {canUserCreatePosts && (
          <div className="relative mb-6 sm:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl sm:rounded-2xl transform rotate-1"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-4 sm:p-6">
              {!showCreateForm ? (
                <div className="group">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 border-2 border-dashed border-indigo-300 rounded-lg sm:rounded-xl hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2 group-hover:animate-pulse">
                      <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base lg:text-lg text-center">Share something amazing with your department...</span>
                    <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreatePost} className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-1.5 sm:p-2">
                        <PlusCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Create a Post
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 sm:p-2 transition-all duration-200"
                    >
                      <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="✨ Give your post an amazing title..."
                    value={postForm.title}
                    onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base lg:text-lg font-medium placeholder:text-gray-400"
                    maxLength={100}
                  />

                  <textarea
                    placeholder="💭 What's on your mind? Share your thoughts..."
                    value={postForm.content}
                    onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl h-28 sm:h-32 lg:h-36 resize-none focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400 text-sm sm:text-base"
                    maxLength={2000}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FireIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
                        Post Type
                      </label>
                      <select
                        value={postForm.postType}
                        onChange={(e) => setPostForm(prev => ({ ...prev, postType: e.target.value }))}
                        className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base"
                      >
                        <option value="general">🌟 General</option>
                        <option value="thought">💭 Thought</option>
                        <option value="achievement">🏆 Achievement</option>
                        <option value="experience">📚 Experience</option>
                        <option value="opportunity">🚀 Opportunity</option>
                        <option value="question">❓ Question</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                        <GlobeAltIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                        Visibility
                      </label>
                      <select
                        value={postForm.visibility}
                        onChange={(e) => setPostForm(prev => ({ ...prev, visibility: e.target.value }))}
                        className="w-full p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 text-sm sm:text-base"
                      >
                        <option value="department">🏢 Department</option>
                        <option value="branch">🌳 Branch</option>
                        <option value="public">🌍 Public</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="🏷️ Tags (comma-separated) - #technology, #career, #tips..."
                    value={postForm.tags}
                    onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400 text-sm sm:text-base"
                  />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 font-semibold text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      {loading ? '✨ Posting...' : '🚀 Share Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Posts Feed */}
        <div className="space-y-6 sm:space-y-8">
          {loading && posts.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4 sm:mb-6"></div>
                <SparklesIcon className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-400 absolute top-2 right-2 sm:top-3 sm:right-3 animate-pulse" />
              </div>
              <p className="text-gray-600 text-base sm:text-lg font-medium">Loading amazing posts...</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Discovering content from your department</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl sm:rounded-3xl transform rotate-3"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg border border-white/50">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-3 sm:p-4 w-fit mx-auto mb-4 sm:mb-6">
                    <ChatBubbleLeftIcon className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">No posts yet</h3>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-4 sm:px-0">
                    {canUserCreatePosts 
                      ? "🚀 Be the first to share something amazing with your department!" 
                      : "No posts available for your department yet."}
                  </p>
                  {canUserCreatePosts && (
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4 sm:mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
                    >
                      ✨ Create Your First Post
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            posts.map(post => (
              <div key={post._id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl sm:rounded-2xl transform rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl border border-white/50 p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:transform hover:scale-[1.02]">
                  {/* Enhanced Post Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 lg:w-14 sm:h-12 lg:h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm sm:text-base lg:text-lg">
                            {post.authorInfo?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 lg:w-5 sm:h-4 lg:h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg truncate">{post.authorInfo?.name}</h4>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500">
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full font-medium">{post.authorInfo?.role}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="font-medium truncate">{post.authorInfo?.department}</span>
                          <span className="hidden sm:inline">•</span>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full border font-medium ${getPostTypeColor(post.postType)}`}>
                        {post.postType}
                      </span>
                      {canDeletePost(post) && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 sm:p-2 rounded-full hover:bg-red-50 transition-all duration-200"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Post Content */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="font-bold text-gray-900 mb-2 sm:mb-3 text-base sm:text-lg lg:text-xl leading-tight">{post.title}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base lg:text-lg">{post.content}</p>
                  </div>

                  {/* Enhanced Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                      {post.tags.map((tag, index) => (
                        <span key={index} className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs sm:text-sm rounded-full border border-indigo-200 hover:from-indigo-200 hover:to-purple-200 transition-all duration-200 cursor-pointer">
                          <HashtagIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="truncate max-w-20 sm:max-w-none">{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Post Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start ${
                          post.isLikedByUser
                            ? 'text-red-600 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-md'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200'
                        }`}
                      >
                        {post.isLikedByUser ? (
                          <HeartSolidIcon className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                        ) : (
                          <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                        <span className="font-medium text-sm sm:text-base">{post.likeCount || 0}</span>
                        <span className="text-xs sm:text-sm hidden sm:inline">Like{post.likeCount !== 1 ? 's' : ''}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post._id)}
                        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 border border-gray-200 transition-all duration-200 transform hover:scale-105 flex-1 sm:flex-none justify-center sm:justify-start"
                      >
                        <ChatBubbleLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-sm sm:text-base">{post.commentCount || 0}</span>
                        <span className="text-xs sm:text-sm hidden sm:inline">Comment{post.commentCount !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 sm:px-3 py-1 rounded-full self-end sm:self-auto">
                      {post.visibility} visibility
                    </div>
                  </div>

                  {/* Enhanced Comments Section */}
                  {showComments[post._id] && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                      {/* Add Comment */}
                      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            {user?.firstName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <input
                            type="text"
                            placeholder="💬 Add a thoughtful comment..."
                            value={commentForms[post._id] || ''}
                            onChange={(e) => setCommentForms(prev => ({ ...prev, [post._id]: e.target.value }))}
                            className="flex-1 p-2.5 sm:p-3 border-2 border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 transition-all duration-200 placeholder:text-gray-400"
                            maxLength={500}
                          />
                          <button
                            onClick={() => handleAddComment(post._id)}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-sm"
                          >
                            Post
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Comments List */}
                      <div className="space-y-3 sm:space-y-4">
                        {post.comments && post.comments.map((comment, index) => (
                          <div key={index} className="flex gap-3 sm:gap-4 group">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                              <span className="text-white font-medium text-xs">
                                {comment.user?.firstName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-200">
                                <div className="font-semibold text-xs sm:text-sm text-gray-900 mb-1 sm:mb-2 truncate">
                                  {comment.user?.firstName} {comment.user?.lastName}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words">{comment.content}</p>
                              </div>
                              <div className="text-xs text-gray-500 mt-1 sm:mt-2 ml-3 sm:ml-4 flex items-center gap-1">
                                <ClockIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {formatTimeAgo(comment.commentedAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        toastClassName="rounded-xl shadow-lg"
        progressClassName="bg-gradient-to-r from-indigo-500 to-purple-600"
      />
    </div>
  );
}

export default Posts;