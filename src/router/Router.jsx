import { useRoutes, Navigate, Outlet } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProductList from "../pages/ProductList";
import MemberAssignment from "../pages/MemberAssignment";
import Order from "../pages/Order";
import Customer from "../pages/CustomerList";
import ProjectRedirect from "../components/ProjectRedirect";
import PackageList from "../pages/PackageList";
import { Login } from "../pages/Login";

const AuthGuard = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  return token && user ? <Outlet /> : <Navigate to="/login" replace />;
};

const RoleGuard = ({ allowedRoles }) => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  return user && allowedRoles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
};

const Router = () => {
  return useRoutes([
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    
    {
      path: "/login",
      element: <Login />,
    },

    {
      element: <AuthGuard />,
      children: [
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
            
            { path: "/logistic", element: <Order viewMode="logistic" /> },

            {
              element: <RoleGuard allowedRoles={["master"]} />,
              children: [
                { path: "/members", element: <MemberAssignment /> },
                { path: "/orders", element: <Order viewMode="orders" /> },
                { path: "/customers", element: <Customer /> },
              ],
            },
          ],
        },
      ],
    },

    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ]);
};

export default Router;