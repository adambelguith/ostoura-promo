import { useEffect, useState, Fragment } from "react";
import axios from "axios";
import {
  Select,
  MenuItem,
  ListSubheader,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function CategoryModal({ category, onClose, onSave }) {
  const [nameFr, setNameFr] = useState(category?.name_fr || "");
  const [nameAr, setNameAr] = useState(category?.name_ar || "");
  const [descriptionFr, setDescriptionFr] = useState(
    category?.description_fr || ""
  );
  const [descriptionAr, setDescriptionAr] = useState(
    category?.description_ar || ""
  );
  const [status, setStatus] = useState(category?.status || "pending");
  const [sellerId, setSellerId] = useState(category?.sellerId || null);
  const [parentCategoryId, setParentCategoryId] = useState(
    category?.id_fathercategory || null
  );
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: usersData } = await axios.get("/api/admin/users");
        setUsers(usersData);

        const { data: categoriesData } = await axios.get(
          "/api/admin/categories"
        );
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCategory = {
      name_fr: nameFr,
      name_ar: nameAr,
      description_fr: descriptionFr,
      description_ar: descriptionAr,
      status,
      sellerId: Number(sellerId),
      id_fathercategory: parentCategoryId ? Number(parentCategoryId) : null,
    };

    try {
      if (category) {
        const { data } = await axios.put(
          `/api/admin/categories/${category.id}`,
          newCategory
        );
        onSave(data);
      } else {
        const { data } = await axios.post("/api/admin/categories", newCategory);
        onSave(data);
      }
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  // Group categories by parent
  const groupedCategories = categories.reduce((acc, cat) => {
    if (cat.id_fathercategory) {
      const parent = categories.find((c) => c.id === cat.id_fathercategory);
      if (parent) {
        if (!acc[parent.name_fr]) {
          acc[parent.name_fr] = [];
        }
        acc[parent.name_fr].push(cat);
      }
    } else {
      if (!acc[cat.name_fr]) {
        acc[cat.name_fr] = [];
      }
      acc[cat.name_fr].push(cat); // Add the main category to its own group
    }
    return acc;
  }, {});

  // Handle category selection
  const handleCategorySelect = (event) => {
    setParentCategoryId(event.target.value || null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
      <form
        className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto overflow-y-auto max-h-[90vh]"
        onSubmit={handleSubmit}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <div className="space-y-4">
            {/* Name (FR) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name (FR)
              </label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Name (AR) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name (AR)
              </label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Description (FR) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (FR)
              </label>
              <textarea
                value={descriptionFr}
                onChange={(e) => setDescriptionFr(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>

            {/* Description (AR) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (AR)
              </label>
              <textarea
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Seller */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Seller
              </label>
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a seller</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Parent Category
              </label>
              <FormControl fullWidth className="mt-1">
                <InputLabel id="parent-category-label">
                  Select a parent category (optional)
                </InputLabel>
                <Select
                  labelId="parent-category-label"
                  value={parentCategoryId || ""}
                  onChange={handleCategorySelect}
                  label="Select a parent category (optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {Object.entries(groupedCategories).flatMap(
                    ([parent, subcategories]) => [
                      // Add the parent category as a subheader
                      <MenuItem
                        key={parent}
                        value=""
                        disabled
                        style={{
                          fontWeight: "bold",
                          backgroundColor: "#f5f5f5",
                          cursor: "default",
                        }}
                      >
                        {parent}
                      </MenuItem>,
                      // Add subcategories
                      ...subcategories.map((cat) => (
                        <MenuItem
                          key={cat.id}
                          value={cat.id}
                          style={{
                            paddingLeft: cat.id_fathercategory ? "24px" : "8px",
                          }}
                        >
                          {cat.name_fr}
                        </MenuItem>
                      )),
                    ]
                  )}
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {category ? 'Update' : 'Add New'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
