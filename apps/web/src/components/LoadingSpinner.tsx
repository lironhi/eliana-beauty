export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-200"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-600 absolute top-0 left-0"></div>
      </div>
    </div>
  );
}
