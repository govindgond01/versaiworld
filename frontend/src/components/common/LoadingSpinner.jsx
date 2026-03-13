export default function LoadingSpinner({ size = 'md', message }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizes[size]} animate-spin rounded-full border-b-2 border-blue-600`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
}

