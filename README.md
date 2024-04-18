# lookup-geo-ip

This repository contains a Node.js application that looks up the geographical location of incoming HTTP requests based on their IP addresses.

## Features

- Retrieves the IP address of incoming requests
- Resolves the hostname for the IP address
- Determines the geographical location (city, region, country) of the IP address
- Handles 'x-forwarded-for' headers for requests coming through proxies
- Logs request headers and their values to the console
- Includes request headers in the HTML response