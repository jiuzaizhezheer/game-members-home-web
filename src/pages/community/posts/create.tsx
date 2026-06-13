import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom'
import { Loader2, Image, X, Video, ChevronLeft, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { communityApi } from '@/features/community/api'
import type { GroupDetailOut } from '@/features/community/types'
import { getFileUrl } from '@/shared/utils/file'
import { commonApi } from '@/features/common/api'

export default function CreatePostPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [searchParams] = useSearchParams()
  const groupId = searchParams.get('group_id')
  const navigate = useNavigate()

  const [group, setGroup] = useState<GroupDetailOut | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [videos, setVideos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  // Load Data
  useEffect(() => {
    if (isEdit) {
      // Edit Mode: Load Post
      communityApi
        .getPostDetail(id!)
        .then(async (post) => {
          setTitle(post.title)
          setContent(post.content)
          setImages(post.images || [])
          setVideos(post.videos || [])
          try {
            const groupDetail = await communityApi.getGroupDetail(post.group_id)
            setGroup(groupDetail)
          } catch {
            setGroup({
              id: post.group_id,
              name: post.group_name,
              description: null,
              cover_image: null,
              member_count: 0,
              post_count: 0,
              is_joined: false,
              created_at: post.created_at,
            })
          }
        })
        .catch(() => {
          navigate('/community')
        })
        .finally(() => setLoading(false))
    } else {
      // Create Mode: Load Group
      if (groupId) {
        communityApi
          .getGroupDetail(groupId)
          .then(setGroup)
          .catch(() => {
            navigate('/community')
          })
      } else {
        navigate('/community')
      }
    }
  }, [id, groupId, isEdit, navigate])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 9) {
      return
    }

    setUploading(true)
    const newImages = [...images]
    try {
      for (let i = 0; i < files.length; i++) {
        const { url } = await commonApi.uploadFile(files[i])
        newImages.push(url)
      }
      setImages(newImages)
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (videos.length + files.length > 1) {
      return
    }

    setUploading(true)
    const newVideos = [...videos]
    try {
      for (let i = 0; i < files.length; i++) {
        // Ensure file is video
        if (!files[i].type.startsWith('video/')) {
          continue
        }
        const { url } = await commonApi.uploadFile(files[i])
        newVideos.push(url)
      }
      setVideos(newVideos)
    } catch (error) {
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const removeVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('请填写帖子标题')
      return
    }
    if (!content.trim()) {
      toast.error('请填写帖子正文')
      return
    }

    const finalGroupId = group?.id || groupId
    if (!finalGroupId) {
      toast.error('没有找到要发布到的话题圈')
      return
    }

    setSubmitting(true)
    try {
      if (isEdit) {
        await communityApi.updatePost(id!, {
          title,
          content,
          images,
          videos,
        })
        navigate(-1)
      } else {
        await communityApi.createPost({
          group_id: finalGroupId,
          title,
          content,
          images,
          videos,
        })
        navigate(`/community/groups/${finalGroupId}`)
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      const message = err.response?.data?.message || err.message || '发布失败，请稍后重试'
      toast.error(message)
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (!group && !isEdit))
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    )

  return (
    <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        to={group ? `/community/groups/${group.id}` : '/community'}
        className="mb-6 inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        返回{group ? group.name : '社区'}
      </Link>

      <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100/50 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">{isEdit ? '编辑帖子' : '发布新帖'}</h1>
            <p className="mt-1 text-sm text-zinc-500">分享你的观点，遵守社区规范</p>
          </div>
          {group && (
            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-100">
              <Zap size={14} className="fill-current" />
              {group.name}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border-0 bg-zinc-50 px-5 py-4 text-lg font-bold outline-none ring-1 ring-zinc-200 transition-all placeholder:font-normal focus:bg-white focus:ring-2 focus:ring-indigo-500"
              placeholder="起个吸引人的标题..."
              maxLength={50}
              autoFocus
            />
            <div className="text-right text-xs text-zinc-400 font-medium px-1">
              {title.length}/50
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-700 ml-1">正文</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-2xl border-0 bg-zinc-50 px-5 py-4 text-base outline-none ring-1 ring-zinc-200 transition-all focus:bg-white focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
              placeholder="在这里分享你的想法、攻略或提问..."
            />
          </div>

          {/* Media Upload Zone */}
          <div className="space-y-6 rounded-2xl bg-zinc-50/50 p-6 border border-zinc-100 border-dashed">
            {/* Images */}
            <div>
              <label className="mb-3 block text-sm font-bold text-zinc-700">
                图片 ({images.length}/9)
              </label>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 group bg-white shadow-sm"
                  >
                    <img src={getFileUrl(img)} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500 backdrop-blur-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {images.length < 9 && (
                  <label
                    className={`group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-indigo-500" />
                    ) : (
                      <>
                        <div className="mb-2 rounded-full bg-zinc-100 p-2 group-hover:bg-indigo-100 transition-colors">
                          <Image className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-indigo-500">
                          添加图片
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Videos */}
            <div>
              <label className="mb-3 block text-sm font-bold text-zinc-700">
                视频 ({videos.length}/1)
              </label>
              <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
                {videos.map((vid, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 group bg-black shadow-sm"
                  >
                    <video
                      src={getFileUrl(vid)}
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Video className="text-white/50" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500 backdrop-blur-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {videos.length < 1 && (
                  <label
                    className={`group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-indigo-500" />
                    ) : (
                      <>
                        <div className="mb-2 rounded-full bg-zinc-100 p-2 group-hover:bg-indigo-100 transition-colors">
                          <Video className="h-5 w-5 text-zinc-400 group-hover:text-indigo-500" />
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-indigo-500">
                          添加视频
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 border-t border-zinc-50 pt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 text-sm font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="rounded-full bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (isEdit ? '保存中...' : '发布中...') : isEdit ? '保存修改' : '发布帖子'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
