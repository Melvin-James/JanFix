import { useEffect, useState } from "react";

import { getUsersForManagement, updateUserAccountStatus } from "../services/adminService";

import type { ManagedUser } from "../types/UserManagement";

import { Ban, Check } from "lucide-react";

function UserManagementPage() {

    const [users, setUsers] = useState<ManagedUser[]>([]);

    const [search, setSearch] = useState("");

    const [roleFilter, setRoleFilter] = useState<"ALL" | "USER" | "SERVICE_PROVIDER">(
        "ALL"
    );

    const [verificationFilter, setVerificationFilter] = useState<"ALL" | "VERIFIED" | "NOT_VERIFIED">("ALL");

    const [authProviderFilter, setAuthProviderFilter] = useState<"ALL" | "LOCAL" | "GOOGLE">("ALL");

    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);

    const usersPerPage = 5;

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

    useEffect(() => {
        setCurrentPage(1);

    }, [search, roleFilter, verificationFilter, authProviderFilter]);

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

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const startIndex = (currentPage - 1) * usersPerPage;

    const paginatedUsers = filteredUsers.slice(

        startIndex,

        startIndex + usersPerPage

    );

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
        return (
            <div className="p-6">
                <p className="text-sm text-slate-500">
                    Loading users...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <p className="text-sm text-red-600">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    User Management
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Manage JanFix user accounts.
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-medium text-slate-900">Users</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {filteredUsers.length} users
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                            <select
                                value={roleFilter}
                                onChange={(event) =>
                                    setRoleFilter(
                                        event.target.value as "ALL" | "USER" | "SERVICE_PROVIDER"
                                    )
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            >
                                <option value="ALL">All Roles</option>
                                <option value="USER">Users</option>
                                <option value="SERVICE_PROVIDER">Service Providers</option>
                            </select>

                            <select
                                value={verificationFilter}
                                onChange={(event) =>
                                    setVerificationFilter(
                                        event.target.value as "ALL" | "VERIFIED" | "NOT_VERIFIED"
                                    )
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            >
                                <option value="ALL">All Verification</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="NOT_VERIFIED">Not Verified</option>
                            </select>

                            <select
                                value={authProviderFilter}
                                onChange={(event) =>
                                    setAuthProviderFilter(
                                        event.target.value as "ALL" | "LOCAL" | "GOOGLE"
                                    )
                                }
                                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
                            >
                                <option value="ALL">All Auth Providers</option>
                                <option value="LOCAL">Local</option>
                                <option value="GOOGLE">Google</option>
                            </select>

                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-500 sm:w-72"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {users.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <p className="text-sm text-slate-500">
                                No users found.
                            </p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        User
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Role
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Verification
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Auth Provider
                                    </th>

                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-200">
                                {paginatedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50"
                                    >
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
                                                    <span
                                                        key={role}
                                                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                                                    >
                                                        {role}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Verification */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.isVerified
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-amber-50 text-amber-700"
                                                    }`}
                                            >
                                                {user.isVerified ? "Verified" : "Not Verified"}
                                            </span>
                                        </td>

                                        {/* Auth Provider */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-700">
                                                {user.authProvider}
                                            </span>
                                        </td>

                                        {/* Account Status */}
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.accountStatus === "ACTIVE"
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-red-50 text-red-700"
                                                    }`}
                                            >
                                                {user.accountStatus}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(user.id, user.accountStatus)
                                                }
                                                disabled={updatingUserId === user.id}
                                                title={
                                                    user.accountStatus === "ACTIVE"
                                                        ? "Block user"
                                                        : "Unblock user"
                                                }
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-50 ${user.accountStatus === "ACTIVE"
                                                    ? "text-red-600 hover:bg-red-50"
                                                    : "text-green-600 hover:bg-green-50"
                                                    }`}
                                            >
                                                {user.accountStatus === "ACTIVE" ? (
                                                    <Ban className="h-4 w-4" />
                                                ) : (
                                                    <Check className="h-4 w-4" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                            <p className="text-sm text-slate-500">
                                Showing {startIndex + 1}–{" "}
                                {Math.min(startIndex + usersPerPage, filteredUsers.length)} of{" "}
                                {filteredUsers.length}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) => Math.max(page - 1, 1))
                                    }
                                    disabled={currentPage === 1}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-slate-600">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(page + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserManagementPage;