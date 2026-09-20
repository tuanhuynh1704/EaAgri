import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import UploadNews from "../pages/UploadNews";
import NewsList from "../pages/NewsList";
import NewsDetail from "../pages/NewsDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import AccountManagement from "../pages/AccountManagement";
import ManageNews from "../pages/ManageNews";
import ManageCooperation from "../pages/ManageCooperation";

import ArchitecturePage from "../pages/ArchitecturePage";
import PrivacyPolicy from "../pages/PrivacyPolicy";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/architecture", element: <ArchitecturePage /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/privacy-policy", element: <PrivacyPolicy /> },
      { path: "/chinh-sach-bao-mat", element: <PrivacyPolicy /> },
      { path: "/tintuc", element: <NewsList /> },
      { path: "/tintuc/:id", element: <NewsDetail /> },
      { path: "/tintuc/create", element: <UploadNews /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/admin/accounts", element: <AccountManagement /> },
      { path: "/admin/tintuc", element: <ManageNews /> },
      { path: "/admin/cooperation", element: <ManageCooperation /> },
    ]
  },
]);