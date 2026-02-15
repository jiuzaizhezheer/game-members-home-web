import { addressApi } from './api'
import type { AddressCreateIn, AddressUpdateIn } from './types'

export const addressService = {
  getMyAddresses: async () => {
    return await addressApi.getMyAddresses()
  },

  addAddress: async (data: AddressCreateIn) => {
    return await addressApi.addAddress(data)
  },

  updateAddress: async (id: string, data: AddressUpdateIn) => {
    return await addressApi.updateAddress(id, data)
  },

  deleteAddress: async (id: string) => {
    return await addressApi.deleteAddress(id)
  },

  setDefault: async (id: string) => {
    return await addressApi.setDefault(id)
  },
}
