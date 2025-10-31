"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import { motion } from "framer-motion";

export default function CategoryPage() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    skuId: "",
    name: "",
    description: "",
    price: "",
    images: [""],
  });

  // 🔹 Fetch products
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, category));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (category) fetchProducts();
  }, [category]);

  // 🔹 Validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    const imageRegex = /\.(jpeg|jpg|png)$/i;

    switch (field) {
      case "skuId":
        if (!value.trim()) newErrors.skuId = "SKU ID is required.";
        else delete newErrors.skuId;
        break;

      case "name":
        if (!value.trim()) newErrors.name = "Product name is required.";
        else delete newErrors.name;
        break;

      case "description":
        if (!value.trim())
          newErrors.description = "Product description is required.";
        else delete newErrors.description;
        break;

      case "price":
        if (!value.trim()) newErrors.price = "Product price is required.";
        else delete newErrors.price;
        break;

      case "image":
        if (!value.trim()) newErrors.image = "Product image URL is required.";
        else if (!imageRegex.test(value))
          newErrors.image = "Only .jpg, .jpeg, and .png image URLs are allowed.";
        else delete newErrors.image;
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleImageChange = (value) => {
    setNewProduct((prev) => ({ ...prev, images: [value] }));
    validateField("image", value);
  };

  const validateAll = () => {
    const newErrors = {};
    const imageUrl = newProduct.images[0].trim();
    const imageRegex = /\.(jpeg|jpg|png)$/i;

    if (!newProduct.skuId.trim()) newErrors.skuId = "SKU ID is required.";
    if (!newProduct.name.trim()) newErrors.name = "Product name is required.";
    if (!newProduct.description.trim())
      newErrors.description = "Product description is required.";
    if (!newProduct.price.trim()) newErrors.price = "Product price is required.";

    if (!imageUrl) {
      newErrors.image = "Product image URL is required.";
    } else if (!imageRegex.test(imageUrl)) {
      newErrors.image = "Only .jpg, .jpeg, and .png image URLs are allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 🔹 Add or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      if (isEditing && editId) {
        const productRef = doc(db, category, editId);
        await updateDoc(productRef, {
          ...newProduct,
          price: Number(newProduct.price),
          updatedAt: new Date(),
        });
        alert("✅ Product updated successfully!");
      } else {
        await addDoc(collection(db, category), {
          ...newProduct,
          price: Number(newProduct.price),
          createdAt: new Date(),
        });
        alert("✅ Product added successfully!");
      }

      setShowForm(false);
      setNewProduct({ skuId: "", name: "", description: "", price: "", images: [""] });
      setErrors({});
      setIsEditing(false);
      setEditId(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  // 🔹 Edit
  const handleEditClick = (product) => {
    setNewProduct({
      skuId: product.skuId || "",
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      images: product.images || [""],
    });
    setIsEditing(true);
    setEditId(product.id);
    setShowForm(true);
  };

  // 🔹 Delete
  const handleDeleteClick = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, category, id));
      alert("🗑️ Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-[#4b3b2a] text-xl font-medium">
        Loading {category} products...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f3] to-[#efe5d9] p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-[#4b3b2a] capitalize tracking-wide">
          {category} Products
        </h1>
        <button
          onClick={() => {
            setShowForm(true);
            setIsEditing(false);
            setEditId(null);
            setNewProduct({
              skuId: "",
              name: "",
              description: "",
              price: "",
              images: [""],
            });
          }}
          className="bg-gradient-to-r from-[#b88a44] to-[#e5c17c] text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-transform hover:scale-105"
        >
          + Add Product
        </button>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <p className="text-center text-[#7c6f62] text-lg italic">
          No products found.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                />
                <div className="absolute top-2 right-2 bg-[#faf7f3]/70 backdrop-blur-md px-3 py-1 text-sm rounded-full text-[#4b3b2a] font-semibold shadow-sm">
                  ₹{product.price}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-[#3b2f2f] mb-1">
                  {product.name}
                </h3>
                <p className="text-[#7b6b6b] text-sm mb-1">
                  <strong>SKU:</strong> {product.skuId || "—"}
                </p>
                <p className="text-[#7b6b6b] text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEditClick(product)}
                    className="flex-1 bg-[#e5c17c] text-white py-2 rounded-lg hover:bg-[#b88a44] transition"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(product.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-[600px] relative border border-[#e5c17c]/40"
          >
            <button
              onClick={() => setShowForm(false)}
              type="button"
              className="absolute top-3 right-4 text-gray-500 hover:text-red-500 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-bold mb-6 text-[#4b3b2a] text-center">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>

            <div className="space-y-5">
              {[
                { label: "SKU ID", key: "skuId", type: "text" },
                { label: "Product Name", key: "name", type: "text" },
                { label: "Product Description", key: "description", type: "textarea" },
                { label: "Price", key: "price", type: "number" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block font-medium text-[#4b3b2a] mb-1">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  {type === "textarea" ? (
                    <textarea
                      placeholder={label}
                      value={newProduct[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full border border-[#d6c3a9] p-3 rounded-lg h-28 resize-none focus:ring-2 focus:ring-[#b88a44] outline-none placeholder:text-[#7b6b6b] text-[#4b3b2a]"
                    />
                  ) : (
                    <input
                      type={type}
                      placeholder={label}
                      value={newProduct[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="w-full border border-[#d6c3a9] p-3 rounded-lg focus:ring-2 focus:ring-[#b88a44] outline-none placeholder:text-[#7b6b6b] text-[#4b3b2a]"
                    />
                  )}
                  {errors[key] && (
                    <p className="text-red-500 text-sm mt-1">{errors[key]}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block font-medium text-[#4b3b2a] mb-1">
                  Image URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Image URL (e.g. https://i.ibb.co/xyz.jpg)"
                  value={newProduct.images[0]}
                  onChange={(e) => handleImageChange(e.target.value)}
                  className="w-full border border-[#d6c3a9] p-3 rounded-lg focus:ring-2 focus:ring-[#b88a44] outline-none placeholder:text-[#7b6b6b] text-[#4b3b2a]"
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 w-full bg-gradient-to-r from-[#b88a44] to-[#e5c17c] text-white py-3 rounded-xl text-lg font-semibold shadow-md hover:shadow-lg transition-transform hover:scale-[1.02]"
            >
              {isEditing ? "Update Product" : "Add Product"}
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
}
