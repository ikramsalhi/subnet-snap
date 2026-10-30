# SubnetSnap

**IPv4 subnetting, finally simple.**

SubnetSnap is a small, free, privacy-friendly IPv4 subnet calculator for networking students and anyone configuring networks. Enter an IPv4 address, choose a CIDR prefix, and understand your subnet in seconds.

![No sign-up](https://img.shields.io/badge/sign--up-not%20required-236448) ![No dependencies](https://img.shields.io/badge/dependencies-zero-236448) ![License MIT](https://img.shields.io/badge/license-MIT-236448)

## What it calculates

- Network address and CIDR notation
- Subnet mask and wildcard mask
- Broadcast address
- First and last usable IPv4 addresses
- Total address count and usable host count
- Network/host bits, visualized in binary
- Basic IPv4 address classification (private, loopback, link-local, etc.)
- Special handling for `/31` point-to-point and `/32` single-address networks

## Try it locally

No dependencies, build tools, accounts, or API keys are needed.

1. Download the files or clone this repository.
2. Open `index.html` in your browser.
3. Enter `192.168.10.42` and `/24`, or select an example.

For clipboard support, use a secure origin such as GitHub Pages or `http://localhost`.

## Publish for free with GitHub Pages

1. Create a **public** GitHub repository named `subnet-snap`.
2. Upload the files from this project into the repository root, keeping the `tests` folder.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, `main`, and `/(root)`, then save.
5. Visit `https://YOUR-USERNAME.github.io/subnet-snap/` once GitHub has published the site.

## Test the calculator

Requires Node.js 18 or newer. There is nothing to install.

```sh
node --test tests/calculator.test.js
```

## Important details

SubnetSnap is for IPv4 only; it does not calculate IPv6 subnets. Conventional subnets reserve the network and broadcast addresses. For `/31` networks, two addresses are counted as usable for point-to-point links (RFC 3021). `/32` represents one address. Classification is intentionally basic; it does not guarantee that an address can be reached on the internet.

All calculations run locally in your browser. No analytics, cookies, or requests to third-party APIs are included.

## Contributing

Found a mistake or have an improvement idea? Open an issue or a pull request. Keep the tool easy to use, dependency-free, and accessible.

## License

MIT. See [LICENSE](LICENSE).
