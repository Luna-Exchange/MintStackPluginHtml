import { LitElement, html, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { style } from "./styles/styles";

@customElement("cover-image")
export class CoverImage extends LitElement {
  @property({ type: Boolean })
  isMultipleNft: boolean = false;

  @property({ type: Boolean })
  isRandomMint: boolean = false;

  @property({ type: Object })
  assets: any = [];

  static styles?: CSSResultGroup | undefined = style;

  connectedCallback = () => {
    console.log(this.isMultipleNft, this.isRandomMint, this.assets);
  };

  render() {
    const normalImage = html`<img
      src=${this.assets}
      alt=""
      class="object-cover w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    />`;

    const nineImages = html`<div
      class="grid overflow-hidden grid-cols-3 grid-rows-3 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      ${Array.isArray(this.assets) && this.assets.map(
        (asset: any, index: any) => html`<img key=${index} src=${asset.image} />`
      )}
    </div>`;

    const eightImages = html`<div
      class="grid overflow-hidden grid-rows-3 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      <div class="grid grid-cols-3">
        ${Array.isArray(this.assets) && this.assets
          .slice(0, 3)
          .map(
            (asset: any, index: any) =>
            html`<img key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-cols-2">
        ${Array.isArray(this.assets) && this.assets
          .slice(3, 5)
          .map(
            (asset: any, index: any) =>
            html`<img key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-cols-3">
        ${Array.isArray(this.assets) && this.assets
          .slice(5, 8)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
    </div>`;

    const sevenImages = html`<div
      class="grid overflow-hidden grid-rows-3 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      <div class="grid grid-cols-2">
        ${Array.isArray(this.assets) && this.assets
          .slice(0, 2)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-cols-3">
        ${Array.isArray(this.assets) && this.assets
          .slice(2, 5)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-cols-2">
        ${Array.isArray(this.assets) && this.assets
          .slice(5, 7)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
    </div>`;

    const sixImages = html`<div
      class="grid overflow-hidden grid-cols-2 grid-rows-3 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      ${Array.isArray(this.assets) && this.assets.map(
        (asset: any, index: any) => `<img key=${index} src=${asset.image} />`
      )}
    </div>`;

    const fiveImages = html`<div
      class="grid overflow-hidden grid-cols-2 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      <div class="grid grid-rows-3">
        ${Array.isArray(this.assets) && this.assets
          .slice(0, 3)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-rows-2">
        ${Array.isArray(this.assets) && this.assets
          .slice(3, 5)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
    </div>`;

    const fourImages = html`<div
      class="grid overflow-hidden grid-cols-2 grid-rows-2 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      ${Array.isArray(this.assets) && this.assets.map(
        (asset: any, index: any) =>
          html`<img class="object-cover w-full h-full" key=${index} src=${asset.image} />`
      )}
    </div>`;

    const threeImages = html`<div
      class="grid overflow-hidden grid-rows-2 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      <div class="grid grid-cols-2">
        ${Array.isArray(this.assets) && this.assets
          .slice(0, 2)
          .map(
            (asset: any, index: any) =>
              html`<img class="object-cover" key=${index} src=${asset.image} />`
          )}
      </div>
      <div class="grid grid-cols-1">
        ${Array.isArray(this.assets) && this.assets
          .slice(2, 3)
          .map(
            (asset: any, index: any) =>
              html`<img key=${index} src=${asset.image} />`
          )}
      </div>
    </div>`;

    const twoImages = html`<div
      class="grid overflow-hidden grid-cols-2 w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    >
      ${Array.isArray(this.assets) && this.assets.map(
        (asset: any, index: any) => `<img key=${index} src=${asset.image} />`
      )}
    </div>`;

    const oneImages = html`<img
      src=${Array.isArray(this.assets) && this.assets[0]}
      alt=""
      class="object-cover w-full h-full rounded-2xl"
      style=" width: 421px; height: 421px "
    />`;

    return html`
      ${this.isMultipleNft === false || this.isRandomMint
        ? normalImage
        : Array.isArray(this.assets)
        ? this.assets.length >= 9
          ? nineImages
          : this.assets.length === 8
          ? eightImages
          : this.assets.length === 7
          ? sevenImages
          : this.assets.length === 6
          ? sixImages
          : this.assets.length === 5
          ? fiveImages
          : this.assets.length === 4
          ? fourImages
          : this.assets.length === 3
          ? threeImages
          : this.assets.length === 2
          ? twoImages
          : this.assets.length === 1
          ? oneImages
          : null
        : null}
    `;
  }
}
