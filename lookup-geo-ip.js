const http = require('http');
const dns = require('dns').promises;
const url = require('url');
const geoip = require('geoip-lite');

const server = http.createServer(async (req, res) => {
  const ip = req.connection.remoteAddress.replace(/^::ffff:/, '');
  let hostname = '';
  let geo = '';

  try {
    const hostnames = await dns.reverse(ip);
    hostname = hostnames[0];
  } catch (err) {
    hostname = 'Could not resolve hostname';
  }

  geo = geoip.lookup(ip);

  const path = url.parse(req.url).pathname;
  let output = `<h1>Request Information</h1>
  <p>Request received for path: ${path}</p>
  <p>Request received from IP: ${ip}</p>
  <p>Hostname: ${hostname}</p>
  <p>Location: ${geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Could not determine location'}</p>`;

  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    const ips = forwardedIps.split(',').map(ip => ip.trim());
    output += `<h2>Forwarded IPs</h2>`;
    for (const forwardedIp of ips) {
      let forwardedHostname = '';
      let forwardedGeo = '';

      try {
        const forwardedHostnames = await dns.reverse(forwardedIp);
        forwardedHostname = forwardedHostnames[0];
      } catch (err) {
        forwardedHostname = 'Could not resolve hostname';
      }

      forwardedGeo = geoip.lookup(forwardedIp);

      output += `<p>Forwarded IP: ${forwardedIp}</p>
      <p>Forwarded Hostname: ${forwardedHostname}</p>
      <p>Forwarded Location: ${forwardedGeo ? `${forwardedGeo.city}, ${forwardedGeo.region}, ${forwardedGeo.country}` : 'Could not determine location'}</p>`;
    }
  }

  // Log headers and their values
  console.log('Headers:', req.headers);
  output += `<h2>Headers</h2>`;
  for (const [key, value] of Object.entries(req.headers)) {
    output += `<p>${key}: ${value}</p>`;
  }

  res.setHeader('Content-Type', 'text/html');
  res.end(output);
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});