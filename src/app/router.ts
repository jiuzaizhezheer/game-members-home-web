import { createElement } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import DashboardPage from '@/pages/dashboard'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'

export const router = createBrowserRouter([
  { path: '/', element: createElement(Navigate, { to: '/dashboard', replace: true }) },
  { path: '/dashboard', element: createElement(DashboardPage) },
  { path: '/login', element: createElement(LoginPage) },
  { path: '/register', element: createElement(RegisterPage) },
])

