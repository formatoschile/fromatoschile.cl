import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Prose } from "@/components/ui/Prose";
import { getPage, getPages } from "@/lib/shopify";

// Cache Components fails the build when this returns no params, which happens
// when the store has no Shopify pages; the placeholder renders `notFound()`.
const PLACEHOLDER_PARAMS = [{ page: "__placeholder__" }];

export async function generateStaticParams() {
  const pages = await getPages();
  if (pages.length === 0) {
    return PLACEHOLDER_PARAMS;
  }

  return pages.map((page) => ({ page: page.handle }));
}

export async function generateMetadata(props: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) {
    return notFound();
  }

  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.bodySummary,
    alternates: {
      canonical: `/${params.page}`,
    },
    openGraph: {
      publishedTime: page.createdAt,
      modifiedTime: page.updatedAt,
      type: "article",
    },
  };
}

interface ContentPageProps {
  params: Promise<{ page: string }>;
}

const ContentPage: React.FC<ContentPageProps> = async (props) => {
  const params = await props.params;
  const page = await getPage(params.page);

  if (!page) {
    return notFound();
  }

  return (
    <>
      <h1 className="mb-8 text-5xl font-bold">{page.title}</h1>
      <Prose className="mb-8" html={page.body} />
      <p className="text-sm italic">
        {`Este documento fue actualizado el ${formatDate(page.updatedAt)}.`}
      </p>
    </>
  );
};

export default ContentPage;

function formatDate(date: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
