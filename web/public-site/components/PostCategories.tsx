import Link from 'next/link';

interface PostCategoriesProps {
  categoryId?: string;
  categoryName?: string;
}

export function PostCategories({
  categoryId,
  categoryName,
}: PostCategoriesProps) {
  if (!categoryId && !categoryName) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-slate-400">Category:</span>
      {categoryName && (
        <Link
          href={`/category/${categoryId || categoryName.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-block px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 text-sm hover:bg-cyan-400/20 transition-colors"
        >
          {categoryName}
        </Link>
      )}
    </div>
  );
}
