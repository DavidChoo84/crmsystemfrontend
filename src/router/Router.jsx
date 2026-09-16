import { useRoutes, Navigate, Outlet, useOutletContext} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Project from "../pages/Project";
import ProductList from "../pages/ProductList";
import MemberAssignment from "../pages/MemberAssignment";
import Order from "../pages/Order";
import Customer from "../pages/CustomerList";
import ProjectRedirect from "../components/ProjectRedirect";
import PackageList from "../pages/PackageList";
import Register from "../pages/Register";
import { Login } from "../pages/Login";
import { ResetPassword } from "../pages/ResetPassword";
import ProjectTarget from "../pages/ProjectTarget";
import Reports from "../pages/Reports";
import ProjectMembers from "../pages/ProjectMembers";

const AuthGuard = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const context = useOutletContext(); // 🔑 Catch context from upstream

  return token && user ? <Outlet context={context} /> : <Navigate to="/login" replace />;
};

const RoleGuard = ({ allowedRoles }) => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const context = useOutletContext(); // 🔑 Catch context from MainLayout

  return user && allowedRoles.includes(user.role) ? (
    <Outlet context={context} /> // 🔑 Forward it safely to ProjectRedirect and other pages!
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
      path: "/reset-password",
      element: <ResetPassword />,
    },

    // 🔒 AUTHENTICATED WRAPPER LAYER
    {
      element: <AuthGuard />,
      children: [
        {
          element: <MainLayout />,
          children: [
            // 🌎 Shared Routes (All authorized roles: master, logistic, cs_pc)
            { 
              element: <RoleGuard allowedRoles={["master", "logistic", "cs_pc"]} />, 
              children: [
                { path: "/dashboard", element: <Dashboard /> }
              ] 
            },
            
            // 🏗️ Project Administration (Restricted to master admin only)
            {
              element: <RoleGuard allowedRoles={["master"]} />,
              children: [
                { path: "/members", element: <MemberAssignment /> },
                { path: "/project/:projectName/members", element: <ProjectMembers /> },
                { path: "/register", element: <Register /> },
              ]
            },
            
            // 📦 Logistics Workflows (Accessible by master & logistic roles)
            {
              element: <RoleGuard allowedRoles={["master", "logistic"]} />,
              children: [
                { path: "/logistic", element: <Order viewMode="logistic" /> },
              ]
            },

            // 🛍️ Customer Service & Sales Management (Accessible by master & cs_pc roles)
            {
              element: <RoleGuard allowedRoles={["master", "cs_pc"]} />,
              children: [
                { path: "/project", element: <ProjectRedirect /> },
                { path: "/project/:projectName", element: <Project /> },
                { path: "/project/:projectName/product-list", element: <ProductList /> },
                { path: "/project/:projectName/package-list", element: <PackageList /> },
                { path: "/project/:projectName/target", element: <ProjectTarget /> },
                { path: "/project/:projectName/reports", element: <Reports /> },
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