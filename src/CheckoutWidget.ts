import { ethers } from "ethers";
import { LitElement, html } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { getMintInfo } from "./api/mint";

@customElement('checkout-widget')
export class CheckoutWidget extends LitElement {
    @property({type: Object})
    mintInfo: any = {}

    async connectedCallback(): Promise<void> {
        super.connectedCallback();

        const response = await getMintInfo('f3e47701-a883-48d7-9e9a-d985792ab12e');
        this.mintInfo = response;
        console.log(this.mintInfo);

    }

    render() {
        return html`
            <span>First test</span>
            <button @click=${this.connectWallet}>Connect Wallet</button>
        `;
    }

    async connectWallet(event: Event) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
    }
    
}