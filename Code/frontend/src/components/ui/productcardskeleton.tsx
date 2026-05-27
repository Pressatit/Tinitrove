// CHANGED: all skeleton pulses are grey (bg-gray-200) not pink
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md flex flex-col">
      {/* Image placeholder */}
      <div className="aspect-square bg-gray-200 animate-pulse" />

      {/* Text placeholders */}
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-200 rounded-full animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded-full animate-pulse w-1/3" />
        <div className="flex justify-end mt-1">
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}