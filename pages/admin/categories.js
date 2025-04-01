import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/outline';
import CategoryModal from '../../components/CategoryModal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expanded, setExpanded] = useState([]); // Tracks expanded categories

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/admin/categories');
        setCategories(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      setCategories(categories.filter((category) => category.id !== id));
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  const openModal = (category = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.get('/api/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch updated categories:', err);
    }
    closeModal();
  };

  const toggleExpand = (id) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderCategories = (categories, parentId = null, level = 0) => {
    return categories
      .filter((category) => category.id_fathercategory === parentId)
      .map((category) => (
        <div
          key={category.id}
          className={`bg-white shadow-sm rounded-lg overflow-hidden transition-transform ${
            level === 0 ? 'mb-4' : 'ml-6 mt-2'
          }`}
        >
          <div
            className={`flex justify-between items-center p-4 ${
              level === 0 ? 'bg-indigo-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {categories.some((cat) => cat.id_fathercategory === category.id) && (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 text-gray-600 hover:text-indigo-600 transition-transform"
                >
                  {expanded.includes(category.id) ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
              )}
              <div className="flex flex-col">
                <span
                  className={`text-base font-semibold ${
                    level === 0 ? 'text-indigo-800' : 'text-gray-700'
                  }`}
                >
                  {category.name_fr}
                </span>
                <span className="text-sm text-gray-500">{category.name_ar}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => openModal(category)}
                className="p-2 rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                title="Edit"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                title="Delete"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
  
          {/* Recursive Rendering for Subcategories */}
          {expanded.includes(category.id) && (
            <div className="p-2">
              {renderCategories(categories, category.id, level + 1)}
            </div>
          )}
        </div>
      ));
  };
  

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Manage Categories
          </h1>
          <button
            className="mt-4 sm:mt-0 px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 flex items-center gap-2 transition"
            onClick={() => openModal()}
          >
            <PlusIcon className="w-5 h-5" />
            Add Category
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="divide-y divide-gray-200">{renderCategories(categories)}</div>
          </div>
        )}

        {isModalOpen && (
          <CategoryModal
            category={editingCategory}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
      </div>
    </AdminLayout>
  );
}
