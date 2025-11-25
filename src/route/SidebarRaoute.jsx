import { lazy } from "react";
import {
  FaCoins,
  FaUsers,
  FaBox,
  FaTachometerAlt,
  FaShoppingCart,
  FaEnvelopeOpenText,
  FaImages,
  FaKey,         // 🔐 NEW icon
} from "react-icons/fa";

// pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Categories = lazy(() => import("../pages/Categories"));
const Products = lazy(() => import("../pages/Products"));
const Offers = lazy(() => import("../pages/Offers"));
const Orders = lazy(() => import("../pages/Orders"));
const Enquiries = lazy(() => import("../pages/Enquiries"));
const Sliders = lazy(() => import("../pages/Sliders"));
const ChangePassword = lazy(() => import("../pages/ChangePassword"));   // NEW

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  { path: "/categories", component: Categories, name: "Categories", icon: FaBox },
  { path: "/products", component: Products, name: "Products", icon: FaBox },
  { path: "/offers", component: Offers, name: "Offers", icon: FaCoins },
  { path: "/orders", component: Orders, name: "Orders", icon: FaShoppingCart },
  { path: "/enquiries", component: Enquiries, name: "Enquiries", icon: FaEnvelopeOpenText },
  { path: "/sliders", component: Sliders, name: "Sliders", icon: FaImages },
  { path: "/change-password", component: ChangePassword, name: "Change Password", icon: FaKey }, // NEW
];

export default routes;
