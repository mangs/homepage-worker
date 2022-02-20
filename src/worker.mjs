// Internal Imports
import assetManifestJson from '__STATIC_CONTENT_MANIFEST'

// Local Variables
const assetMap = JSON.parse(assetManifestJson);
const assetDirectory = '/assets';
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Eric's House</title>
  <meta name="description" content="Eric L. Goldstein's homepage">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <h1>Eric's House</h1>
  <p>
    <img src="./assets/images/mango-man.png?one=two" height="600" width="600" alt="" />
    <!-- <img src="./assets/fake.png" alt="" /> -->
  </p>
</body>
</html>`;

// Local Functions
function buildHeaders(url) {
  const { pathname } = url;
  const fileExtensionRegex = /\.([a-z]+)$/;
  const fileExtension = pathname.match(fileExtensionRegex)?.[1];
  const mimeType = getMimeType(fileExtension);

  return {
    'cache-control': 's-maxage=12345',
    'content-type':  mimeType,
  };
}

function getAssetPath(url) {
  return url.pathname.replace(assetDirectory, '').substring(1);
}

function getMimeType(fileExtension) {
  switch(fileExtension) {
    case 'css': return  'text/css';
    case 'html': return 'text/html;charset=UTF-8';
    case 'ico': return  'image/x-icon';
    case 'jpeg': return 'image/jpeg';
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

    // App Routing
    switch (url.pathname) {
      case '/':
        return new Response(html, { headers, status: 200 });
    }

    // Asset Handling
    const assetPath = getAssetPath(url);
    const mappedAssetPath = assetMap[assetPath];
    const assetStream = await environment.__STATIC_CONTENT.get(mappedAssetPath, { type: 'stream' });
    if (!assetStream) {
      const responseText = `"${assetPath}" not found`;
      return new Response(responseText, {
        headers,
        status: 404,
        statusText: responseText,
      });
    }

    return new Response(assetStream, {
      headers,
      status: 200,
    });
  }
}
