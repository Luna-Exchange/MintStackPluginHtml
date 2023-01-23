import { ethers } from 'ethers';
import { LitElement, html, CSSResultGroup } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { getMintInfo, getAllAssets, answerMintQuestions } from './api/mint';
import { envs, EnvType, stages, views } from './type';
import { style } from './styles/styles';
import { logo, ethereum, polygon, twitter, facebook, instagram, discord, out } from './assets/logo';
import abi from './assets/abi/collection.json';
import 'lit-pagination';

@customElement('checkout-widget')
export class CheckoutWidget extends LitElement {
  @property({ type: String })
  collectionId: string = '';

  @property({ type: String })
  view: string = '';

  @property({ type: String })
  env: EnvType = envs.PRODUCTION;

  @property({ type: Object })
  provider: any = {};

  @property({ type: Boolean })
  active: boolean = false;

  @property({ type: Object })
  signer: any = {};

  @property({ type: String })
  address: string = '';

  @property({ type: Object })
  contract: any = {};

  @property({ type: Object })
  mintInfo: any = {};

  @property({ type: Object })
  assets: any = [];

  @property({ type: String })
  stage = stages.NORMAL;

  @property({ type: Number })
  step: number = 0;

  @property({ type: Object })
  questions: any = [];

  @property({ type: Object })
  answers: any = [];

  @property({ type: Object })
  error: any = [];

  @property({ type: String })
  tokenId: string = '';

  @property({ type: Number })
  mintPrice: number | undefined = undefined;

  @property({ type: String })
  remainingSupply: string = '';

  @property({ type: Boolean })
  isDescriptionCollapsed: boolean = true;

  @property({ type: Boolean })
  mintProcessing: boolean = false;

  @property({ type: Boolean })
  mintSucceed: boolean = false;

  @property({ type: Number })
  nftCount: number = 0;

  @property({ type: Object })
  assetsList: any = [];

  @property({ type: Number })
  selectedNftIndex: number | undefined = undefined;

  @property({ type: String })
  breakpoint: string = '';

  @property({ type: Number })
  currentPage: number = 1;

  @property({ type: Number })
  limit: number = this.view === views.MINI ? 12 : this.breakpoint === 'mobile' ? 16 : 24;

  // createRenderRoot() {
  //   return this; // turn off shadow dom to access external styles
  // }

  private _handleResize = () => {
    // `this` refers to the component
    console.log(window.innerWidth);
    this.breakpoint = window.innerWidth >= 768 ? 'desktop' : 'mobile';
    console.log(this.breakpoint);
  };

  constructor() {
    super();

    this.breakpoint = window.innerWidth >= 768 ? 'desktop' : 'mobile';

    window.addEventListener('resize', this._handleResize);
  }

  static styles?: CSSResultGroup | undefined = style;

  updated = (changedProperties: Map<string, unknown>) => {
    if (changedProperties.has('mintInfo') && Object.keys(this.mintInfo).length > 0) {
      const contract = new ethers.Contract(this.mintInfo.contract_address, abi, this.signer);
      this.contract = contract;
    }

    if (changedProperties.has('contract') && Object.keys(this.contract).length > 0) {
      this.getTokenInfo();
    }
  };

