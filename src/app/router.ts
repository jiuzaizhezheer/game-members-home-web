import { createElement, lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

// Layouts: eager imports (tiny shells needed immediately, not worth splitting)
import { AuthLayout } from '@/pages/auth'
import { MemberLayout } from '@/pages/member'
import { MerchantLayout } from '@/pages/merchant'
import { AdminLayout } from '@/pages/admin'
import CommunityLayout from '@/pages/community/layout'
import WelcomePage from '@/pages/index'

// ─── Lazy-loaded page chunks ──────────────────────────────────────────────────
// Auth
const LoginPage = lazy(() => import('@/pages/auth/login'))
const RegisterPage = lazy(() => import('@/pages/auth/register'))

// Member
const HomePage = lazy(() => import('@/pages/member/home'))
const ProductDetailPage = lazy(() => import('@/pages/member/product/detail'))
const CartPage = lazy(() => import('@/pages/member/cart'))
const CheckoutPage = lazy(() => import('@/pages/member/checkout'))
const OrderListPage = lazy(() => import('@/pages/member/order/list'))
const OrderDetailPage = lazy(() => import('@/pages/member/order/detail'))
const ProfilePage = lazy(() => import('@/pages/member/profile'))
const AddressListPage = lazy(() => import('@/pages/member/profile/addresses'))
const FavoritesPage = lazy(() => import('@/pages/member/favorites'))
const MessageListPage = lazy(() => import('@/pages/member/message/list'))
const ChatPage = lazy(() => import('@/pages/member/message/chat'))
const MyPostsPage = lazy(() => import('@/pages/member/profile/MyPosts'))
const TrendingPage = lazy(() => import('@/pages/member/trending'))
const PointsHistoryPage = lazy(() => import('@/pages/member/profile/PointsHistoryPage'))
const CouponCenterPage = lazy(() => import('@/pages/member/coupon/CouponCenterPage'))
const MyCouponsPage = lazy(() => import('@/pages/member/profile/MyCouponsPage'))
const NotificationsPage = lazy(() => import('@/pages/member/notifications/NotificationsPage'))

// Community
const GroupListPage = lazy(() => import('@/pages/community/groups/index'))
const GroupDetailPage = lazy(() => import('@/pages/community/groups/detail'))
const PostDetailPage = lazy(() => import('@/pages/community/posts/detail'))
const CreatePostPage = lazy(() => import('@/pages/community/posts/create'))
const SearchResultsPage = lazy(() => import('@/pages/community/SearchResults'))

// Merchant
const MerchantWorkbench = lazy(() => import('@/pages/merchant/workbench'))
const MerchantProductList = lazy(() => import('@/pages/merchant/product/list'))
const MerchantProductDetail = lazy(() => import('@/pages/merchant/product/detail'))
const MerchantOrderList = lazy(() => import('@/pages/merchant/order/list'))
const MerchantAccount = lazy(() => import('@/pages/merchant/account'))
const MerchantSettings = lazy(() => import('@/pages/merchant/profile'))
const MerchantMessageList = lazy(() => import('@/pages/merchant/message/list'))
const MerchantChatPage = lazy(() => import('@/pages/merchant/message/chat'))
const MerchantCommunityPage = lazy(() => import('@/pages/merchant/community'))
const MerchantReviewPage = lazy(() => import('@/pages/merchant/reviews/index'))
const PromotionListPage = lazy(() => import('@/pages/merchant/marketing/promotions/index'))
const PromotionCreatePage = lazy(() => import('@/pages/merchant/marketing/promotions/create'))

// Admin
const AdminDashboard = lazy(() => import('@/pages/admin/dashboard'))
const AdminCommunityPage = lazy(() => import('@/pages/admin/community'))
const AdminUsersPage = lazy(() => import('@/pages/admin/users'))
const AdminProductsPage = lazy(() => import('@/pages/admin/products'))
const AdminContentPage = lazy(() => import('@/pages/admin/content'))
const AdminLogsPage = lazy(() => import('@/pages/admin/logs'))
const AdminBannersPage = lazy(() => import('@/pages/admin/content/AdminBannersPage'))
const AdminCouponListPage = lazy(
  () => import('@/pages/admin/marketing/coupons/AdminCouponListPage'),
)
const AdminCategoriesPage = lazy(() => import('@/pages/admin/categories'))
const AdminReportsPage = lazy(() => import('@/pages/admin/reports'))

// ─── Helper: wrap a lazy element in Suspense (null fallback - layout handles UI) ─
const s = (element: React.ReactNode) => createElement(Suspense, { fallback: null }, element)

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: createElement(Navigate, { to: 'index', replace: true }) },
      { path: 'index', element: createElement(WelcomePage) },
    ],
  },

  // Member Routes
  {
    path: '/member',
    element: createElement(MemberLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'home', replace: true }) },
      { path: 'home', element: s(createElement(HomePage)) },
      { path: 'product/:id', element: s(createElement(ProductDetailPage)) },
      { path: 'cart', element: s(createElement(CartPage)) },
      { path: 'checkout', element: s(createElement(CheckoutPage)) },
      { path: 'orders', element: s(createElement(OrderListPage)) },
      { path: 'orders/:id', element: s(createElement(OrderDetailPage)) },
      { path: 'order/:id', element: s(createElement(OrderDetailPage)) },
      { path: 'profile', element: s(createElement(ProfilePage)) },
      { path: 'profile/addresses', element: s(createElement(AddressListPage)) },
      { path: 'profile/posts', element: s(createElement(MyPostsPage)) },
      { path: 'profile/points', element: s(createElement(PointsHistoryPage)) },
      { path: 'favorites', element: s(createElement(FavoritesPage)) },
      { path: 'messages', element: s(createElement(MessageListPage)) },
      { path: 'messages/:partnerUserId', element: s(createElement(ChatPage)) },
      { path: 'trending', element: s(createElement(TrendingPage)) },
      { path: 'coupons', element: s(createElement(CouponCenterPage)) },
      { path: 'profile/coupons', element: s(createElement(MyCouponsPage)) },
      { path: 'points', element: s(createElement(PointsHistoryPage)) },
      { path: 'notifications', element: s(createElement(NotificationsPage)) },
    ],
  },

  // Community Routes
  {
    path: '/community',
    element: createElement(CommunityLayout),
    children: [
      { index: true, element: s(createElement(GroupListPage)) },
      { path: 'groups/:id', element: s(createElement(GroupDetailPage)) },
      { path: 'posts/create', element: s(createElement(CreatePostPage)) },
      { path: 'posts/:id', element: s(createElement(PostDetailPage)) },
      { path: 'posts/:id/edit', element: s(createElement(CreatePostPage)) },
      { path: 'search', element: s(createElement(SearchResultsPage)) },
    ],
  },

  // Auth Routes
  {
    path: '/auth',
    element: createElement(AuthLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'login', replace: true }) },
      { path: 'login', element: s(createElement(LoginPage)) },
      { path: 'register', element: s(createElement(RegisterPage)) },
    ],
  },

  // Merchant Routes
  {
    path: '/merchant',
    element: createElement(MerchantLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'workbench', replace: true }) },
      { path: 'workbench', element: s(createElement(MerchantWorkbench)) },
      { path: 'product/list', element: s(createElement(MerchantProductList)) },
      { path: 'product/create', element: s(createElement(MerchantProductDetail)) },
      { path: 'product/edit/:id', element: s(createElement(MerchantProductDetail)) },
      { path: 'order/list', element: s(createElement(MerchantOrderList)) },
      { path: 'account', element: s(createElement(MerchantAccount)) },
      { path: 'settings', element: s(createElement(MerchantSettings)) },
      { path: 'messages', element: s(createElement(MerchantMessageList)) },
      { path: 'messages/:partnerUserId', element: s(createElement(MerchantChatPage)) },
      { path: 'community', element: s(createElement(MerchantCommunityPage)) },
      { path: 'marketing/promotions', element: s(createElement(PromotionListPage)) },
      { path: 'marketing/promotions/create', element: s(createElement(PromotionCreatePage)) },
      { path: 'marketing/promotions/:id/edit', element: s(createElement(PromotionCreatePage)) },
      { path: 'reviews', element: s(createElement(MerchantReviewPage)) },
    ],
  },

  // Admin Routes
  {
    path: '/admin',
    element: createElement(AdminLayout),
    children: [
      { index: true, element: createElement(Navigate, { to: 'dashboard', replace: true }) },
      { path: 'dashboard', element: s(createElement(AdminDashboard)) },
      { path: 'community', element: s(createElement(AdminCommunityPage)) },
      { path: 'users', element: s(createElement(AdminUsersPage)) },
      { path: 'products', element: s(createElement(AdminProductsPage)) },
      { path: 'categories', element: s(createElement(AdminCategoriesPage)) },
      { path: 'reports', element: s(createElement(AdminReportsPage)) },
      { path: 'content', element: s(createElement(AdminContentPage)) },
      { path: 'banners', element: s(createElement(AdminBannersPage)) },
      { path: 'logs', element: s(createElement(AdminLogsPage)) },
      { path: 'coupons', element: s(createElement(AdminCouponListPage)) },
    ],
  },
])
