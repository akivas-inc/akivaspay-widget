require("./main.css");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "AkivasPayWidget", () => $4fa36e821943b400$export$defd62c0a9a12f72, (v) => $4fa36e821943b400$export$defd62c0a9a12f72 = v);
const $20b4a97a61b3fccb$export$b9ca24a255e1ad7a = Object.freeze({
    INITIALIZING: 'initializing',
    WAITING: 'waiting',
    LOADING: 'loading',
    FAILED: 'failed'
});
const $20b4a97a61b3fccb$export$e772c8ff12451969 = (ms)=>{
    return new Promise((resolve)=>setTimeout(resolve, ms)
    );
};
const $20b4a97a61b3fccb$export$231a189a075bf5ec = [
    'en',
    'fr'
];
const $20b4a97a61b3fccb$export$66c8564ff9f24ca2 = 'en';
const $20b4a97a61b3fccb$export$3dc27271f5d5c629 = (number, separator)=>{
    if (number) {
        let splitArray = number.toString().split('.');
        let decimalPart = '';
        if (splitArray.length > 1) {
            number = splitArray[0];
            decimalPart = '.' + splitArray[1];
        }
        let formattedNumber = number.toString().replace(/\D/g, "");
        let rest = formattedNumber.length % 3;
        let currency = formattedNumber.substr(0, rest);
        let thousand = formattedNumber.substr(rest).match(/\d{3}/g);
        if (thousand) {
            separator = rest ? separator ? separator : "," : "";
            currency += separator + thousand.join(",");
        }
        return currency + decimalPart;
    } else return "0";
};
class $20b4a97a61b3fccb$export$9f633d56d7ec90d3 {
    constructor(image, domain, link, name, amount){
        Object.assign(this, {
            image: image,
            domain: domain,
            link: link,
            name: name,
            amount: amount
        });
    }
}


const $165a57180b7edd0a$var$translations = {
    "en": {
        "qr-code-expired": "The Qrcode has expired",
        "scan-to-pay": "Scan to pay",
        "open-in-wallet": "Open in Wallet",
        "how-to-pay": "How do i pay?",
        "awaiting-payment": "Awaiting Payment ...",
        "successful-purchase-msg": "The payment has been successfully completed"
    },
    "fr": {
        "qr-code-expired": "Le Qrcode a expiré",
        "scan-to-pay": "Scannez pour payer",
        "open-in-wallet": "Ouvrir dans le portefeuille",
        "how-to-pay": "Comment payer ?",
        "awaiting-payment": "En attente de paiement...",
        "successful-purchase-msg": "Le paiement a été effectué avec succès"
    }
};
class $165a57180b7edd0a$export$b6fc69901997e05 {
    static get(locale, key) {
        return $165a57180b7edd0a$var$translations[locale][key];
    }
}



