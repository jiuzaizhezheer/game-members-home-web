import { createElement } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import AuthLayout from '@/components/layout/AuthLayout'

export const router = createBrowserRouter([
  {
    element: createElement(AuthLayout),
    children: [
      { path: '/', element: createElement(Navigate, { to: '/login', replace: true }) },
      { path: '/login', element: createElement(LoginPage) },
      { path: '/register', element: createElement(RegisterPage) },
    ],
  },
])
