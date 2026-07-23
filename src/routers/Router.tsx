import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage";
import UploadNews from "../pages/UploadNews";
import NewsList from "../pages/NewsList";
import NewsDetail from "../pages/NewsDetail";
import Login from "../pages/Login";
import AccountManagement from "../pages/AccountManagement";
import ManageNews from "../pages/ManageNews";

import ArchitecturePage from "../pages/ArchitecturePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/architecture", element: <ArchitecturePage /> },
      { path: "/news", element: <NewsList /> },
      { path: "/news/:id", element: <NewsDetail /> },
      { path: "/news/create", element: <UploadNews /> },
      { path: "/login", element: <Login /> },
      { path: "/admin/accounts", element: <AccountManagement /> },
      { path: "/admin/news", element: <ManageNews /> }
    ]
  },
]);