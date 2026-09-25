import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";

// Code splitting: Lazy load secondary pages to avoid bundling heavy dependencies (e.g. Quill, Supabase) on initial load
const ArchitecturePage = lazy(() => import("../pages/ArchitecturePage"));
const AwardsPage = lazy(() => import("../pages/AwardsPage"));
const AwardDetailPage = lazy(() => import("../pages/AwardDetailPage"));
const PrivacyPolicy = lazy(() => import("../pages/PrivacyPolicy"));
const NewsList = lazy(() => import("../pages/NewsList"));
const NewsDetail = lazy(() => import("../pages/NewsDetail"));
const UploadNews = lazy(() => import("../pages/UploadNews"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const AccountManagement = lazy(() => import("../pages/AccountManagement"));
const ManageNews = lazy(() => import("../pages/ManageNews"));
const ManageCooperation = lazy(() => import("../pages/ManageCooperation"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/architecture", element: <ArchitecturePage /> },
      { path: "/giai-thuong", element: <AwardsPage /> },
      { path: "/giai-thuong/:id", element: <AwardDetailPage /> },
      // Legacy English URLs: keep old shared links working
      { path: "/awards", element: <Navigate to="/giai-thuong" replace /> },
      { path: "/awards/:id", element: <AwardDetailPage /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/chinh-sach-bao-mat", element: <PrivacyPolicy /> },
      { path: "/news", element: <NewsList /> },
      { path: "/news/:id", element: <NewsDetail /> },
      { path: "/news/create", element: <UploadNews /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/admin/accounts", element: <AccountManagement /> },
      { path: "/admin/news", element: <ManageNews /> },
      { path: "/admin/cooperation", element: <ManageCooperation /> },
    ]
  },
]);