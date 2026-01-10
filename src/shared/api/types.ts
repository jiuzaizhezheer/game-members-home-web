export type SuccessResponse<T> = {
  message: string
  data: T | null
}

export type ApiError = {
  message: string
}

