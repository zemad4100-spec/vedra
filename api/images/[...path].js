
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const parts = req.query.path;
    const segments = Array.isArray(parts) ? parts : [parts];

    if (
      !segments.length ||
      segments.some(part => !part || !/^[a-zA-Z0-9._-]+$/.test(part) || part === '..')
    ) {
      return res.status(400).send('Invalid image path');
    }

    const imagePath = segments.map(encodeURIComponent).join('/');
    const imageUrl =
      `https://kilogram-parabola-showing.ngrok-free.dev/uploads/${imagePath}`;

    const upstream = await fetch(imageUrl, {
      method: req.method,
      headers: {
        'ngrok-skip-browser-warning': '1'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('Image not found');
    }

    const contentType = upstream.headers.get('content-type') || '';

    if (!contentType.startsWith('image/')) {
      return res.status(502).send('Invalid image response');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');

    if (req.method === 'HEAD') {
      return res.status(200).end();
    }

    const imageBuffer = Buffer.from(await upstream.arrayBuffer());

    return res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Image proxy error:', error);
    return res.status(502).send('Image proxy failed');
  }
}
