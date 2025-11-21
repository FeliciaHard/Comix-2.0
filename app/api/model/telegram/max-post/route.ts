import puppeteer from 'puppeteer';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get('channel');

  if (!channel) {
    return new Response(JSON.stringify({ error: 'Missing channel parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const maxPost = await getLatestPostNumber(channel);

    return new Response(JSON.stringify({ maxPost }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[ERROR] Failed to get latest post:', error);
    return new Response(JSON.stringify({ error: 'Failed to get latest post' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

async function getLatestPostNumber(channelName: string): Promise<number> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, // Use installed Chrome
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();

  await page.goto(`https://t.me/s/${channelName}`, {
    waitUntil: 'networkidle2',
  });

  const content = await page.content();

  const regex = new RegExp(`https://t\\.me/${channelName}/(\\d+)`, 'g');
  let match;
  let maxNumber = 0;

  while ((match = regex.exec(content)) !== null) {
    const num = parseInt(match[1], 10);
    if (num > maxNumber) maxNumber = num;
  }

  await browser.close();

  return maxNumber;
}
