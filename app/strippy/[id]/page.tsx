import type { Metadata } from 'next';
import strippyData from '../strippies.json';
import StrippyClient from './strippyClient';

type PageProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

function capitalizeFirstLetter(word?: string) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params; // await here
  const strippyId = Number(id);
  const strippy = strippyData.strippies.find((s) => s.strippy_id === strippyId);
  const strippyName = strippy?.bio?.bio_name || 'Unknown Strippy';

  const rawAppName = process.env.APP_NAME ?? 'MyApp';
  const appName = capitalizeFirstLetter(rawAppName);

  return {
    title: `${strippyName} | ${appName}`,
    description: `Explore details about ${strippyName} on ${appName}.`,
  };
}

export default async function StrippyPage({ params }: PageProps) {
  const { id } = await params; // await here too
  const strippyId = Number(id);

  return <StrippyClient strippyId={strippyId} />;
}
