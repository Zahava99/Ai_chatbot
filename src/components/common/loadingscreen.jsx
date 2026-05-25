export default function LoadingScreen({ message = "Creating your notebook..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1e2124]">
      <p className="text-sm text-white/60 mb-4 tracking-wide">{message}</p>
      {/* Spinner */}
      <div className="w-9 h-9 rounded-full border-2 border-white/15 border-t-[#8ab4f8] animate-spin" />
    </div>
  );
}
