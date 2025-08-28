export const PostCardSkeleton = () => {
  return (
    <article
      className="p-5 sm:p-6 rounded-2xl shadow border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#131619] animate-pulse transition-colors duration-200"
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-neutral-800" />
        <div className="flex-1 space-y-2">
          <div className="w-32 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
          <div className="w-20 h-2 bg-gray-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="w-full h-5 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="w-full h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="w-3/4 h-3 bg-gray-200 dark:bg-neutral-800 rounded" />
      </div>

      <div className="h-40 bg-gray-200 dark:bg-neutral-800 rounded mb-4" />

      <div className="flex justify-between items-center">
        <div className="w-28 h-8 bg-gray-200 dark:bg-neutral-800 rounded" />
        <div className="w-12 h-5 bg-gray-200 dark:bg-neutral-800 rounded" />
      </div>
    </article>
  );
};
