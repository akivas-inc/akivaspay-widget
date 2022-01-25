# akivaspay widget
It's a widget that can be embedded in every website to accept akivasPay payments.

## Install
```
npm install git+ssh://git@github.com/akivas-inc/akivaspay-widget.git
```
## Usage
The widget needs to be initialize with your shop subscription key, which you can get from the [dashboard](https://test.akivaspay.com).

```js
// ES6 Modules or TypeScript
import AkivasPayWidget from "akivaspay-widget"

// CommonJS
const AkivasPayWidget = require('akivaspay-widget')

// create an instance of akivaspay widget
const widget = new AkivasPayWidget(
    'YOUR_SHOP_SUBSCRIPTION_KEY',
    'en' // by default locale is set to en if you want your widget to be in french set the locale param to fr
);

// subscribe to apay-transaction-success event to receive the transaction data when the purchase is done
widget.on('apay-transaction-success', (transaction) => {
    console.log(transaction);
})

// subscribe to apay-regenerate-widget event to generate a new widget when the old one expired
widget.on('apay-regenerate-widget', () => {
    widget.regenerate(
        'Pen', 
        'NEW_EXTERNAL_ID', // new external id
        '100' // same amount of the previous qr code amount
    );
})

// call the widget
widget.generate(
    'Pen', // name of the qrcode
    'EXTERNAL_ID', // external id to get your transaction
    '100' // amount of the qr code
);
```