class $4fa36e821943b400$export$defd62c0a9a12f72 {
    baseUrl = "https://api.apay.akivaspay.com/";
    shopSubscriptionKey;
    cancel = false;
    success = false;
    requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.INITIALIZING;
    timeExpired = false;
    errorMessage = '';
    locale;
    apayContainer;
    modal;
    response = new $20b4a97a61b3fccb$export$9f633d56d7ec90d3();
    interval;
    events = {
        'apay-transaction': []
    };
    constructor(shopSubscriptionKey, locale = $20b4a97a61b3fccb$export$66c8564ff9f24ca2){
        this.shopSubscriptionKey = shopSubscriptionKey;
        if (locale in $20b4a97a61b3fccb$export$231a189a075bf5ec) this.locale = locale;
        else this.locale = $20b4a97a61b3fccb$export$66c8564ff9f24ca2;
        this.apayContainer = document.createElement('div');
        this.initWidget();
    }
    initWidget() {
        this.apayContainer.innerHTML = '<div class="akivas-pay-modal" id="akivaspayModal" data-animation="slideInOutLeft"></div>';
        document.querySelector('body').appendChild(this.apayContainer);
        this.modal = document.getElementById("akivaspayModal");
    }
    closeWidgetEventListener() {
        const closeEl = document.getElementById('apay-close-btn');
        if (closeEl) closeEl.addEventListener('click', ()=>{
            this.closeWidget();
        });
    }
    updateWidget() {
        this.modal.innerHTML = this.getWidget();
        this.closeWidgetEventListener();
    }
    showModal() {
        this.modal.innerHTML = this.getWidget();
        this.closeWidgetEventListener();
    }
    async show(name, external_uuid, amount, description = '') {
        this.requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.LOADING;
        this.modal.classList.add('visible');
        this.showModal();
        let data = {
            "shop-subscription-key": this.shopSubscriptionKey,
            "name": name,
            "uuid": external_uuid,
            "amount": amount,
            "description": description
        };
        var response = await fetch(this.baseUrl + 'generate/qrcode', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Language": this.locale
            },
            body: JSON.stringify(data)
        });
        if (response.ok) response.json().then((json)=>{
            this.response = new $20b4a97a61b3fccb$export$9f633d56d7ec90d3(json.image, json.domain, json.link, name, amount);
            this.requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.WAITING;
            this.updateWidget();
            document.getElementById('timer').innerHTML = "30:0";
            this.startTimer().then();
            this.checkTransactionStatus(json.uuid).then();
        });
        else response.json().then((json)=>{
            this.requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.FAILED;
            this.errorMessage = json.message;
            this.updateWidget();
        });
    }
    getWidget() {
        var $content = `
            <div class="apay-center-content" style="visibility: ${this.requestStatus === $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.LOADING ? 'visible' : 'hidden'}">
                <div id="apay-loading"></div>
            </div>
            <div class="apay-center-content" style="text-align: center; color: red; visibility: ${this.requestStatus === $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.FAILED ? 'visible' : 'hidden'}">
                ${this.errorMessage}
            </div>
            <div class="apay-widget" style="visibility: ${this.requestStatus === $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.WAITING ? 'visible' : 'hidden'}">
                <div id="apBox">
                    <div id="apBoxHeader">
                        <div id="apLogo">
                            <div id="apLogoCircle">
                                <img src="./../images/akivaspay.png" alt="AkivasPay" />
                            </div>
                            <div id="apLogoText">AkivasPay</div>
                        </div>
                        <div id="apTimer">
                            <div style="background-color: ${this.timeExpired ? 'red' : 'transparent'}">
                                <span id="apTimerMovement"></span>
                                <span id="apTimerText">
                                    <span id="apTimerText-left"> ${this.timeExpired ? $165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'qr-code-expired') : this.success ? $165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'successful-purchase-msg') : $165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'awaiting-payment')} </span>
                                    <span id="apTimerText-right"> 
                                        <span id="timer"></span> 
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="apPrice">
                        <div>
                            <p id="apScantoPayText" style="font-weight: 400; color: 989898">
                                ${$165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'scan-to-pay')}
                            </p>
                    
                            <p id="apTo" style="font-weight: 300">
                                <strong style="font-weight: 400; color: 607d8b"
                                >${this.response.domain}</strong
                                >
                            </p>
                        </div>
                        <div style="color: black">
                            <span style="font-size: 20px; font-weight: 400"> ${$20b4a97a61b3fccb$export$3dc27271f5d5c629(this.response.amount)}</span>
                            <sup style="font-weight: 500">FCFA</sup>
                        </div>
                    </div>
                    <div id="apBoxBody" style="padding-right: 10px">
                        <h3 style="font-weight: bold; text-align: center; margin-top:10px; padding-left: 10px;">${this.response.name}</h3>
                        <div id="apQrcodeBox">
                            <img src="${this.response.image}" width="150" height="150" alt="qrcode" style="visibility: ${!this.timeExpired && this.requestStatus === $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.WAITING ? 'visible' : 'hidden'}"/>
                        </div>
                        <a id="howToPay" href="https://test.akivaspay.com/client-documentation/web-payment" target="_blank">${$165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'how-to-pay')}</a>
                        <a href="${this.response.link}" class="apay-button" target="_blank">
                            ${$165a57180b7edd0a$export$b6fc69901997e05.get(this.locale, 'open-in-wallet')}
                        </a>
                        <br />
                    </div>
                </div>
            </div>
        `;
        if (this.success) $content = `
                <div class="apay-widget">
                    <div id="apBox">
                        <div id="apBoxHeader">
                            <div id="apLogo">
                                <div id="apLogoCircle">
                                    <img src="./../images/akivaspay.png" alt="AkivasPay" />
                                </div>
                                <div id="apLogoText">AkivasPay</div>
                            </div>
                        </div>
                        <div id="apay-success-content">
                            <div class="apay-success-checkmark">
                                <div class="check-icon">
                                    <span class="icon-line line-tip"></span>
                                    <span class="icon-line line-long"></span>
                                    <div class="icon-circle"></div>
                                    <div class="icon-fix"></div>
                                </div>
                            </div>
                            <h3 class="apay-text-success">Sucessfull purchase</h3>
                            <button class="apay-sucess-button">
                                ok
                            </button>
                        </div>
                    </div>
                </div>
            `;
        return `
            <div>
                <button id="apay-close-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div>
                    ${$content}
                </div>
            </div>
        `;
    }
    async checkTransactionStatus(uuid) {
        if ((this.cancel || this.timeExpired) && this.interval !== null) clearInterval(this.interval);
        this.interval = setInterval(async ()=>{
            var response = await fetch(this.baseUrl + 'find/transaction/' + uuid + "?filter_by=uuid&shop-subscription-key=" + this.shopSubscriptionKey, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Accept-Language": this.locale
                }
            });
            if (response.status == 200) {
                this.success = true;
                this.updateWidget();
                this.emit('apay-transaction', response);
            } else if (response.status == 406) ;
            else response.json().then((json)=>{
                this.requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.FAILED;
                this.errorMessage = json.message;
                this.updateWidget();
                clearInterval(this.interval);
            });
        }, 2500);
    }
    async startTimer() {
        try {
            let timer = document.getElementById('timer').innerHTML;
            let timeArray = timer.split(/[:]+/);
            let m = timeArray[0];
            let s = $4fa36e821943b400$export$defd62c0a9a12f72.checkSecond(timeArray[1] - 1);
            if (s === "59") m = m - 1;
            if (this.success) return;
            if (m < 0) {
                this.timeExpired = true;
                this.updateWidget();
                return;
            }
            document.getElementById('timer').innerHTML = m + ":" + s;
            let percent = m / 30 * 100;
            document.getElementById('apTimerMovement').style.width = percent + "%";
            await $20b4a97a61b3fccb$export$e772c8ff12451969(500);
            return this.startTimer();
        } catch (e) {
        }
    }
    static checkSecond(sec) {
        if (sec < 10 && sec >= 0) sec = "0" + sec;
        if (sec < 0) sec = "59";
        return sec;
    }
    closeWidget() {
        this.requestStatus = $20b4a97a61b3fccb$export$b9ca24a255e1ad7a.INITIALIZING;
        if (this.modal) {
            this.modal.classList.remove('visible');
            this.$modal = null;
        }
        if (this.interval) clearInterval(this.interval);
        this.cancel = true;
    }
    on(event, listener) {
        if (!(event in this.events)) this.events[event] = [];
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        if (!(event in this.events)) return;
        this.events[event].forEach((listener)=>listener(...args)
        );
    }
}
module.exports = $4fa36e821943b400$export$defd62c0a9a12f72;


//# sourceMappingURL=main.js.map
