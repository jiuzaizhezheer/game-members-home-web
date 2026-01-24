import { createElement } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthLayout, LoginPage, RegisterPage } from '@/pages/auth'
import {
  MerchantLayout,
  MerchantWorkbench,
  ProductList,
  ProductDetail,
  MerchantSettings,
} from '@/pages/merchant'
import { AdminLayout, AdminDashboard } from '@/pages/admin'

import WelcomePage from '@/pages/index'

export const router = createBrowserRouter([
  // Index Route
  {
    path: '/',
    children: [
      { index: true, element: createElement(Navigate, { to: 'index', replace: true }) },
      { path: 'index', element: createElement(WelcomePage) },
    ],
  },

  // Auth Routes
  {
    path: '/auth',
    element: createElement(AuthLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'login', replace: true }) },
      { path: 'login', element: createElement(LoginPage) },
      { path: 'register', element: createElement(RegisterPage) },
    ],
  },

  // Merchant Routes
  {
    path: '/merchant',
    element: createElement(MerchantLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'workbench', replace: true }) },
      { path: 'workbench', element: createElement(MerchantWorkbench) },
      { path: 'product/list', element: createElement(ProductList) },
      { path: 'product/create', element: createElement(ProductDetail) },
      { path: 'product/edit/:id', element: createElement(ProductDetail) },
      { path: 'settings', element: createElement(MerchantSettings) },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: createElement(AdminLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'dashboard', replace: true }) },
      { path: 'dashboard', element: createElement(AdminDashboard) },
      // 后续扩展...
    ],
  },
])