  setWeb3 = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    this.provider = provider;
  };

  setInfo = async () => {
    const response = await getMintInfo(this.collectionId, this.env);
    console.log(response);
    this.mintInfo = response;
    this.questions = Array.isArray(this.mintInfo.first_party_data) && this.mintInfo.first_party_data.map((item: any) => item.question);

    if (response.is_multiple_nft) {
      const assetsResponse = await getAllAssets(this.collectionId, this.env);
      this.assets = assetsResponse.data.items.reverse();
    }
  };

  getTokenInfo = async () => {
    const id = this.mintInfo.random_mint ? 1 : this.tokenId ? this.tokenId : 1;
    const resMintPrice = await this.contract.tokenPrices(Number(id));
    const mintPrice = parseFloat(ethers.utils.formatEther(resMintPrice.toString()));

    this.mintPrice = mintPrice;

    const remainingSupply = await this.contract.remainingSupply();
    this.remainingSupply = remainingSupply.toString();
  };

  async connectedCallback(): Promise<void> {
    super.connectedCallback();

    this.setWeb3();

    this.setInfo();
  }

  connectWallet = async () => {
    let addresses = await this.provider.send('eth_requestAccounts', []);
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId:
            this.env === envs.DEVELOPMENT ? (this.mintInfo.chain === 'ethereum' ? '0x5' : '0x13881') : this.mintInfo.chain === 'ethereum' ? '0x1' : '0x89',
        },
      ],
    });
    this.address = addresses[0];
    this.signer = this.provider.getSigner();

    if (this.mintInfo.contract_address) {
      const contract = new ethers.Contract(this.mintInfo.contract_address, abi, this.signer);
      this.contract = contract;
    }

    this.stage = stages.TERMS;
  };

  mintNft = async () => {
    if (this.contract) {
      if (!this.mintInfo.random_mint && !this.nftCount) {
        return;
      }

      this.mintProcessing = true;
      const count = this.mintInfo.random_mint ? 1 : this.nftCount;
      // console.log(account, this.mintInfo.random_mint ? 1 : tokenId ? tokenId : 1, count);
      if (!this.mintPrice) return;
      try {
        const tx = await this.contract.mint(this.address, this.mintInfo.random_mint ? 1 : this.tokenId ? this.tokenId : 1, count, {
          value: ethers.utils.parseEther((this.mintPrice * count).toString()),
        });
        await tx.wait();
        console.log('mint success!');
        this.mintSucceed = true;

        const remainingSupply = await this.contract.remainingSupply();
        this.remainingSupply = remainingSupply.toString();

        if (this.mintInfo.first_party_data.length > 0) {
          this.postAnswers();
        }
      } catch (error) {
        console.warn(error);
      }
      this.mintProcessing = false;
    }
  };

  postAnswers = () => {
    if (this.address) {
      let firstPartyAnswers: any[] = this.mintInfo.first_party_data.map((item: any, index: number) => ({
        question_type: item.type,
        question: item.question,
        answer: this.answers[index],
      }));

      answerMintQuestions(this.collectionId, this.address, firstPartyAnswers, this.env)
        .then(async (response: any) => {
          console.log('answerMintQuestions response:', response);
        })
        .catch((error: any) => {
          console.log('answerMintQuestions error:', error);
        });
    }
  };

  handleDescription = () => {
    this.isDescriptionCollapsed = !this.isDescriptionCollapsed;
  };

  changeAnswer = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.answers[this.step] = input.value;
  };

  changeNftCount = (event: Event) => {
    const input = event.target as HTMLInputElement;
    this.nftCount = parseInt(input.value);
  };

  handleBack = () => {
    if (this.step > 0) this.step = this.step - 1;
  };

  handleForward = () => {
    if (!!this.answers[this.step]) {
      this.step = this.step + 1;
    }
  };

  handleSelectNFT = (value: number, asset: any) => {
    this.selectedNftIndex = value;
    this.tokenId = asset.token_id;
  };

  handleAgree = () => {
    if (this.mintInfo.is_multiple_nft && !this.mintInfo.random_mint) {
      this.stage = stages.CHOOSENFT;
    } else {
      this.stage = this.questions.length > 0 ? stages.QUESTION : stages.NORMAL;
    }
  };

  handlePagination = () => {
    const paginationObject = this.shadowRoot?.querySelector('lit-pagination') as any;
    console.log(paginationObject.page);
    this.currentPage = paginationObject.page;
  };

  render() {
    return html`
      <div class="container mx-auto rounded-2xl w-max min-h-full" style="max-width: 864px; box-shadow: 0px 0px 16px rgba(0, 0, 0, 0.5);">
        <div
          class="flex ${this.breakpoint === 'mobile' || this.view === views.MINI
            ? 'flex-col'
            : 'flex-row'} text-left w-full min-h-min box-border box rounded-2xl"
          style="background-color: ${this.mintInfo.checkout_background_color ? this.mintInfo.checkout_background_color : 'white'}"
        >
          ${this.stage !== stages.CHOOSENFT || this.mintInfo.random_mint
            ? html`<div
                class="relative items-center justify-center w-full border border-white border-solid h-full border-none rounded-2xl"
                style="max-height: 421px; max-width: 421px"
              >
                ${this.selectedNftIndex !== undefined && !isNaN(this.selectedNftIndex)
                  ? (
                    this.assets[this.selectedNftIndex].image.slice(-3) === 'mp4' ?
                      html`<video controls="" class="w-full h-full">
                        <source src="${this.assets[this.selectedNftIndex].image}" type="video/mp4">
                      </video>` :
                      html`<img
                          src=${this.assets[this.selectedNftIndex].image}
                          alt=""
                          class="object-cover w-full h-full rounded-2xl"
                          style=" width: 421px; height: 421px "
                        />`
                  ) : (
                    this.mintInfo.image.slice(-3) === 'mp4' ? 
                      html`<video controls="" class="w-full h-full">
                        <source src="${this.mintInfo.image}" type="video/mp4">
                      </video>` :
                      html`<img src=${this.mintInfo.image} alt="" class="object-cover w-full h-full rounded-2xl" style=" width: 421px; height: 421px " />`
                  )}
                <div class="absolute" style=" inset: 0">
                  <div
                    style="background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(27, 28, 34, 0) 0.01%, #000000 100%);
                          height: 60%;"
                    class="w-full transform -rotate-180 rounded-2xl"
                  ></div>
                </div>
              </div>`
            : null}
          ${this.stage !== stages.CHOOSENFT || this.mintInfo.random_mint
            ? html`<div class="relative flex ${this.breakpoint === 'mobile' || this.view === views.MINI ? 'flex-col gap-0' : 'gap-4 mx-10 flex-row'} pt-7">
                <div
                  class="relative flex flex-col w-80 gap-6 mx-auto"
                  style="min-height: ${this.view === views.MINI ? '180px' : '350px'}; max-width: ${this.view === views.MINI ? '325px' : '357px'};"
                >
                  <div class="flex flex-col">
                    ${this.view === views.NORMAL
                      ? html`
                          <div class="flex flex-col" style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'}">
                            <div class="flex flex-row gap-2 items-center">
                              <p class="text-xl font-bold">
                                ${this.selectedNftIndex !== undefined && !isNaN(this.selectedNftIndex)
                                  ? this.assets[this.selectedNftIndex].name
                                  : this.mintInfo.name}
                              </p>
                              ${this.mintInfo.chain === 'ethereum' ? ethereum : polygon}
                            </div>
                            <p class="text-md font-normal">${this.mintInfo.organization_name}</p>
                          </div>
                        `
                      : null}
                    ${this.stage === stages.NORMAL
                      ? html`${this.view === views.NORMAL
                          ? html`<div class="w-full max-w-md mx-auto bg-white rounded-lg mt-4">
                              <button
                                type="button"
                                class="flex items-center justify-between w-full p-5 font-medium text-left text-gray-500 border ${this.isDescriptionCollapsed
                                  ? 'rounded-b-xl'
                                  : 'border-b-0'} border-gray-200 rounded-t-xl"
                                @click=${this.handleDescription}
                              >
                                <span class="uppercase">description</span>
                                <svg class="w-6 h-6 rotate-180 shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path
                                    fill-rule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clip-rule="evenodd"
                                  ></path>
                                </svg>
                              </button>
                              ${!this.isDescriptionCollapsed
                                ? html`<div class="p-5 font-light border ${!this.isDescriptionCollapsed ? 'rounded-b-xl' : ''} border-gray-200">
                                    <p
                                      class="flex items-center text-xs"
                                      style="
                                      overflow-y: scroll;
                                      height: 60px;
                                      color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                                    "
                                    >
                                      ${this.mintInfo.description}
                                    </p>
                                  </div>`
                                : null}
                            </div> `
                          : null}
                        ${this.mintInfo.is_multiple_nft && !this.address
                          ? html`
                              <div
                                class="flex flex-col rounded-lg py-2 w-full items-center mt-4"
                                style="
                                  color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                                  border: '1px solid #E8E8E8';
                                  background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#F8F8F8'}
                                  "
                              >
                                <p>Total Collection</p>
                                <p>${this.assets?.length} NFT</p>
                              </div>
                            `
                          : html`
                              <div class="flex flex-row justify-between pt-4 gap-2">
                                <div
                                  class="flex flex-col gap-1 rounded-lg py-2"
                                  style="
                                width: 150px;
                                color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                                border: '1px solid #E8E8E8';
                                background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#F8F8F8'}
                              "
                                >
                                  <p class="flex items-center text-base font-normal justify-center">Price</p>
                                  <p class="flex items-center text-base font-semibold justify-center">
                                    ${!!this.address ? this.mintPrice : '-'} ${!!this.address ? (this.mintInfo.chain === 'ethereum' ? 'ETH' : 'MATIC') : null}
                                  </p>
                                </div>
                                <div
                                  class="flex flex-col gap-1 rounded-lg py-2"
                                  style="
                                width: 150px;
                                color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                                border: '1px solid #E8E8E8';
                                background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#F8F8F8'}
                              "
                                >
                                  <p class="flex items-center text-base font-normal justify-center">Total Mints</p>
                                  <p class="flex items-center text-base font-semibold justify-center">${!!this.address ? this.remainingSupply : '-'}</p>
                                </div>
                              </div>
                            `} `
                      : this.stage === stages.TERMS
                      ? html` ${this.questions.length > 0
                            ? html` <div
                                class="rounded-lg border-solid p-3 justify-between items-center mt-4"
                                style="border-width: 1px;
                                border-color: '#E8E8E8';
                                color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                                background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#F8F8F8'}
                              "
                              >
                                <p class="text-md">You need to answer our questionaire first before mininting.</p>
                              </div>`
                            : null}
                          <div
                            class="rounded-lg border-solid p-3 justify-between items-center mt-4"
                            style="
                            border-width: 1px;
                            border-color: '#E8E8E8';
                            color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'};
                            background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#F8F8F8'}
                          "
                          >
                            <p class="text-md">By completing this process and minting the NFT, you agree with our Terms and Conditions.</p>
                          </div>`
                      : null}
                  </div>
                  <div class="absolute bottom-8 w-full">
                    ${!this.address
                      ? html`<button
                          @click=${this.connectWallet}
                          class="w-full font-normal border border-white border-solid rounded cursor-pointer bg-black mt-2 uppercase"
                          style="
                            padding: 6px;
                            font-size: 14px;
                            color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}
                          "
                        >
                          connect wallet
                        </button> `
                      : this.stage === stages.TERMS
                      ? html`<button
                          @click=${this.handleAgree}
                          class="w-full font-normal border border-white border-solid rounded cursor-pointer bg-black mt-2 uppercase"
                          style="
                            padding: 6px;
                            font-size: 14px;
                            color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}
                          "
                        >
                          agree and proceed
                        </button>`
                      : this.mintProcessing
                      ? html`<div class="flex items-center justify-center w-full h-full"></div>`
                      : this.mintSucceed
                      ? html`
                          <div class="flex flex-col justify-center h-full relative mx-auto">
                            <p
                              class="flex absolute -top-8 items-center justify-center text-xl font-normal w-full items-center text-center"
                              style=" color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'} "
                            >
                              ${this.nftCount} ${this.nftCount > 1 ? 'NFTs' : 'NFT'} successfully minted.
                            </p>
                            <button
                              class="font-normal border border-white border-solid rounded"
                              style="
                                height: 34px;
                                font-size: 14px;
                                color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'};
                                background-color: ${this.mintInfo.checkout_background_color ? `${this.mintInfo.checkout_background_color}80` : '#222221'}
                              "
                              @click=${() => (this.mintSucceed = false)}
                            >
                              OK
                            </button>
                          </div>
                        `
                      : html` <div class="flex flex-col gap-3">
                          ${this.step < this.questions.length
                            ? html`
                                <div class="flex flex-col gap-2">
                                  <div
                                    class="flex flex-row justify-between gap-2"
                                    style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}"
                                  >
                                    <p class="text-xs font-normal">${this.questions[this.step]}</p>
                                    ${this.error[this.step] ? html`<p class="text-xs italic font-normal">required</p>` : null}
                                  </div>
                                  <input
                                    placeholder=${`Answer ${this.step}`}
                                    value=${this.answers[this.step] || ''}
                                    @input=${this.changeAnswer}
                                    class="w-full px-2 py-3 rounded bg-[#252525] text-xs text-black ${this.error[this.step]
                                      ? 'border-2 border-solid border-[#EB5757]'
                                      : 'border'}"
                                    style="border-color: '${this.error[this.step] ? '#EB5757' : '#222221'}'"
                                  />
                                </div>
                                <div class="flex flex-row gap-4 justify-center">
                                  <div
                                    class="flex flex-row gap-2 items-center text-xs cursor-pointer"
                                    style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}"
                                    @click=${this.handleBack}
                                  >
                                    <!-- <Icon icon="akar-icons:arrow-left" /> -->
                                    <p>BACK</p>
                                  </div>
                                  <div
                                    class="flex flex-row gap-2 items-center text-xs cursor-pointer"
                                    style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}"
                                    @click=${this.handleForward}
                                  >
                                    <p>NEXT</p>
                                    <!-- <Icon icon="akar-icons:arrow-right" /> -->
                                  </div>
                                </div>
                              `
                            : null}
                          ${this.step === this.questions.length
                            ? html` <div class="flex flex-row justify-between gap-4 ">
                                ${!this.mintInfo.random_mint
                                  ? html` <div class="relative" style=" width: 50% ">
                                      ${!this.nftCount
                                        ? html`<p
                                            class="absolute text-xs italic font-normal left-1 -top-5"
                                            style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'}"
                                          >
                                            required
                                          </p>`
                                        : null}
                                      <input
                                        placeholder="Number of NFT"
                                        @input=${this.changeNftCount}
                                        class="w-full px-2 rounded h-8 ${!this.nftCount ? 'border-2 border-solid border-[#EB5757]' : 'border'}"
                                        style="border-color: ${!this.nftCount ? '#EB5757' : '#222221'}"
                                      />
                                    </div>`
                                  : null}
                                <button
                                  @click=${this.mintNft}
                                  class="h-8 font-normal border border-solid border-white rounded bg-none cursor-pointer active:enabled:scale-[0.99]"
                                  style="width: ${!this.mintInfo.random_mint ? '50%' : '100%'};
                                    font-size: 14px;
                                    color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'};
                                    background-color: ${this.mintInfo.checkout_background_color ? `'${this.mintInfo.checkout_background_color}80'` : '#222221'}"
                                >
                                  MINT NFT
                                </button>
                              </div>`
                            : null}
                        </div>`}
                  </div>
                </div>
                <div
                  class="flex ${this.breakpoint === 'mobile' || this.view === views.MINI
                    ? 'flex-row items-start justify-start mb-2 px-2'
                    : 'items-center justify-start flex-col mb-0 px-0'} gap-4 z-10"
                >
                  ${this.view === views.NORMAL && this.mintInfo.social_links?.length > 0
                    ? this.mintInfo.social_links.map(
                        (link: any, index: any) => html`
                          <a key=${index} href=${link.url} target="_blank" rel="noreferrer"
                            >${link.name === 'twitter'
                              ? html`${twitter}`
                              : link.name === 'facebook'
                              ? html`${facebook}`
                              : link.name === 'instagram'
                              ? html`${instagram}`
                              : link.name === 'discord'
                              ? html`${discord}`
                              : null}</a
                          >
                        `
                      )
                    : null}
                  <div class="cursor-pointer">${!!this.address ? html`${out}` : null}</div>
                </div>
                <div class="absolute bottom-2 flex flex-row gap-2 w-full items-center justify-center">
                  <p class="text-xs font-normal" style="color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : '#222221'}">
                    Powered by:
                  </p>
                  ${logo}
                </div>
              </div>`
            : html`
                <div class="flex ${this.breakpoint === 'mobile' || this.view === views.MINI ? 'gap-4 flex-col' : 'gap-6 mx-10 flex-row'} p-9 mx-auto">
                  <div class="flex flex-col gap-8">
                    <div
                      class="grid w-full ${this.view === views.MINI
                        ? 'grid-cols-3 grid-rows-4'
                        : this.breakpoint === 'mobile'
                        ? 'grid-cols-4 grid-rows-4'
                        : 'grid-cols-8 grid-rows-3'} gap-4"
                    >
                      ${this.assets
                        ?.slice((this.currentPage - 1) * this.limit, this.currentPage * this.limit)
                        .map(
                          (asset: any, index: any) =>
                            html`<img
                              key="${index}"
                              src="${asset.image}"
                              class="cursor-pointer w-20 h-20 rounded-xl"
                              style=" box-shadow: ${index === this.selectedNftIndex ? '0px 0px 4px 2px #109BEA' : 'none'}"
                              @click=${() => this.handleSelectNFT(index, asset)}
                            />`
                        )}
                    </div>
                    <div class="flex ${this.breakpoint === 'mobile' || this.view === views.MINI ? 'flex-col' : 'flex-row'} justify-between items-center">
                      ${this.assets
                        ? html`<lit-pagination
                            page="1"
                            total=${this.assets.length}
                            limit=${this.view === views.MINI ? 12 : this.breakpoint === 'mobile' ? 16 : 24}
                            size="2"
                            @click=${() => this.handlePagination()}
                          ></lit-pagination>`
                        : null}
                      <button
                        class="w-60 font-normal border border-white border-solid rounded cursor-pointer bg-black mt-2 uppercase disabled:cursor-not-allowed"
                        style="
                          padding: 6px;
                          font-size: 14px;
                          color: ${this.mintInfo.checkout_font_color ? `${this.mintInfo.checkout_font_color}` : 'white'};
                        "
                        .disabled=${this.selectedNftIndex !== undefined && !isNaN(this.selectedNftIndex) ? false : true}
                        @click=${() => {
                          this.stage = this.questions.length > 0 ? stages.QUESTION : stages.NORMAL;
                        }}
                      >
                        choose nft
                      </button>
                    </div>
                  </div>
                  <div
                    class="flex ${this.breakpoint === 'mobile'
                      ? 'flex-row items-start justify-start mb-2 px-2'
                      : 'items-center justify-start flex-col mb-0 px-0'} gap-4 z-10"
                  >
                    ${this.view === views.NORMAL && this.mintInfo.social_links?.length > 0
                      ? this.mintInfo.social_links.map(
                          (link: any, index: any) => html`
                            <a key=${index} href=${link.url} target="_blank" rel="noreferrer"
                              >${link.name === 'twitter'
                                ? html`${twitter}`
                                : link.name === 'facebook'
                                ? html`${facebook}`
                                : link.name === 'instagram'
                                ? html`${instagram}`
                                : link.name === 'discord'
                                ? html`${discord}`
                                : null}</a
                            >
                          `
                        )
                      : null}
                    <div class="cursor-pointer">${!!this.address ? html`${out}` : null}</div>
                  </div>
                </div>
              `}
        </div>
      </div>
    `;
  }
}
