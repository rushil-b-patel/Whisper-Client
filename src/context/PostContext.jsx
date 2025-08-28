import axios from 'axios';
import { useCallback } from 'react';
import { useRequest } from '../utils/useRequest.jsx';
import { showSuccess } from '../utils/toast.jsx';
import { useAuth } from './AuthContext.jsx';

const BASE_API = import.meta.env.VITE_BASE_API;
const BASE_API_MOBILE = import.meta.env.VITE_BASE_API_MOBILE;
const API = /iphone|ipad|ipod|Android/i.test(navigator.userAgent) ? BASE_API_MOBILE : BASE_API;

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const usePostService = () => {
  const { execute, isLoading, error } = useRequest();
  const { user } = useAuth();

  const token = user?.token || localStorage.getItem('token');

  // ------------------- POSTS -------------------

  const createPost = async (formData) =>
    execute(
      () =>
        axios
          .post(`${API}/post/create-post`, formData, {
            headers: { ...getAuthHeaders(token), 'Content-Type': 'multipart/form-data' },
          })
          .then((res) => res.data),
      'Failed to create post'
    );

  const getAllPosts = async () =>
    execute(() => axios.get(`${API}/post`).then((res) => res.data), 'Failed to load posts');

  const getPost = useCallback(
    async (id) =>
      execute(() => axios.get(`${API}/post/${id}`).then((res) => res.data), 'Failed to load post'),
    []
  );

  const deletePost = async (id) =>
    execute(
      () =>
        axios
          .delete(`${API}/post/delete-post/${id}`, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to delete post'
    );

  const upVotePost = async (id) =>
    execute(
      () =>
        axios
          .put(`${API}/post/upvote/${id}`, {}, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to upvote'
    );

  const downVotePost = async (id) =>
    execute(
      () =>
        axios
          .put(`${API}/post/downvote/${id}`, {}, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to downvote'
    );

  const savePost = async (postId) =>
    execute(
      () =>
        axios
          .put(`${API}/post/save/${postId}`, {}, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to save post'
    );

  const getSavedPosts = async () =>
    execute(
      () =>
        axios
          .get(`${API}/post/saved-posts`, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to fetch saved posts'
    );

  // ------------------- COMMENTS -------------------

  const addComment = async (id, text) =>
    execute(
      () =>
        axios
          .post(`${API}/comment/${id}`, { text }, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to add comment'
    );

  const deleteComment = async (postId, commentId) =>
    execute(
      () =>
        axios
          .delete(`${API}/comment/${postId}/${commentId}`, { headers: getAuthHeaders(token) })
          .then((res) => {
            showSuccess('Comment deleted');
            return res.data;
          }),
      'Failed to delete comment'
    );

  const voteComment = async (postId, commentId, voteType) =>
    execute(
      () =>
        axios
          .put(
            `${API}/comment/${postId}`,
            { commentId, voteType },
            { headers: getAuthHeaders(token) }
          )
          .then((res) => res.data),
      'Failed to vote on comment'
    );

  // ------------------- DEPARTMENTS -------------------

  const getDepartments = async () =>
    execute(
      () => axios.get(`${API}/departments`).then((res) => res.data),
      'Failed to fetch departments'
    );

  const saveDepartment = async (name) =>
    execute(
      () =>
        axios
          .post(`${API}/departments/add`, { name }, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to save department'
    );

  const getPostsByDepartment = async (name) =>
    execute(
      () => axios.get(`${API}/departments/${name}/posts`).then((res) => res.data),
      'Failed to load department posts'
    );

  // ------------------- TAGS -------------------

  const getTag = async () =>
    execute(() => axios.get(`${API}/tags`).then((res) => res.data.tags), 'Failed to fetch tags');

  const saveTag = async (name) =>
    execute(
      () =>
        axios
          .post(`${API}/tags/add`, { name }, { headers: getAuthHeaders(token) })
          .then((res) => res.data.tag),
      'Failed to save tag'
    );

  const getPostsByTag = async (name) =>
    execute(
      () => axios.get(`${API}/tags/${encodeURIComponent(name)}`).then((res) => res.data),
      'Failed to load tag posts'
    );

  // ------------------- STATS -------------------

  const getUserStats = async () =>
    execute(
      () =>
        axios
          .get(`${API}/stats/user-stats`, { headers: getAuthHeaders(token) })
          .then((res) => res.data),
      'Failed to fetch stats'
    );

  // ------------------- SEARCH -------------------

  const searchPosts = async (query) =>
    execute(
      () => axios.get(`${API}/post/search`, { params: { query } }).then((res) => res.data.posts),
      'Failed to search posts'
    );

  return {
    createPost,
    getAllPosts,
    getPost,
    deletePost,
    upVotePost,
    downVotePost,
    addComment,
    deleteComment,
    voteComment,
    savePost,
    getSavedPosts,
    getUserStats,
    getDepartments,
    saveDepartment,
    getPostsByDepartment,
    getTag,
    saveTag,
    getPostsByTag,
    searchPosts,
    isLoading,
    error,
  };
};
