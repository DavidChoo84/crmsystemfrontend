// src/router/Router.jsx
import { useRoutes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProductList from "../pages/ProductList";
import MemberAssignment from "../pages/MemberAssignment";
import Order from "../pages/Order";
import Customer from "../pages/CustomerList";
import ProjectRedirect from "../components/ProjectRedirect";
import PackageList from "../pages/PackageList";

const Router = () => {
  return useRoutes([
    {
      element: <MainLayout />,
      children: [
        { path: "/dashboard", element: <Dashboard /> },

        {
          path: "/project",
          element: <ProjectRedirect />,
        },
        
        {
          path: "/project/:projectName",
          element: <Project />,
        },

        {
        path: "/project/:projectName/product-list",
        element: <ProductList />,
        },

        {
        path: "/project/:projectName/package-list",
        element: <PackageList />,
        },

        { path: "/members", element: <MemberAssignment /> },
        { path: "/orders", element: <Order /> },
        { path: "/customers", element: <Customer /> },
      ],
    },
  ]);
};

export default Router;
