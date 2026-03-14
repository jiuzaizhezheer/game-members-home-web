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
    return requestJson<GroupListOut>(`/communities/groups?${params.toString()}`, {
      method: 'GET',
      auth: false,
    })
  },

  getGroupDetail: async (groupId: string) => {
    return requestJson<GroupDetailOut>(`/communities/groups/${groupId}`, {
      method: 'GET',
      auth: false,
    })
  },

  joinGroup: async (groupId: string) => {
    return requestJson<void>(`/communities/groups/${groupId}/join`, {
      method: 'POST',
    })
  },

  leaveGroup: async (groupId: string) => {
    return requestJson<void>(`/communities/groups/${groupId}/leave`, {
      method: 'POST',
    })
  },

  // --- Posts ---
  getGroupPosts: async (groupId: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/communities/groups/${groupId}/posts?${params.toString()}`, {
      method: 'GET',
      auth: false,
    })
  },

  getPostDetail: async (postId: string) => {
    return requestJson<PostDetailOut>(`/communities/posts/${postId}`, {
      method: 'GET',
      auth: false,
    })
  },

  createPost: async (data: PostCreateIn) => {
    return requestJson<PostDetailOut>('/communities/posts', {
      method: 'POST',
      body: data,
    })
  },

  updatePost: async (postId: string, data: Partial<PostCreateIn>) => {
    return requestJson<PostDetailOut>(`/communities/posts/${postId}`, {
      method: 'PUT',
      body: data,
    })
  },

  getMyPosts: async (page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/communities/my-posts?${params.toString()}`, {
      method: 'GET',
    })
  },

  searchPosts: async (query: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<PostListOut>(`/communities/search?${params.toString()}`, {
      method: 'GET',
      auth: false,
    })
  },

  // --- Comments ---
  getPostComments: async (postId: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    return requestJson<CommentListOut>(
      `/communities/posts/${postId}/comments?${params.toString()}`,
      {
        method: 'GET',
        auth: false,
      },
    )
  },

  createComment: async (postId: string, data: CommentCreateIn) => {
    return requestJson<CommentItemOut>(`/communities/posts/${postId}/comments`, {
      method: 'POST',
      body: data,
    })
  },

  // --- Likes ---
  toggleLike: async (targetId: string, targetType: 'post' | 'comment') => {
    return requestJson<boolean>('/communities/likes', {
      method: 'POST',
      body: { target_id: targetId, target_type: targetType },
    })
  },
}
