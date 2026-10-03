import { useEffect, useState } from "react";

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
import { usePagination } from "../hooks";

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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError("");
                const data = await getUsersForManagement();
                setUsers(data);
            } catch {
                setError("Failed to load users.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const query = search.trim().toLowerCase();

        const matchesSearch =
            !query ||
            user.fullName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);

        const matchesRole = roleFilter === "ALL" || user.roles.includes(roleFilter);

        const matchesVerification =
            verificationFilter === "ALL" ||
            (verificationFilter === "VERIFIED" && user.isVerified) ||
            (verificationFilter === "NOT_VERIFIED" && !user.isVerified);

        const matchesAuthProvider =
            authProviderFilter === "ALL" ||
            user.authProvider === authProviderFilter;

        return (
            matchesSearch &&
            matchesRole &&
            matchesVerification &&
            matchesAuthProvider
        );
    });

    const usersPerPage = 5;

    const {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems: paginatedUsers,
        setCurrentPage,
    } = usePagination({
        items: filteredUsers,
        itemsPerPage: usersPerPage,
        resetDependencies: [search, roleFilter, verificationFilter, authProviderFilter],
    });

    const handleStatusChange = async (
        userId: string,
        currentStatus: ManagedUser["accountStatus"]
    ) => {
        const nextStatus = currentStatus === 'ACTIVE' ? "BLOCKED" : "ACTIVE";

        if (nextStatus === "BLOCKED") {
            const confirmed = window.confirm(
                "Are you sure you want to block this user account?"
            );

            if (!confirmed) {
                return;
            }
        }

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
        } catch {
            setError("Failed to update user account status.");
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) {
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
                            Showing {paginatedUsers.length} of {users.length} users
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
                            onChange={(value) =>
                                setRoleFilter(
                                    value as "ALL" | "USER" | "SERVICE_PROVIDER"
                                )
                            }
                            options={[
                                { value: "ALL", label: "All Roles" },
                                { value: "USER", label: "Users" },
                                { value: "SERVICE_PROVIDER", label: "Service Providers" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={verificationFilter}
                            onChange={(value) =>
                                setVerificationFilter(
                                    value as "ALL" | "VERIFIED" | "NOT_VERIFIED"
                                )
                            }
                            options={[
                                { value: "ALL", label: "All Verification" },
                                { value: "VERIFIED", label: "Verified" },
                                { value: "NOT_VERIFIED", label: "Not Verified" },
                            ]}
                        />

                        <AdminFilterSelect
                            value={authProviderFilter}
                            onChange={(value) =>
                                setAuthProviderFilter(
                                    value as "ALL" | "LOCAL" | "GOOGLE"
                                )
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
                    {paginatedUsers.map((user) => (
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

                {filteredUsers.length === 0 && (
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
                    totalItems={filteredUsers.length}
                />
            </AdminCard>
        </div>
    );
}

export default UserManagementPage;
