import { requestJson } from '@/shared/api/http'
import type { AddressOut, AddressCreateIn, AddressUpdateIn } from './types'

export const addressApi = {
  getMyAddresses: () => requestJson<AddressOut[]>('/addresses/', {}),

  addAddress: (data: AddressCreateIn) =>
    requestJson<AddressOut>('/addresses/', {
      method: 'POST',
      body: data,
    }),

  updateAddress: (id: string, data: AddressUpdateIn) =>
    requestJson<AddressOut>(`/addresses/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deleteAddress: (id: string) =>
    requestJson<void>(`/addresses/${id}`, {
      method: 'DELETE',
    }),

  setDefault: (id: string) =>
    requestJson<void>(`/addresses/${id}/default`, {
      method: 'PATCH',
    }),
}
