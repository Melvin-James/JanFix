export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizeClasses: Record<NonNullable<LoadingSpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-10 w-10 border-4",
};

export default function LoadingSpinner({
  size = "lg",
  fullScreen = true,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-gray-200 border-t-blue-600`}
    />
  );

  if (!fullScreen) {
    return spinner;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {spinner}
        <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

