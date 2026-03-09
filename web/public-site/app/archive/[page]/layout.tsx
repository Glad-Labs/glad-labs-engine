import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page) || 1;
  const title =
    pageNum === 1
      ? 'Article Archive | Glad Labs'
      : `Article Archive — Page ${pageNum} | Glad Labs`;

  return {
    title,
    description:
      'Explore our collection of in-depth articles and insights on AI, automation, and digital transformation.',
    openGraph: {
      title,
      description:
        'Explore our collection of in-depth articles and insights on AI, automation, and digital transformation.',
    },
  };
}

export default function ArchiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
