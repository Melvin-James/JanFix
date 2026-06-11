export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
