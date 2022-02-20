// Internal Imports
import assetManifestJson from '__STATIC_CONTENT_MANIFEST'

// Local Variables
const assetMap = JSON.parse(assetManifestJson);
const assetsDirectory = '/assets';
const cache = caches.default;
const routesDirectory = '/routes';

// Local Functions
function buildHeaders(url) {
  const { pathname } = url;
  const fileExtensionRegex = /\.([a-z]+)$/;
  const fileExtension = pathname.match(fileExtensionRegex)?.[1];
  const mimeType = getMimeType(fileExtension);

  return {
    'Cache-Control': 'no-transform, stale-if-error=86400, s-maxage=31536000, max-age=1',
    'Content-Type':  mimeType,
  };
}

function getAssetPath({ pathname }) {
  let path = pathname;
  if (path.endsWith('/')) {
    path = `${assetsDirectory}${routesDirectory}${path}index.html`;
  }
  return path.replace(assetsDirectory, '').substring(1);
}

function getMimeType(fileExtension) {
  switch(fileExtension) {
    case 'css': return  'text/css';
    case 'jpg': return  'image/jpeg';
    case 'js': return   'text/javascript';
    case 'json': return 'application/json';
    case 'mjs': return  'text/javascript';
    case 'png': return  'image/png';

    default: return 'text/html;charset=UTF-8';
  }
}

// Module Definition
export default {
  async fetch(request, environment, context) {
    const url = new URL(request.url);
    const headers = buildHeaders(url);
    const isValidMethod = /^(GET|HEAD)$/.test(request.method);
    if (!isValidMethod) {
      return new Response(`Method "${request.method}" not allowed`, { status: 405 });
    }

    // Respond from cache if a record exists
    const cacheRecord = await cache.match(request);
    if (cacheRecord) {
      return cacheRecord;
    }

    // Asset Handling
    const assetPath = getAssetPath(url);
    const mappedAssetPath = assetMap[assetPath];
    const assetStream = await environment.__STATIC_CONTENT.get(mappedAssetPath, { type: 'stream' });
    if (!assetStream) {
      return new Response(`"${assetPath}" not found`, {
        headers,
        status: 404,
      });
    }

    const response = new Response(assetStream, {
      headers,
      status: 200,
    });
    context.waitUntil(
      cache.put(request, response.clone())
    );
    return response;
  }
}
