import { Component, State, Event, EventEmitter, h} from "@stencil/core";
import { API_KEY } from "../global/global";

@Component({
    tag : 'stock-find',
    styleUrl : './stock-find.css',
    shadow : true    
})

export class StockFind {
  stockNameInput: HTMLInputElement;
  @State() searchResults: { name: string, symbol: string }[] = [];
  @Event({ bubbles: true, composed: true }) ucSymbolSelected: EventEmitter<string>;
  @State() loading = false;

  onFindStocks(event: Event) {
    this.loading = true
    event.preventDefault();
    const stockName = this.stockNameInput.value;
    fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${stockName}&apikey=${API_KEY}`
    ).then(res => res.json())
      .then(parseRes => {
        this.searchResults = parseRes['bestMatches'].map(match => {
          return {
            name: match['2. name'],
            symbol: match['1. symbol']
          }
        });
        console.log(parseRes);
        this.loading= false;
      })
      .catch(err => {
        console.log(err);
        this.loading = false;

      })
  }

  onSelectSymbol(symbol: string) {
    this.ucSymbolSelected.emit(symbol);
    console.log('Que emite', symbol);

  }
  render() {
    let content = this.searchResults.map(resut => {
      return <li onClick={this.onSelectSymbol.bind(this, resut.symbol)}>  <strong>{resut.symbol} - </strong>   {resut.name}</li>
    })
    if (this.loading) {
      content = <uc-spinner></uc-spinner>
    }
    return [
      <form onSubmit={this.onFindStocks.bind(this)}>
        <input id="stock-symbol" ref={el => { this.stockNameInput = el }}></input>
        <button type="submit" >Find !</button>
      </form>,
      <ul>
        {content}
      </ul>
    ];
  }
}