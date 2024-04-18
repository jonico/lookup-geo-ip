const http = require('http');
const dns = require('dns').promises;
const geoip = require('geoip-lite');
const url = require('url');

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
  console.log(`Request received for path: ${path}`);

  console.log(`Request received from IP: ${ip}`);
  console.log(`Hostname: ${hostname}`);
  console.log(`Location: ${geo ? `${geo.city}, ${geo.region}, ${geo.country}` : 'Could not determine location'}`);

  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    const ips = forwardedIps.split(',').map(ip => ip.trim());
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

      console.log(`Forwarded IP: ${forwardedIp}`);
      console.log(`Forwarded Hostname: ${forwardedHostname}`);
      console.log(`Forwarded Location: ${forwardedGeo ? `${forwardedGeo.city}, ${forwardedGeo.region}, ${forwardedGeo.country}` : 'Could not determine location'}`);
    }
  }

  res.end('Hello, world!');
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});