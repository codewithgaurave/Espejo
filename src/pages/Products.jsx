// src/pages/Products.jsx
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../apis/categories";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../apis/products";
import {
  FaBoxOpen,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaSearch,
  FaImage,
  FaTable,
  FaThLarge,
  FaToggleOn,
  FaToggleOff,
  FaEye,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

// ---------- helpers ----------
const fmtNum = (n) =>
  typeof n === "number" ? n.toLocaleString("en-IN") : n ?? "-";

const fmtCurrency = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
    : n ?? "-";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN") : "-";

const emptyForm = {
  name: "",
  price: "",
  discountPercent: "",
  categoryId: "",
  description: "",
  about: "",
  isActive: true,
};

export default function Products() {
  const { themeColors } = useTheme();
  const { currentFont } = useFont();
  const { isLoggedIn } = useAuth();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null); // product being edited
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);

  // NEW: dynamic lists
  const [sizesList, setSizesList] = useState([""]);
  const [colorsList, setColorsList] = useState([""]);
  const [featuresList, setFeaturesList] = useState([""]); // New Features list
  const [addOns, setAddOns] = useState([
    { name: "", price: "", isDefault: true },
  ]);

  // NEW: Specifications state
  const [specs, setSpecs] = useState({
    brand: "",
    weight: "",
    material: "",
    installation: "",
    warranty: "",
    frameType: "",
    dimensions: "",
    glassType: "",
  });

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" | "card"

  // NEW: full view modal product
  const [viewProduct, setViewProduct] = useState(null);

  // ---------- fetchers ----------
  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const list = Array.isArray(res) ? res : res.categories || [];
      setCategories(list);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const list = await listProducts();
      setProducts(list);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // categoryId -> name map
  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      const id = c._id || c.id;
      if (id) map[id] = c.name;
    });
    return map;
  }, [categories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setMainImageFile(null);
    setGalleryImageFiles([]);
    setSizesList([""]);
    setColorsList([""]);
    setFeaturesList([""]);
    setAddOns([{ name: "", price: "", isDefault: true }]);
    setSpecs({
      brand: "",
      weight: "",
      material: "",
      installation: "",
      warranty: "",
      frameType: "",
      dimensions: "",
      glassType: "",
    });
  };

  const openAddModal = () => {
    resetForm();
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files?.[0];
    setMainImageFile(file || null);
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setGalleryImageFiles(files);
  };

  // ---------- Sizes dynamic handlers ----------
  const handleSizeChange = (index, value) => {
    setSizesList((prev) =>
      prev.map((s, i) => (i === index ? value : s))
    );
  };

  const handleSizeAddRow = () => {
    setSizesList((prev) => [...prev, ""]);
  };

  const handleSizeRemoveRow = (index) => {
    setSizesList((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---------- Colors dynamic handlers ----------
  const handleColorChange = (index, value) => {
    setColorsList((prev) =>
      prev.map((c, i) => (i === index ? value : c))
    );
  };

  const handleColorAddRow = () => {
    setColorsList((prev) => [...prev, ""]);
  };

  const handleColorRemoveRow = (index) => {
    setColorsList((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---------- Features dynamic handlers ----------
  const handleFeatureChange = (index, value) => {
    setFeaturesList((prev) =>
      prev.map((f, i) => (i === index ? value : f))
    );
  };

  const handleFeatureAddRow = () => {
    setFeaturesList((prev) => [...prev, ""]);
  };

  const handleFeatureRemoveRow = (index) => {
    setFeaturesList((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---------- Specifications handler ----------
  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setSpecs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------- Add-ons handlers ----------
  const handleAddOnChange = (index, field, value) => {
    setAddOns((prev) =>
      prev.map((item, i) => {
        if (i !== index) {
          if (field === "isDefault" && value) {
            return { ...item, isDefault: false };
          }
          return item;
        }
        if (field === "isDefault") {
          return { ...item, isDefault: value };
        }
        return { ...item, [field]: value };
      })
    );
  };

  const handleAddOnAddRow = () => {
    setAddOns((prev) => [
      ...prev,
      { name: "", price: "", isDefault: prev.length === 0 },
    ]);
  };

  const handleAddOnRemoveRow = (index) => {
    setAddOns((prev) => {
      if (prev.length === 1) {
        return [{ name: "", price: "", isDefault: true }];
      }
      const filtered = prev.filter((_, i) => i !== index);
      if (!filtered.some((a) => a.isDefault) && filtered.length > 0) {
        filtered[0].isDefault = true;
      }
      return [...filtered];
    });
  };

  const handleEdit = (prod) => {
    setEditing(prod);
    setForm({
      name: prod.name || "",
      price:
        typeof prod.price === "number"
          ? String(prod.price)
          : prod.price || "",
      discountPercent:
        typeof prod.discountPercent === "number"
          ? String(prod.discountPercent)
          : prod.discountPercent || "",
      categoryId:
        prod.categoryId?._id ||
        prod.categoryId?.id ||
        prod.categoryId ||
        prod.category?._id ||
        "",
      description: prod.description || "",
      about: prod.about || "",
      isActive:
        typeof prod.isActive === "boolean"
          ? prod.isActive
          : true,
    });

    if (Array.isArray(prod.sizes) && prod.sizes.length) {
      setSizesList(prod.sizes);
    } else {
      setSizesList([""]);
    }

    if (Array.isArray(prod.colors) && prod.colors.length) {
      setColorsList(prod.colors);
    } else {
      setColorsList([""]);
    }

    if (Array.isArray(prod.features) && prod.features.length) {
      setFeaturesList(prod.features);
    } else {
      setFeaturesList([""]);
    }

    if (prod.specifications) {
      setSpecs({
        brand: prod.specifications.brand || "",
        weight: prod.specifications.weight || "",
        material: prod.specifications.material || "",
        installation: prod.specifications.installation || "",
        warranty: prod.specifications.warranty || "",
        frameType: prod.specifications.frameType || "",
        dimensions: prod.specifications.dimensions || "",
        glassType: prod.specifications.glassType || "",
      });
    } else {
      setSpecs({
        brand: "",
        weight: "",
        material: "",
        installation: "",
        warranty: "",
        frameType: "",
        dimensions: "",
        glassType: "",
      });
    }

    if (Array.isArray(prod.addOns) && prod.addOns.length) {
      setAddOns(
        prod.addOns.map((a) => ({
          name: a.name || "",
          price:
            typeof a.price === "number"
              ? String(a.price)
              : a.price || "",
          isDefault: !!a.isDefault,
        }))
      );
    } else {
      setAddOns([{ name: "", price: "", isDefault: true }]);
    }

    setMainImageFile(null);
    setGalleryImageFiles([]);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("price", form.price.trim());

    if (form.discountPercent?.trim() !== "") {
      fd.append("discountPercent", form.discountPercent.trim());
    }

    if (form.categoryId) {
      fd.append("categoryId", form.categoryId);
    }

    const cleanSizes = sizesList
      .map((s) => s.trim())
      .filter((s) => s.length);
    if (cleanSizes.length) {
      fd.append("sizes", JSON.stringify(cleanSizes));
    }

    const cleanColors = colorsList
      .map((c) => c.trim())
      .filter((c) => c.length);
    if (cleanColors.length) {
      fd.append("colors", JSON.stringify(cleanColors));
    }

    const cleanFeatures = featuresList
      .map((f) => f.trim())
      .filter((f) => f.length);
    if (cleanFeatures.length) {
      fd.append("features", JSON.stringify(cleanFeatures));
    }

    const cleanSpecs = {};
    let hasSpecs = false;
    Object.keys(specs).forEach((key) => {
      if (specs[key].trim()) {
        cleanSpecs[key] = specs[key].trim();
        hasSpecs = true;
      }
    });
    if (hasSpecs) {
      fd.append("specifications", JSON.stringify(cleanSpecs));
    }

    const cleanedAddOns = addOns
      .filter((a) => a.name.trim())
      .map((a) => ({
        name: a.name.trim(),
        price: Number(a.price) || 0,
        isDefault: !!a.isDefault,
      }));
    if (cleanedAddOns.length) {
      fd.append("addOns", JSON.stringify(cleanedAddOns));
    }

    if (form.description.trim()) {
      fd.append("description", form.description.trim());
    }

    if (form.about.trim()) {
      fd.append("about", form.about.trim());
    }

    fd.append("isActive", String(form.isActive));

    if (mainImageFile) {
      fd.append("mainImage", mainImageFile);
    }

    if (galleryImageFiles?.length) {
      galleryImageFiles.forEach((file) =>
        fd.append("galleryImages", file)
      );
    }

    return fd;
  };

  const handleDelete = async (prod) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to delete products.");
      return;
    }

    const idOrSlug = prod.slug || prod._id || prod.id;
    if (!idOrSlug) {
      setError("Cannot delete this product (missing identifier).");
      return;
    }

    const result = await Swal.fire({
      title: `Delete product "${prod.name}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e02424",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await deleteProduct(idOrSlug);
      setSuccess("Product deleted successfully.");
      await fetchProducts();
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Product deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to delete product.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // NEW: Active/Inactive toggle handler
  const handleToggleStatus = async (prod) => {
    if (!isLoggedIn) {
      setError("You must be logged in as admin to change status.");
      return;
    }

    const idOrSlug = prod.slug || prod._id || prod.id;
    if (!idOrSlug) {
      setError("Cannot update this product (missing identifier).");
      return;
    }

    const newStatus = !prod.isActive;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await updateProduct(idOrSlug, { isActive: newStatus });

      // Local state update so row/card list se gayab na ho
      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id || p.slug) === (prod._id || prod.id || prod.slug)
            ? { ...p, isActive: newStatus }
            : p
        )
      );

      setSuccess(
        `Product ${newStatus ? "activated" : "deactivated"} successfully.`
      );

      Swal.fire({
        icon: "success",
        title: newStatus ? "Activated" : "Deactivated",
        text: `Product ${newStatus ? "activated" : "deactivated"} successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to update product status.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  // NEW: View full product handler
  const handleView = (prod) => {
    setViewProduct(prod);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError("You must be logged in as admin to manage products.");
      return;
    }

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.price.trim()) {
      setError("Price is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const fd = buildFormData();

      if (editing) {
        const idOrSlug = editing.slug || editing._id || editing.id;
        if (!idOrSlug) {
          throw new Error("Missing product identifier for update.");
        }
        await updateProduct(idOrSlug, fd);
        setSuccess("Product updated successfully.");
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Product updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await createProduct(fd);
        setSuccess("Product created successfully.");
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Product created successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      resetForm();
      setIsModalOpen(false);
      await fetchProducts();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Failed to save product.";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const catName =
        p.category?.name ||
        p.categoryId?.name ||
        categoryMap[p.categoryId] ||
        "";
      return (
        name.includes(q) ||
        desc.includes(q) ||
        String(catName).toLowerCase().includes(q)
      );
    });
  }, [products, search, categoryMap]);

  const getFinalPrice = (p) => {
    if (typeof p.finalPrice === "number") return p.finalPrice;
    if (typeof p.price === "number" && p.discountPercent) {
      const discount =
        (p.price * Number(p.discountPercent || 0)) / 100;
      return p.price - discount;
    }
    return p.price;
  };

  return (
    <div
      className="space-y-6"
      style={{ fontFamily: currentFont.family }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-bold flex items-center gap-2"
            style={{ color: themeColors.text }}
          >
            <FaBoxOpen />
            Products
          </h1>
          <p
            className="text-sm mt-1 opacity-75"
            style={{ color: themeColors.text }}
          >
            Manage your e-commerce products, pricing, categories and
            images.
          </p>
        </div>

        {/* Right controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs opacity-70">
              <FaSearch style={{ color: themeColors.text }} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-8 pr-3 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                color: themeColors.text,
              }}
            />
          </div>

          <button
            onClick={fetchProducts}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-2"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              color: themeColors.text,
            }}
            title="Refresh"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          {/* View toggle */}
          <div
            className="flex items-center rounded-lg overflow-hidden border text-sm"
            style={{ borderColor: themeColors.border }}
          >
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 flex items-center gap-1 ${
                viewMode === "table" ? "" : "opacity-70"
              }`}
              style={{
                backgroundColor:
                  viewMode === "table"
                    ? themeColors.surface
                    : "transparent",
                color: themeColors.text,
              }}
            >
              <FaTable />{" "}
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-2 flex items-center gap-1 border-l`}
              style={{
                borderColor: themeColors.border,
                backgroundColor:
                  viewMode === "card"
                    ? themeColors.surface
                    : "transparent",
                opacity: viewMode === "card" ? 1 : 0.7,
                color: themeColors.text,
              }}
            >
              <FaThLarge />{" "}
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            disabled={!isLoggedIn}
            className="px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.onPrimary,
            }}
            title={
              isLoggedIn ? "Add new product" : "Login as admin to add"
            }
          >
            <FaPlus />
            Add Product
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || success || !isLoggedIn) && (
        <div className="space-y-2">
          {error && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor: themeColors.danger + "15",
                borderColor: themeColors.danger + "50",
                color: themeColors.danger,
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor:
                  (themeColors.success || themeColors.primary) +
                  "15",
                borderColor:
                  (themeColors.success || themeColors.primary) +
                  "50",
                color:
                  themeColors.success || themeColors.primary,
              }}
            >
              {success}
            </div>
          )}
          {!isLoggedIn && (
            <div
              className="p-3 rounded-lg text-sm border"
              style={{
                backgroundColor:
                  (themeColors.warning || themeColors.primary) +
                  "15",
                borderColor:
                  (themeColors.warning || themeColors.primary) +
                  "50",
                color:
                  themeColors.warning || themeColors.primary,
              }}
            >
              You are viewing products as public. Login as admin to
              add, edit, or delete products.
            </div>
          )}
        </div>
      )}

      {/* Products list: table / card */}
      <div
        className="p-6 rounded-xl border"
        style={{
          backgroundColor: themeColors.surface,
          borderColor: themeColors.border,
        }}
      >
        <h2
          className="text-lg font-semibold mb-4 flex items-center justify-between"
          style={{ color: themeColors.text }}
        >
          <span className="flex items-center gap-2">
            <FaBoxOpen />
            {viewMode === "table" ? "Product List" : "Product Cards"}
          </span>
          <span className="text-xs opacity-70">
            {filteredProducts.length} of {products.length} shown
          </span>
        </h2>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    backgroundColor: themeColors.background + "30",
                  }}
                >
                  {[
                    "Name",
                    "Category",
                    "Price",
                    "Discount",
                    "Status",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: themeColors.text }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: themeColors.border }}
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm"
                      style={{ color: themeColors.text }}
                    >
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm"
                      style={{ color: themeColors.text }}
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const catName =
                      p.category?.name ||
                      p.categoryId?.name ||
                      categoryMap[p.categoryId] ||
                      "-";
                    return (
                      <tr key={p._id || p.id || p.slug}>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {p.name}
                          {p.discountPercent ? (
                            <span className="ml-1 text-xs opacity-60">
                              ({p.discountPercent}% off)
                            </span>
                          ) : null}
                        </td>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {catName}
                        </td>
                        <td
                          className="px-4 py-2"
                          style={{ color: themeColors.text }}
                        >
                          {fmtCurrency(p.price)}
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {p.discountPercent
                            ? `${p.discountPercent}%`
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: p.isActive
                                ? (themeColors.success ||
                                    themeColors.primary) + "15"
                                : themeColors.border,
                              color: p.isActive
                                ? themeColors.success ||
                                  themeColors.primary
                                : themeColors.text,
                            }}
                          >
                            {p.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td
                          className="px-4 py-2 text-xs"
                          style={{ color: themeColors.text }}
                        >
                          {p.createdAt ? fmtDate(p.createdAt) : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            {/* Active/Inactive Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              disabled={!isLoggedIn || saving}
                              className="p-2 rounded-lg border text-xs disabled:opacity-40"
                              style={{
                                borderColor: themeColors.border,
                                color: p.isActive
                                  ? themeColors.warning || "#f59e0b"
                                  : themeColors.success ||
                                    themeColors.primary,
                              }}
                              title={
                                isLoggedIn
                                  ? p.isActive
                                    ? "Mark as Inactive"
                                    : "Mark as Active"
                                  : "Login as admin to change status"
                              }
                            >
                              {p.isActive ? (
                                <FaToggleOn />
                              ) : (
                                <FaToggleOff />
                              )}
                            </button>

                            {/* View Button */}
                            <button
                              type="button"
                              onClick={() => handleView(p)}
                              className="p-2 rounded-lg border text-xs"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.text,
                              }}
                              title="View full details"
                            >
                              <FaEye />
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEdit(p)}
                              disabled={!isLoggedIn}
                              className="p-2 rounded-lg border text-xs disabled:opacity-40"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.text,
                              }}
                              title={
                                isLoggedIn
                                  ? "Edit"
                                  : "Login as admin to edit"
                              }
                            >
                              <FaEdit />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={!isLoggedIn || saving}
                              className="p-2 rounded-lg border text-xs disabled:opacity-40"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.danger,
                              }}
                              title={
                                isLoggedIn
                                  ? "Delete"
                                  : "Login as admin to delete"
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // CARD VIEW
          <div>
            {loading ? (
              <p
                className="text-sm text-center py-6"
                style={{ color: themeColors.text }}
              >
                Loading products...
              </p>
            ) : filteredProducts.length === 0 ? (
              <p
                className="text-sm text-center py-6"
                style={{ color: themeColors.text }}
              >
                No products found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProducts.map((p) => {
                  const catName =
                    p.category?.name ||
                    p.categoryId?.name ||
                    categoryMap[p.categoryId] ||
                    "-";
                  const finalPrice = getFinalPrice(p);
                  return (
                    <div
                      key={p._id || p.id || p.slug}
                      className="rounded-xl border flex flex-col overflow-hidden"
                      style={{ borderColor: themeColors.border }}
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={
                            p.mainImage?.url ||
                            p.galleryImages?.[0]?.url ||
                            ""
                          }
                          alt={p.name}
                          className="w-full h-40 object-cover"
                        />
                        {p.discountPercent ? (
                          <span
                            className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor:
                                themeColors.primary + "dd",
                              color: themeColors.onPrimary,
                            }}
                          >
                            {p.discountPercent}% OFF
                          </span>
                        ) : null}
                        {!p.isActive && (
                          <span
                            className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor:
                                themeColors.danger + "dd",
                              color: themeColors.onPrimary,
                            }}
                          >
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className="p-4 flex-1 flex flex-col gap-2"
                        style={{ backgroundColor: themeColors.surface }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className="font-semibold text-sm mb-1"
                              style={{ color: themeColors.text }}
                            >
                              {p.name}
                            </h3>
                            <p
                              className="text-xs opacity-75"
                              style={{ color: themeColors.text }}
                            >
                              {catName}
                            </p>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-sm font-bold"
                              style={{ color: themeColors.primary }}
                            >
                              {fmtCurrency(finalPrice)}
                            </div>
                            {p.discountPercent ? (
                              <div className="text-[11px] opacity-70 line-through">
                                {fmtCurrency(p.price)}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {p.description && (
                          <p
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: themeColors.text }}
                          >
                            {p.description}
                          </p>
                        )}
                        {p.about && (
                          <p
                            className="text-[11px] opacity-70"
                            style={{ color: themeColors.text }}
                          >
                            {p.about}
                          </p>
                        )}

                        {/* Sizes / Colors */}
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Array.isArray(p.sizes) &&
                            p.sizes.map((s) => (
                              <span
                                key={s}
                                className="px-2 py-0.5 rounded-full text-[11px]"
                                style={{
                                  backgroundColor:
                                    themeColors.background + "60",
                                  color: themeColors.text,
                                }}
                              >
                                {s}
                              </span>
                            ))}
                          {Array.isArray(p.colors) &&
                            p.colors.map((c) => (
                              <span
                                key={c}
                                className="px-2 py-0.5 rounded-full text-[11px]"
                                style={{
                                  backgroundColor:
                                    themeColors.background + "60",
                                  color: themeColors.text,
                                }}
                              >
                                {c}
                              </span>
                            ))}
                        </div>

                        {/* Add-ons */}
                        {Array.isArray(p.addOns) &&
                          p.addOns.length > 0 && (
                            <div className="mt-1">
                              <p
                                className="text-[11px] font-semibold mb-1"
                                style={{ color: themeColors.text }}
                              >
                                Add-ons
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {p.addOns.map((a, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full text-[11px]"
                                    style={{
                                      backgroundColor: a.isDefault
                                        ? (themeColors.success ||
                                            themeColors.primary) +
                                          "20"
                                        : themeColors.background + "60",
                                      color: themeColors.text,
                                    }}
                                  >
                                    {a.name}{" "}
                                    {a.price
                                      ? `(+${fmtCurrency(a.price)})`
                                      : ""}
                                    {a.isDefault ? " • Default" : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Gallery thumbnails */}
                        {Array.isArray(p.galleryImages) &&
                          p.galleryImages.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center gap-1 overflow-x-auto">
                                {p.galleryImages.map((g, i) => (
                                  <img
                                    key={i}
                                    src={g.url}
                                    alt={`${p.name} ${i + 1}`}
                                    className="w-10 h-10 object-cover rounded-md flex-shrink-0"
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Footer */}
                        <div className="mt-auto pt-2 flex items-center justify-between text-[11px]">
                          <span
                            style={{ color: themeColors.text }}
                            className="opacity-70"
                          >
                            Created:{" "}
                            {p.createdAt ? fmtDate(p.createdAt) : "-"}
                          </span>
                          <div className="flex items-center gap-2">
                            {/* View button in card */}
                            <button
                              type="button"
                              onClick={() => handleView(p)}
                              className="px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.text,
                              }}
                              title="View full details"
                            >
                              <FaEye /> View
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEdit(p)}
                              disabled={!isLoggedIn}
                              className="px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 disabled:opacity-40"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.text,
                              }}
                              title={
                                isLoggedIn
                                  ? "Edit"
                                  : "Login as admin to edit"
                              }
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={!isLoggedIn || saving}
                              className="px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1 disabled:opacity-40"
                              style={{
                                borderColor: themeColors.border,
                                color: themeColors.danger,
                              }}
                              title={
                                isLoggedIn
                                  ? "Delete"
                                  : "Login as admin to delete"
                              }
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-3xl mx-4 rounded-2xl shadow-lg border max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: themeColors.border }}
            >
              <h2
                className="text-lg font-semibold flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FaPlus />
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-xl leading-none px-2"
                style={{ color: themeColors.text }}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="px-6 py-4 space-y-4 overflow-y-auto"
            >
              {/* inline error */}
              {error && (
                <div
                  className="p-2 rounded-lg text-xs border"
                  style={{
                    backgroundColor: themeColors.danger + "15",
                    borderColor: themeColors.danger + "50",
                    color: themeColors.danger,
                  }}
                >
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                    placeholder="Single Door Cabinet"
                  />
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="categoryId"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="price"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                    placeholder="13395"
                  />
                </div>

                {/* Discount */}
                <div>
                  <label
                    htmlFor="discountPercent"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Discount (%)
                  </label>
                  <input
                    id="discountPercent"
                    name="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={form.discountPercent || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                    placeholder="5"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                    placeholder="Premium LED mirror cabinet"
                  />
                </div>

                {/* About */}
                <div className="md:col-span-2">
                  <label
                    htmlFor="about"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    About
                  </label>
                  <textarea
                    id="about"
                    name="about"
                    value={form.about}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 resize-none"
                    style={{
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                    placeholder="Shatter-proof, energy efficient..."
                  />
                </div>

                {/* Active */}
                <div className="flex items-center gap-2 md:col-span-2">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm"
                    style={{ color: themeColors.text }}
                  >
                    Active
                  </label>
                </div>

                {/* Sizes dynamic UI */}
                <div className="md:col-span-1">
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Sizes
                  </label>
                  <p
                    className="text-[11px] mb-2 opacity-70"
                    style={{ color: themeColors.text }}
                  >
                    e.g. 18x24, 24x24 etc.
                  </p>
                  <div className="space-y-2">
                    {sizesList.map((s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={s}
                          onChange={(e) =>
                            handleSizeChange(idx, e.target.value)
                          }
                          className="flex-1 px-2 py-1 rounded border text-xs"
                          style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                          placeholder="18x24"
                        />
                        <button
                          type="button"
                          onClick={() => handleSizeRemoveRow(idx)}
                          className="px-2 py-1 rounded text-[11px] border"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.danger,
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSizeAddRow}
                    className="mt-2 px-3 py-1 rounded-lg text-xs border flex items-center gap-1"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <FaPlus /> Add Size
                  </button>
                </div>

                {/* Colors dynamic UI */}
                <div className="md:col-span-1">
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Colors
                  </label>
                  <p
                    className="text-[11px] mb-2 opacity-70"
                    style={{ color: themeColors.text }}
                  >
                    e.g. White, Warm White etc.
                  </p>
                  <div className="space-y-2">
                    {colorsList.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={c}
                          onChange={(e) =>
                            handleColorChange(idx, e.target.value)
                          }
                          className="flex-1 px-2 py-1 rounded border text-xs"
                          style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                          placeholder="White"
                        />
                        <button
                          type="button"
                          onClick={() => handleColorRemoveRow(idx)}
                          className="px-2 py-1 rounded text-[11px] border"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.danger,
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleColorAddRow}
                    className="mt-2 px-3 py-1 rounded-lg text-xs border flex items-center gap-1"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <FaPlus /> Add Color
                  </button>
                </div>

                {/* Features dynamic UI */}
                <div className="md:col-span-2">
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Features
                  </label>
                  <p
                    className="text-[11px] mb-2 opacity-70"
                    style={{ color: themeColors.text }}
                  >
                    e.g. Touch Sensor, Anti-fog, Bluetooth etc.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {featuresList.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={f}
                          onChange={(e) =>
                            handleFeatureChange(idx, e.target.value)
                          }
                          className="flex-1 px-2 py-1 rounded border text-xs"
                          style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                          placeholder="Feature description"
                        />
                        <button
                          type="button"
                          onClick={() => handleFeatureRemoveRow(idx)}
                          className="px-2 py-1 rounded text-[11px] border"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.danger,
                          }}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleFeatureAddRow}
                    className="mt-2 px-3 py-1 rounded-lg text-xs border flex items-center gap-1"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <FaPlus /> Add Feature
                  </button>
                </div>

                {/* Specifications Section */}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <h3 className="text-sm font-bold mb-3" style={{ color: themeColors.text }}>
                    Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Brand */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={specs.brand}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="Espezo"
                      />
                    </div>
                    {/* Weight */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Weight
                      </label>
                      <input
                        type="text"
                        name="weight"
                        value={specs.weight}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="5 kg"
                      />
                    </div>
                    {/* Material */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Material
                      </label>
                      <input
                        type="text"
                        name="material"
                        value={specs.material}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="Aluminum, Glass"
                      />
                    </div>
                    {/* Installation */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Installation
                      </label>
                      <input
                        type="text"
                        name="installation"
                        value={specs.installation}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="Wall Mount"
                      />
                    </div>
                    {/* Warranty */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Warranty
                      </label>
                      <input
                        type="text"
                        name="warranty"
                        value={specs.warranty}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="5 Years"
                      />
                    </div>
                    {/* Frame Type */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Frame Type
                      </label>
                      <input
                        type="text"
                        name="frameType"
                        value={specs.frameType}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="Frameless / Framed"
                      />
                    </div>
                    {/* Dimensions */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Dimensions
                      </label>
                      <input
                        type="text"
                        name="dimensions"
                        value={specs.dimensions}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="600mm x 800mm"
                      />
                    </div>
                    {/* Glass Type */}
                    <div>
                      <label
                        className="block mb-1 text-xs font-medium"
                        style={{ color: themeColors.text }}
                      >
                        Glass Type
                      </label>
                      <input
                        type="text"
                        name="glassType"
                        value={specs.glassType}
                        onChange={handleSpecChange}
                        className="w-full px-2 py-1.5 rounded border text-sm"
                        style={{
                          backgroundColor: themeColors.surface,
                          borderColor: themeColors.border,
                          color: themeColors.text,
                        }}
                        placeholder="Saint-Gobain Mirror"
                      />
                    </div>
                  </div>
                </div>

                {/* Add-ons friendly UI */}
                <div className="md:col-span-2">
                  <label
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Add-ons
                  </label>
                  <p
                    className="text-[11px] mb-2 opacity-70"
                    style={{ color: themeColors.text }}
                  >
                    For example: None (0, default), UV Light (+₹499).
                  </p>
                  <div className="space-y-2">
                    {addOns.map((a, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center gap-2 p-2 rounded-lg border"
                        style={{
                          borderColor: themeColors.border,
                          backgroundColor: themeColors.background,
                        }}
                      >
                        <input
                          type="text"
                          placeholder="Name"
                          value={a.name}
                          onChange={(e) =>
                            handleAddOnChange(
                              idx,
                              "name",
                              e.target.value
                            )
                          }
                          className="flex-1 min-w-[120px] px-2 py-1 rounded border text-xs"
                          style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                        />
                        <input
                          type="number"
                          min="0"
                          placeholder="Price"
                          value={a.price}
                          onChange={(e) =>
                            handleAddOnChange(
                              idx,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-24 px-2 py-1 rounded border text-xs"
                          style={{
                            backgroundColor: themeColors.surface,
                            borderColor: themeColors.border,
                            color: themeColors.text,
                          }}
                        />
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={a.isDefault}
                            onChange={(e) =>
                              handleAddOnChange(
                                idx,
                                "isDefault",
                                e.target.checked
                              )
                            }
                          />
                          <span style={{ color: themeColors.text }}>
                            Default
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddOnRemoveRow(idx)}
                          className="px-2 py-1 rounded text-[11px] border"
                          style={{
                            borderColor: themeColors.border,
                            color: themeColors.danger,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddOnAddRow}
                    className="mt-2 px-3 py-1 rounded-lg text-xs border flex items-center gap-1"
                    style={{
                      backgroundColor: themeColors.surface,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    }}
                  >
                    <FaPlus /> Add Add-on
                  </button>
                </div>

                {/* Main Image (pretty input) */}
                <div className="md:col-span-1">
                  <label
                    htmlFor="mainImageInput"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Main Image
                  </label>
                  <label
                    htmlFor="mainImageInput"
                    className="block border-2 border-dashed rounded-lg px-3 py-2 text-xs cursor-pointer flex items-center justify-between"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FaImage />
                      {mainImageFile
                        ? mainImageFile.name
                        : "Click to choose main image"}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full border text-[10px]"
                      style={{ borderColor: themeColors.border }}
                    >
                      Browse
                    </span>
                  </label>
                  <input
                    id="mainImageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </div>

                {/* Gallery Images (pretty input) */}
                <div className="md:col-span-1">
                  <label
                    htmlFor="galleryImagesInput"
                    className="block mb-1 text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    Gallery Images (multiple)
                  </label>
                  <label
                    htmlFor="galleryImagesInput"
                    className="block border-2 border-dashed rounded-lg px-3 py-2 text-xs cursor-pointer flex items-center justify-between"
                    style={{
                      borderColor: themeColors.border,
                      backgroundColor: themeColors.background,
                      color: themeColors.text,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <FaImage />
                      {galleryImageFiles.length
                        ? `${galleryImageFiles.length} file(s) selected`
                        : "Click to choose gallery images"}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full border text-[10px]"
                      style={{ borderColor: themeColors.border }}
                    >
                      Browse
                    </span>
                  </label>
                  <input
                    id="galleryImagesInput"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                  />
                  {galleryImageFiles.length > 0 && (
                    <ul
                      className="mt-1 max-h-20 overflow-y-auto text-[11px]"
                      style={{ color: themeColors.text }}
                    >
                      {galleryImageFiles.map((f, i) => (
                        <li key={i}>{f.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-3 py-2 rounded-lg text-sm border disabled:opacity-50"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !isLoggedIn}
                  className="px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: themeColors.onPrimary,
                  }}
                >
                  {saving
                    ? editing
                      ? "Saving..."
                      : "Creating..."
                    : editing
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL VIEW MODAL */}
      {viewProduct && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div
            className="w-full max-w-4xl mx-4 rounded-2xl shadow-lg border max-h-[90vh] overflow-hidden flex flex-col"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: themeColors.border }}
            >
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: themeColors.text }}
                >
                  {viewProduct.name}
                </h2>
                <span
                  className="px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: viewProduct.isActive
                      ? (themeColors.success ||
                          themeColors.primary) + "15"
                      : themeColors.border,
                    color: viewProduct.isActive
                      ? themeColors.success || themeColors.primary
                      : themeColors.text,
                  }}
                >
                  {viewProduct.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="text-xl leading-none px-2"
                style={{ color: themeColors.text }}
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Images section */}
                <div className="space-y-3">
                  <div
                    className="rounded-lg overflow-hidden border"
                    style={{ borderColor: themeColors.border }}
                  >
                    <img
                      src={
                        viewProduct.mainImage?.url ||
                        viewProduct.galleryImages?.[0]?.url ||
                        ""
                      }
                      alt={viewProduct.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  {Array.isArray(viewProduct.galleryImages) &&
                    viewProduct.galleryImages.length > 0 && (
                      <div>
                        <p
                          className="text-xs mb-2 font-medium"
                          style={{ color: themeColors.text }}
                        >
                          Gallery
                        </p>
                        <div className="flex gap-2 overflow-x-auto">
                          {viewProduct.galleryImages.map((g, i) => (
                            <img
                              key={i}
                              src={g.url}
                              alt={`${viewProduct.name} ${i + 1}`}
                              className="w-16 h-16 object-cover rounded-md flex-shrink-0 border"
                              style={{
                                borderColor: themeColors.border,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Details section */}
                <div className="space-y-3 text-sm">
                  <div>
                    <p
                      className="text-xs uppercase font-semibold mb-1"
                      style={{ color: themeColors.text }}
                    >
                      Pricing
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-lg font-bold"
                        style={{ color: themeColors.primary }}
                      >
                        {fmtCurrency(getFinalPrice(viewProduct))}
                      </span>
                      {viewProduct.discountPercent ? (
                        <>
                          <span className="line-through text-xs opacity-70">
                            {fmtCurrency(viewProduct.price)}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{
                              color:
                                themeColors.success ||
                                themeColors.primary,
                            }}
                          >
                            {viewProduct.discountPercent}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-xs opacity-70">
                          {fmtCurrency(viewProduct.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p
                      className="text-xs uppercase font-semibold mb-1"
                      style={{ color: themeColors.text }}
                    >
                      Category
                    </p>
                    <p style={{ color: themeColors.text }}>
                      {viewProduct.category?.name ||
                        viewProduct.categoryId?.name ||
                        categoryMap[viewProduct.categoryId] ||
                        "-"}
                    </p>
                  </div>

                  {viewProduct.description && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Description
                      </p>
                      <p style={{ color: themeColors.text }}>
                        {viewProduct.description}
                      </p>
                    </div>
                  )}

                  {viewProduct.about && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        About
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: themeColors.text }}
                      >
                        {viewProduct.about}
                      </p>
                    </div>
                  )}

                  {(Array.isArray(viewProduct.sizes) &&
                    viewProduct.sizes.length > 0) && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Sizes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewProduct.sizes.map((s) => (
                          <span
                            key={s}
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{
                              backgroundColor:
                                themeColors.background + "60",
                              color: themeColors.text,
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(Array.isArray(viewProduct.colors) &&
                    viewProduct.colors.length > 0) && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Colors
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewProduct.colors.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{
                              backgroundColor:
                                themeColors.background + "60",
                              color: themeColors.text,
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {(Array.isArray(viewProduct.features) &&
                    viewProduct.features.length > 0) && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Features
                      </p>
                      <ul className="list-disc list-inside text-xs space-y-0.5">
                        {viewProduct.features.map((f, i) => (
                          <li key={i} style={{ color: themeColors.text }}>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {viewProduct.specifications && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Specifications
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border p-2" style={{ borderColor: themeColors.border }}>
                        {Object.entries(viewProduct.specifications).map(([key, val]) => {
                          if (!val) return null;
                          const label = key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase());
                          return (
                            <div key={key} className="text-xs flex justify-between border-b last:border-0 py-1" style={{ borderColor: themeColors.border }}>
                              <span
                                className="font-medium opacity-80"
                                style={{ color: themeColors.text }}
                              >
                                {label}
                              </span>
                              <span
                                className="font-semibold text-right"
                                style={{ color: themeColors.text }}
                              >
                                {val}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(Array.isArray(viewProduct.addOns) &&
                    viewProduct.addOns.length > 0) && (
                    <div>
                      <p
                        className="text-xs uppercase font-semibold mb-1"
                        style={{ color: themeColors.text }}
                      >
                        Add-ons
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {viewProduct.addOns.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[11px]"
                            style={{
                              backgroundColor: a.isDefault
                                ? (themeColors.success ||
                                    themeColors.primary) + "20"
                                : themeColors.background + "60",
                              color: themeColors.text,
                            }}
                          >
                            {a.name}{" "}
                            {a.price
                              ? `(+${fmtCurrency(a.price)})`
                              : ""}
                            {a.isDefault ? " • Default" : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 text-xs opacity-70 space-y-1">
                    <p style={{ color: themeColors.text }}>
                      Created:{" "}
                      {viewProduct.createdAt
                        ? fmtDate(viewProduct.createdAt)
                        : "-"}
                    </p>
                    {viewProduct.updatedAt && (
                      <p style={{ color: themeColors.text }}>
                        Updated: {fmtDate(viewProduct.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom actions (optional quick actions) */}
              <div className="flex justify-end gap-2 pt-2">
                {isLoggedIn && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleEdit(viewProduct);
                        setViewProduct(null);
                      }}
                      className="px-3 py-2 rounded-lg text-xs border flex items-center gap-1"
                      style={{
                        backgroundColor: themeColors.surface,
                        borderColor: themeColors.border,
                        color: themeColors.text,
                      }}
                    >
                      <FaEdit /> Edit
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setViewProduct(null)}
                  className="px-3 py-2 rounded-lg text-xs border"
                  style={{
                    backgroundColor: themeColors.surface,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
