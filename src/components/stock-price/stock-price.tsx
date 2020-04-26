import { Component, h, State, Prop, Watch , Element, Listen } from "@stencil/core";
import { API_KEY } from "../global/global";

@Component({
    tag : 'stock-price',
    styleUrl : './stock-price.css',
    shadow : true
})

export class StockPrice {
    stockInput: HTMLInputElement;
    @Element() el: HTMLElement;
    @State() fetchedPrice: number;
    @State() stockUserInput: string;
    @State() stockInputValid = false;
    @State() error: string;
    @State() loading = false;
    @Prop({ mutable: true, reflectToAttr: true }) stockSymbol: string;
    @Watch('stockSymbol')


    stockSymbolChanged(newValue: string, oldValue: string) {
        if (newValue !== oldValue) {
            console.log('nuevo valor', newValue);
            this.stockUserInput = newValue;
            this.stockInputValid = true;
            this.fecthStockPrice(newValue);
        }
    }


    onUserInput(event: Event) {
        this.stockUserInput = (event.target as HTMLInputElement).value;
        (this.stockUserInput.trim() !== '') ? this.stockInputValid = true : this.stockInputValid = false;
        console.log('this.stockUserInput', this.stockUserInput);
    }

    onFetchStockPrice(event: Event) {
        event.preventDefault();
        console.log('Submited');

        // const stockSymbol = (this.el.shadowRoot.querySelector('#stock-symbol') as HTMLInputElement).value;
        this.stockSymbol = this.stockInput.value;
        /*   this.fecthStockPrice(this.stockSymbol);  */
        console.log(' this.stockSymbol ', this.stockSymbol);

    }

    componentDidLoad() {

        console.log('CICLO 1', this.stockSymbol);

        if (this.stockSymbol) {
            this.stockUserInput = this.stockSymbol;
            this.stockInputValid = true;
            this.fecthStockPrice(this.stockSymbol);

        }
    }

    componentDidUpdate() {
        console.log('ComponentDidUpdate');
    }
    @Listen('ucSymbolSelected', {target : 'body'})
    onStockSymbolSelected (event : CustomEvent) {
        console.log('stock price symbol slected' + event.detail);
        if (event.detail && event.detail !== this.stockSymbol) {
           // this.fecthStockPrice(event.detail);
           this.stockSymbol = event.detail
            
        }
        
    }

    fecthStockPrice(stockSymbol: string) {
        this.loading = true;
        fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${API_KEY}`

        ).then(res => {
            return res.json();
        }).then(parseRes => {
            console.log('PARSERES', parseRes);

            if (parseRes['Error Message']) {
                console.log('aqui');

                throw new Error('Invalid symbol !');
            }
            this.fetchedPrice = +parseRes['Global Quote']['05. price'];
            console.log(this.fetchedPrice);
            this.error = null;
            this.loading = false;
        }).catch(err => {
            this.error = err.message;
            this.fetchedPrice = null;
            this.loading = false;

        });
    }


    hostData(){
        return {class : this.error ? 'hydrated error' : ''}
    }
    render() {

        let dataContent = <p>Please enter a symbol !</p>;
        if (this.error) {
            console.log('ingresa dentrois', this.error);
            dataContent = <p>{this.error}</p>
        }

        if (this.fetchedPrice) {
            console.log('this.fechaerd', this.fetchedPrice);
            dataContent = <p>Price : ${this.fetchedPrice}</p>
        }

        if (this.loading) {
            dataContent = <uc-spinner></uc-spinner>
        }
        return [
            <form onSubmit={this.onFetchStockPrice.bind(this)}>
                <input id="stock-symbol" ref={el => { this.stockInput = el }}
                    value={this.stockUserInput}
                    onInput={this.onUserInput.bind(this)} />
                <button type="submit" disabled={!this.stockInputValid || this.loading}>Fetch</button>
            </form>,
            <div>
                {dataContent}
            </div>
        ]
    }
}