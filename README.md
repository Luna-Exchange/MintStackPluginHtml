# NFT-Checkout-Package HTML version

Insomnia NFT project's [React plugin](https://github.com/Luna-Exchange/MintStackPluginHtml) library published by creator's portal.

**Built with Lit and TypeScript.**
Check out the [Demo](https://ultraj0330.wixsite.com/nft-checkout)!

## Usage

### Install the SDK

```js
<!--
  You can embed the SDK in <head> tag of your site. Or just before <checkout-widget> code.
-->
<script src="https://unpkg.com/nft-checkout-html@0.0.1/dist/CheckoutWidget.1492b2e8.js"></script>
```

### Set up widget

Just add this line

```js
<checkout-widget collectionid="f3e47701-a883-48d7-9e9a-d985792ab12e"></checkout-widget>
```

**note: Above is sample code and demo purpose. Don't use it straightforward on production. Use it replacing collectionId with your project's id**

You can import DetailBox compoent and use directly in your front-end code.

## Usage on sitebuilder like [Wix](https://www.wix.com)

### You can embed the SDK adding below code snippet to your site wix

```js
<script src="https://unpkg.com/nft-checkout-html@0.0.1/dist/CheckoutWidget.1492b2e8.js"></script>
<checkout-widget collectionid="f3e47701-a883-48d7-9e9a-d985792ab12e"></checkout-widget>
```
