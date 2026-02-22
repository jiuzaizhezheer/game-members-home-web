import { requestJson } from '@/shared/api/http'
import type {
  GroupListOut,
  GroupDetailOut,
  PostListOut,
  PostDetailOut,
  PostCreateIn,
  CommentListOut,
  CommentItemOut,
  CommentCreateIn,
} from './types'

export const communityApi = {
  // --- Groups ---
  getGroups: async (page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<GroupListOut>(`/community/groups?${params.toString()}`, {
      method: 'GET',
    })
  },

  getGroupDetail: async (groupId: string) => {
    return requestJson<GroupDetailOut>(`/community/groups/${groupId}`, {
      method: 'GET',
    })
  },

  joinGroup: async (groupId: string) => {
    return requestJson<void>(`/community/groups/${groupId}/join`, {
      method: 'POST',
    })
  },

  leaveGroup: async (groupId: string) => {
    return requestJson<void>(`/community/groups/${groupId}/leave`, {
      method: 'POST',
    })
  },

  // --- Posts ---
  getGroupPosts: async (groupId: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/community/groups/${groupId}/posts?${params.toString()}`, {
      method: 'GET',
    })
  },

  getPostDetail: async (postId: string) => {
    return requestJson<PostDetailOut>(`/community/posts/${postId}`, {
      method: 'GET',
    })
  },

  createPost: async (data: PostCreateIn) => {
    return requestJson<PostDetailOut>('/community/posts', {
      method: 'POST',
      body: data,
    })
  },

  updatePost: async (postId: string, data: Partial<PostCreateIn>) => {
    return requestJson<PostDetailOut>(`/community/posts/${postId}`, {
      method: 'PUT',
      body: data,
    })
  },

  getMyPosts: async (page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/community/my-posts?${params.toString()}`, {
      method: 'GET',
    })
  },

  searchPosts: async (query: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/community/search?${params.toString()}`, {
      method: 'GET',
    })
  },

  // --- Comments ---
  getPostComments: async (postId: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<CommentListOut>(`/community/posts/${postId}/comments?${params.toString()}`, {
      method: 'GET',
    })
  },

  createComment: async (postId: string, data: CommentCreateIn) => {
    return requestJson<CommentItemOut>(`/community/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    })
  },

  // --- Likes ---
  toggleLike: async (targetId: string, targetType: 'post' | 'comment') => {
    return requestJson<boolean>('/community/likes', {
      method: 'POST',
      body: { target_id: targetId, target_type: targetType },
    })
  },
}
