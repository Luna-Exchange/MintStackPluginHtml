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
<script src="https://unpkg.com/insomnialab/mintstack-sdk-html@<version>/dist/index.js"></script>
```

### Set up widget

Just add this line

```js
<checkout-widget collectionid="<your_collection_id>" view="<normal | mini>"></checkout-widget>
```

**collectionid: Your collection id**
**view: view mode, either normal or mini(with necessary fields only)**

**note: Above is sample code and demo purpose. Don't use it straightforward on production. Use it replacing collectionId with your project's id**

You can import DetailBox compoent and use directly in your front-end code.

## Usage on sitebuilder like [Wix](https://www.wix.com)

### You can embed the SDK adding below code snippet to your site wix

```js
<script src="https://unpkg.com/insomnialab/mintstack-sdk-html@<version>/dist/index.js"></script>
<checkout-widget collectionid="<your_collection_id>" view="<normal | mini>"></checkout-widget>
```
