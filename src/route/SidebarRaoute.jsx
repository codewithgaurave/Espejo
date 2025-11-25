// src/routes/index.js
import { lazy } from "react";
import {
  FaCoins,
  FaUsers,
  FaBox,
  FaGavel,
  FaTachometerAlt,
  FaClipboardList,
  FaQuestionCircle,
  FaChartBar,
  FaMapMarkerAlt,
  FaShoppingCart,
  FaEnvelopeOpenText,
  FaImages, // 👈 slider icon
} from "react-icons/fa";

// pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Categories = lazy(() => import("../pages/Categories"));
const Products = lazy(() => import("../pages/Products"));
const Offers = lazy(() => import("../pages/Offers"));
const Orders = lazy(() => import("../pages/Orders"));
const Enquiries = lazy(() => import("../pages/Enquiries"));
const Sliders = lazy(() => import("../pages/Sliders")); // 👈 new

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  { path: "/categories", component: Categories, name: "Categories", icon: FaBox },
  { path: "/products", component: Products, name: "Products", icon: FaBox },
  { path: "/offers", component: Offers, name: "Offers", icon: FaCoins },
  { path: "/orders", component: Orders, name: "Orders", icon: FaShoppingCart },
  { path: "/enquiries", component: Enquiries, name: "Enquiries", icon: FaEnvelopeOpenText },
  { path: "/sliders", component: Sliders, name: "Sliders", icon: FaImages }, // 👈 new route
];

export default routes;
