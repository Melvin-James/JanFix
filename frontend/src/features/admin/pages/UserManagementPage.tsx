import { useEffect, useState } from "react";

import { ConfirmationModal } from "../components";

import { getUsersForManagement, updateUserAccountStatus } from "../services/adminService";

import type { ManagedUser } from "../types/UserManagement";

import {
    AdminCard,
    AdminEmptyState,
    AdminErrorState,
    AdminFilterBar,
    AdminFilterSelect,
    AdminLoadingState,
    AdminPageHeader,
    AdminPagination,
    AdminSearchBar,
    AdminTable,
    BlockUnblockButton,
    StatusBadge,
} from "../components";

function UserManagementPage() {

    const [users, setUsers] = useState<ManagedUser[]>([]);

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "SERVICE_PROVIDER">(
        "ALL"
    );

    const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "NOT_VERIFIED">("ALL");

    const [authProviderFilter, setAuthProviderFilter] = useState<"ALL" | "LOCAL" | "GOOGLE">("ALL");

    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const usersPerPage = 10;

    const [currentPage, setCurrentPage] = useState(1);

    const [totalPages, setTotalPages] = useState(0);

    const [totalItems, setTotalItems] = useState(0);

    const [initialLoading, setInitialLoading] = useState(true);

    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [search]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, verificationFilter, authProviderFilter]);

    useEffect(() => {

        let cancelled = false;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getUsersForManagement({
                    page: currentPage,
                    pageSize: usersPerPage,
                    search: debouncedSearch || undefined,
                    role: roleFilter,
                    verification: verificationFilter,
                    authProvider: authProviderFilter,
                });

                if (cancelled) return;

                setUsers(data.items);

                setTotalPages(data.pagination.totalPages);

                setTotalItems(data.pagination.totalItems);

            } catch {

                if (!cancelled) {

                    setError("Failed to load users.");

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                    setInitialLoading(false);

                }

            }

        };

        fetchUsers();

        return () => {
            cancelled = true;
        };

    }, [
        currentPage,
        debouncedSearch,
        roleFilter,
        verificationFilter,
        authProviderFilter,
    ]);

    const startIndex = totalItems === 0
        ? 0
        : (currentPage - 1) * usersPerPage;

    const endIndex = startIndex + users.length;


    const [confirmModal, setconfirmModal] = useState<{
        isOpen: boolean;
        userId: string;
        nextStatus: ManagedUser["accountStatus"]
    }>({
        isOpen: false,
        userId: "",
        nextStatus: "ACTIVE"
    })

    const handleStatusChange = async (
        userId: string,
        currentStatus: ManagedUser["accountStatus"]
    ) => {
        const nextStatus = currentStatus === 'ACTIVE' ? "BLOCKED" : "ACTIVE";

        if (nextStatus === "BLOCKED") {
            setconfirmModal({
                isOpen: true,
                userId,
                nextStatus,
            });
            return;
        }

        await executeStatusUpdate(userId, nextStatus);
    }

    const executeStatusUpdate = async (
        userId: string,
        nextStatus: ManagedUser["accountStatus"]
    ) => {
        try {
            setUpdatingUserId(userId);

            const updatedUser = await updateUserAccountStatus(userId, nextStatus);

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === updatedUser.id
                        ? { ...user, accountStatus: updatedUser.accountStatus }
                        : user
                )
            );
            setconfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch {
            setError("Failed to update user account status.");
        } finally {
            setUpdatingUserId(null);
        }
    }

    if (initialLoading) {
        return <AdminLoadingState message="Loading users..." />;
    }

    if (error) {
        return <AdminErrorState message={error} />;
    }

    return (
        <div className="p-6">
            <AdminPageHeader
                title="User Management"
                description="Manage JanFix user accounts."
            />

            <AdminCard>
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="mb-4">
                        <h2 className="font-medium text-slate-900">Users</h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Showing {users.length} of {users.length} users
                        </p>
                    </div>

                    <AdminFilterBar>
                        <div className="flex-1">
                            <AdminSearchBar
                                value={search}
                                onChange={setSearch}
                                placeholder="Search by name or email..."
                            />
                        </div>

                        <AdminFilterSelect
                            value={roleFilter}
                            onChange={(value) => {
                                setRoleFilter(
                                    value as "ALL" | "USER" | "SERVICE_PROVIDER"
                                );
                                setCurrentPage(1);
                            }
                            }
                            options={[
                                { value: "ALL", label: "All Roles" },
                                { value: "USER", label: "Users" },
                                { value: "SERVICE_PROVIDER", label: "Service Providers" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={verificationFilter}
                            onChange={(value) => {
                                setVerificationFilter(
                                    value as "ALL" | "VERIFIED" | "NOT_VERIFIED"
                                )
                                setCurrentPage(1);
                            }
                            }
                            options={[
                                { value: "ALL", label: "All Verification" },
                                { value: "VERIFIED", label: "Verified" },
                                { value: "NOT_VERIFIED", label: "Not Verified" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={authProviderFilter}
                            onChange={(value) => {
                                setAuthProviderFilter(
                                    value as "ALL" | "LOCAL" | "GOOGLE"
                                )
                                setCurrentPage(1);
                            }
                            }
                            options={[
                                { value: "ALL", label: "All Auth Providers" },
                                { value: "LOCAL", label: "Local" },
                                { value: "GOOGLE", label: "Google" },
                            ]}
                        />
                    </AdminFilterBar>
                </div>

                <AdminTable
                    columns={[
                        "User",
                        "Role",
                        "Verification",
                        "Auth Provider",
                        "Status",
                        { header: "Actions", align: "right" },
                    ]}
                    minWidth="min-w-[1000px]"
                >
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                            {/* User */}
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-medium text-slate-900">
                                        {user.fullName}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {user.email}
                                    </p>
                                </div>
                            </td>

                            {/* Roles */}
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role) => (
                                        <StatusBadge
                                            key={role}
                                            label={role}
                                            variant="slate"
                                        />
                                    ))}
                                </div>
                            </td>

                            {/* Verification */}
                            <td className="px-6 py-4">
                                <StatusBadge
                                    label={user.isVerified ? "Verified" : "Not Verified"}
                                    variant={user.isVerified ? "emerald" : "amber"}
                                />
                            </td>

                            {/* Auth Provider */}
                            <td className="px-6 py-4">
                                <span className="text-sm text-slate-700">
                                    {user.authProvider}
                                </span>
                            </td>

                            {/* Account Status */}
                            <td className="px-6 py-4">
                                <StatusBadge status={user.accountStatus} />
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 text-right">
                                <BlockUnblockButton
                                    status={user.accountStatus}
                                    onClick={() =>
                                        handleStatusChange(user.id, user.accountStatus)
                                    }
                                    disabled={updatingUserId === user.id}
                                    isUpdating={updatingUserId === user.id}
                                    title={
                                        user.accountStatus === "ACTIVE"
                                            ? "Block user"
                                            : "Unblock user"
                                    }
                                    variant="icon"
                                />
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {!loading && !error && users.length === 0 && (
                    <AdminEmptyState
                        message={
                            users.length === 0
                                ? "No users found"
                                : "No users match your search or filters"
                        }
                    />
                )}

                <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    totalItems={totalItems}
                />

            </AdminCard>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title="Block User Account"
                message="Are you sure you want to block this user account? They will lose access to platform services until unblocked."
                confirmLabel="Block User"
                loadingLabel="Blocking..."
                variant="danger"
                isLoading={updatingUserId === confirmModal.userId}
                onConfirm={() => executeStatusUpdate(confirmModal.userId, confirmModal.nextStatus)}
                onClose={() => setconfirmModal((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

export default UserManagementPage;
