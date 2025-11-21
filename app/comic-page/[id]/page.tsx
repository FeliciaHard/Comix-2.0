import ComicClient from './comicClient';

type PageProps = {
  params: Promise<{ id: string }>; // params is a Promise
};

export default async function ComicPage({ params }: PageProps) {
  const { id } = await params;  // <-- await here to resolve params
  
  return <ComicClient comicId={id} />;
}
