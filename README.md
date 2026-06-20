# Bromelle Sample Bakery Website

A responsive static ecommerce-style bakery website that can be deployed directly to **GitHub** and **Vercel**.

## Included features

- Responsive homepage
- Product cards
- Working browser-based cart
- Cart saved in `localStorage`
- Customer checkout form
- WhatsApp order generation
- Razorpay payment-link placeholder
- Custom-order WhatsApp button
- Mobile navigation
- Original SVG product illustrations
- No framework or build step required

## Files

```text
bromelle-sample-site/
├── index.html
├── styles.css
├── script.js
├── vercel.json
├── README.md
└── assets/
    ├── hero-bakes.svg
    ├── cookies.svg
    ├── tea-cake.svg
    ├── brownies.svg
    ├── muffins.svg
    └── mom-baker.svg
```

## Before publishing

Open `script.js` and replace:

```js
const WHATSAPP_NUMBER = "91XXXXXXXXXX";
const RAZORPAY_PAYMENT_LINK = "https://rzp.io/l/your-payment-link";
```

Use the WhatsApp number in international format without `+`, spaces or dashes.

Example:

```js
const WHATSAPP_NUMBER = "919876543210";
```

Also update:

- Product names and prices in `index.html`
- Contact email
- Delivery area
- FSSAI number
- Product descriptions and allergens
- Razorpay payment link
- Brand text and images if needed

## Test locally

Double-click `index.html`, or use VS Code Live Server.

## Deploy through GitHub and Vercel

1. Create a new GitHub repository.
2. Upload all files from this folder to the repository root.
3. Commit the files.
4. Sign in to Vercel using GitHub.
5. Click **Add New → Project**.
6. Import the GitHub repository.
7. Leave Framework Preset as **Other**.
8. Leave Build Command blank.
9. Leave Output Directory blank.
10. Click **Deploy**.

Every future push to the main GitHub branch will automatically redeploy the website.

## Important limitation

This sample is a static website. It does not:

- Store orders in a database
- Verify payment automatically
- Manage inventory
- Send transactional emails
- Calculate delivery charges

Orders are sent through WhatsApp. This is suitable for starting a home bakery at low cost.
