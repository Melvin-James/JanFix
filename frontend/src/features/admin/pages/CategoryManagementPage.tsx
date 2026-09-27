import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CheckCircle2 } from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../services/categoryService";
import type { Category } from "../types/Category";

import {
  AdminPageHeader,
  AdminCard,
  AdminFilterBar,
  AdminSearchBar,
  AdminFilterSelect,
  AdminTable,
  StatusBadge,
  AdminActionButton,
  BlockUnblockButton,
  AdminPagination,
  AdminEmptyState,
  AdminLoadingState,
  AdminErrorState,
  CategoryModal,
  ConfirmationModal,
} from "../components";

import { usePagination } from "../hooks";

function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((cat) => {
      const matchesSearch =
        !query ||
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat.isActive) ||
        (statusFilter === "INACTIVE" && !cat.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const categoriesPerPage = 5;

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    paginatedItems: paginatedCategories,
    setCurrentPage,
  } = usePagination({
    items: filteredCategories,
    itemsPerPage: categoriesPerPage,
    resetDependencies: [search, statusFilter],
  });

  const handleOpenCreateModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);

  const handleSaveCategory = async (payload: { name: string; description: string }) => {
    if (categoryToEdit) {
      const updated = await updateCategory(categoryToEdit.id, payload);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === updated.id ? updated : cat))
      );
    } else {
      const created = await createCategory(payload);
      setCategories((prev) => [created, ...prev]);
    }
  };

  const handleToggleCategoryStatus = async (cat: Category) => {
    const isCurrentlyActive = cat.isActive;
    const nextState = !isCurrentlyActive;

    if (isCurrentlyActive && !window.confirm("Are you sure you want to block this category?")) {
      return;
    }

    try {
      setUpdatingCategoryId(cat.id);
      const updated = await updateCategoryStatus(cat.id, nextState);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (err) {
      console.error("Failed to update category status:", err);
      setError("Failed to update category status. Please try again.");
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenDeleteModal = (cat: Category) => {
    setCategoryToDelete(cat);
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError("");
      const res = await deleteCategory(categoryToDelete.id);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      setSuccessMessage(res.message || "Category deleted successfully.");
    } catch (err: unknown) {
      console.error("Failed to delete category:", err);
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
      ) {
        setDeleteError(err.response.data.message);
      } else {
        setDeleteError("Failed to delete category. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };



  if (loading) {
    return <AdminLoadingState message="Loading categories..." />;
  }

  if (error) {
    return <AdminErrorState message={error} />;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminPageHeader
          title="Category Management"
          description="Manage service categories and descriptions."
          className="mb-0"
        />

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      <AdminCard>
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="mb-4">
            <h2 className="font-medium text-slate-900">Categories</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {paginatedCategories.length} of {filteredCategories.length} categories
            </p>
          </div>

          <AdminFilterBar>
            <div className="flex-1">
              <AdminSearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search by category name or description..."
              />
            </div>

            <AdminFilterSelect
              value={statusFilter}
              onChange={(val) =>
                setStatusFilter(val as "ALL" | "ACTIVE" | "INACTIVE")
              }
              options={[
                { value: "ALL", label: "All Status" },
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
              ]}
            />
          </AdminFilterBar>
        </div>

        <AdminTable
          columns={[
            "Category Name",
            "Description",
            "Status",
            "Created At",
            "Updated At",
            { header: "Actions", align: "right" },
          ]}
          minWidth="min-w-[800px]"
        >
          {paginatedCategories.map((cat) => (
            <tr key={cat.id} className="hover:bg-slate-50">
              {/* Category Name */}
              <td className="px-6 py-4">
                <span className="font-medium text-slate-900">{cat.name}</span>
              </td>

              {/* Description */}
              <td className="px-6 py-4 max-w-md">
                <p className="text-sm text-slate-600 line-clamp-2">
                  {cat.description}
                </p>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                <StatusBadge status={cat.isActive ? "ACTIVE" : "INACTIVE"} />
              </td>

              {/* Created At */}
              <td className="px-6 py-4">
                <span className="text-sm text-slate-500">
                  {new Date(cat.createdAt).toLocaleDateString("en-IN")}
                </span>
              </td>

              {/* Updated At */}
              <td className="px-6 py-4">
                <span className="text-sm text-slate-500">
                  {new Date(cat.updatedAt).toLocaleDateString("en-IN")}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <AdminActionButton
                    icon={<Pencil className="h-4 w-4" />}
                    label="Edit"
                    title="Edit category"
                    onClick={() => handleOpenEditModal(cat)}
                    variant="outline"
                  />
                  <BlockUnblockButton
                    status={cat.isActive ? "ACTIVE" : "BLOCKED"}
                    onClick={() => handleToggleCategoryStatus(cat)}
                    disabled={updatingCategoryId === cat.id || (isDeleting && categoryToDelete?.id === cat.id)}
                    isUpdating={updatingCategoryId === cat.id}
                    title={cat.isActive ? "Block category" : "Unblock category"}
                    variant="bordered"
                  />
                  <AdminActionButton
                    icon={<Trash2 className="h-4 w-4" />}
                    label="Delete"
                    title="Delete category"
                    onClick={() => handleOpenDeleteModal(cat)}
                    variant="danger"
                    disabled={updatingCategoryId === cat.id || (isDeleting && categoryToDelete?.id === cat.id)}
                  />
                </div>
              </td>

            </tr>
          ))}
        </AdminTable>

        {filteredCategories.length === 0 && (
          <AdminEmptyState
            message={
              categories.length === 0
                ? "No categories found"
                : "No categories match your search or filters"
            }
          />
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredCategories.length}
        />
      </AdminCard>

      <CategoryModal
        key={categoryToEdit ? categoryToEdit.id : "new-category"}
        isOpen={isModalOpen}
        categoryToEdit={categoryToEdit}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? "Deleting..." : "Delete Category"}
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeleting}
        errorMessage={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
            setDeleteError("");
          }
        }}
      />
    </div>
  );
}

export default CategoryManagementPage;
