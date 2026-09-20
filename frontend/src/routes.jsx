import { createBrowserRouter } from "react-router-dom";

import { Layout } from "./components/Layout";
import { RequireAuth } from "./components/RequireAuth";
import { About } from "./pages/About";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { PostDetail } from "./pages/PostDetail";
import { PostEditor } from "./pages/PostEditor";
import { Studio } from "./pages/Studio";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:slug", element: <PostDetail /> },
      { path: "contact", element: <Contact /> },
      { path: "login", element: <Login /> },
      {
        path: "studio",
        element: (
          <RequireAuth>
            <Studio />
          </RequireAuth>
        ),
      },
      {
        path: "studio/new",
        element: (
          <RequireAuth>
            <PostEditor />
          </RequireAuth>
        ),
      },
      {
        path: "studio/:slug",
        element: (
          <RequireAuth>
            <PostEditor />
          </RequireAuth>
        ),
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
