import type { Metadata } from 'next';
import modelData from '../models.json';
import ModelClient from './modelClient';

type PageProps = {
  params: Promise<{ id: string }>; // params is now a Promise
};

function capitalizeFirstLetter(word?: string) {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params; // await here
  const modelId = Number(id);
  const model = modelData.models.find((m) => m.model_id === modelId);
  const modelName = model?.bio?.bio_name || 'Unknown Model';

  const rawAppName = process.env.APP_NAME ?? 'MyApp';
  const appName = capitalizeFirstLetter(rawAppName);

  return {
    title: `${modelName} | ${appName}`,
    description: `Explore details about ${modelName} on ${appName}.`,
  };
}

export default async function ModelPage({ params }: PageProps) {
  const { id } = await params; // await here too
  const modelId = Number(id);

  return <ModelClient modelId={modelId} />;
}
