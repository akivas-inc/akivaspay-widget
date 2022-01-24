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
    'YOUR_LOCALE' // locale can be either **en** or **fr**
);

// subscribe to apay-transaction event to receive the transaction data when the purchase is done
widget.on('apay-transaction', (data) => {
    console.log(data);
})

// call the widget
widget.show(
    'Pen', // name of the qrcode
    '1212121212', // external id to get your transaction
    '100' // amount of the qr code
);
```