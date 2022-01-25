require("./main.css");

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "AkivasPayWidget", () => $debc315a2be2d942$export$defd62c0a9a12f72, (v) => $debc315a2be2d942$export$defd62c0a9a12f72 = v);
const $0d8a3a7d0b18547c$var$translations = {
    "en": {
        "qr-code-expired": "The Qrcode has expired",
        "scan-to-pay": "Scan to pay",
        "open-in-wallet": "Open in Wallet",
        "how-to-pay": "How do i pay?",
        "awaiting-payment": "Awaiting Payment ...",
        "successful-purchase-msg": "The payment has been successfully completed",
        "regenerate": "regenerate"
    },
    "fr": {
        "qr-code-expired": "Le Qrcode a expiré",
        "scan-to-pay": "Scannez pour payer",
        "open-in-wallet": "Ouvrir dans le portefeuille",
        "how-to-pay": "Comment payer ?",
        "awaiting-payment": "En attente de paiement...",
        "successful-purchase-msg": "Le paiement a été effectué avec succès",
        "regenerate": "régénérer"
    }
};
class $0d8a3a7d0b18547c$export$b6fc69901997e05 {
    static get(locale, key) {
        return $0d8a3a7d0b18547c$var$translations[locale][key];
    }
}


const $2657731041a91f20$export$b9ca24a255e1ad7a = Object.freeze({
    INITIALIZING: 'initializing',
    WAITING: 'waiting',
    LOADING: 'loading',
    FAILED: 'failed',
    SUCCESS: 'success'
});
const $2657731041a91f20$export$231a189a075bf5ec = [
    'en',
    'fr'
];
const $2657731041a91f20$export$66c8564ff9f24ca2 = 'en';
const $2657731041a91f20$export$3dc27271f5d5c629 = (number, separator)=>{
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
class $2657731041a91f20$export$9f633d56d7ec90d3 {
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
const $2657731041a91f20$export$1cf57cfcc6726c1e = (content = '')=>`
    <div id="apBoxHeader">
        <div id="apLogo">
            <div id="apLogoCircle">
                <img src="https://api.apay.akivaspay.com/images/AKIVASPAY.png" alt="AkivasPay" />
            </div>
            <div id="apLogoText">AkivasPay</div>
        </div>
        ${content}
    </div>
`
;
const $2657731041a91f20$export$c31d0b96a47b16ab = (expired, requestStatus, locale)=>`
    <div id="apTimer" style="background-color: ${expired ? 'red' : '#3cb364'}">
        ${expired == true ? `
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(locale, 'qr-code-expired')}</span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : requestStatus == $2657731041a91f20$export$b9ca24a255e1ad7a.WAITING ? `
                <span id="apTimerMovement"></span>
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(locale, 'awaiting-payment')} </span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : ''}
    </div>
`
;



class $debc315a2be2d942$export$defd62c0a9a12f72 {
    baseUrl = "https://api.apay.akivaspay.com/";
    shopSubscriptionKey;
    success = true;
    requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.INITIALIZING;
    timeExpired = false;
    errorMessage = '';
    locale;
    apayContainer;
    modal;
    response = new $2657731041a91f20$export$9f633d56d7ec90d3();
    checkTransactionInterval;
    timerInterval;
    events = {
        'apay-transaction-success': [],
        'apay-regenerate-widget': []
    };
    constructor(shopSubscriptionKey, locale = $2657731041a91f20$export$66c8564ff9f24ca2){
        this.shopSubscriptionKey = shopSubscriptionKey;
        if (locale in $2657731041a91f20$export$231a189a075bf5ec) this.locale = locale;
        else this.locale = $2657731041a91f20$export$66c8564ff9f24ca2;
        this.apayContainer = document.createElement('div');
        this.initWidget();
    }
    initWidget() {
        this.apayContainer.innerHTML = '<div class="akivas-pay-modal" id="akivaspayModal" data-animation="slideInOutLeft"></div>';
        document.querySelector('body').appendChild(this.apayContainer);
        this.modal = document.getElementById("akivaspayModal");
    }
    regenerateCodeClickEventListener() {
        const regenerateBtn = document.getElementById('apay-regenerate');
        if (regenerateBtn != null && this.timeExpired) regenerateBtn.addEventListener('click', ()=>{
            this.emit('apay-regenerate-widget');
        });
    }
    closeClickEventListener() {
        const closeElts = Object.values(document.getElementsByClassName('apay-close-widget'));
        if (closeElts.length > 0) closeElts.forEach((el)=>{
            el.addEventListener('click', ()=>{
                this.closeWidget();
            });
        });
    }
    updateWidget() {
        this.modal.innerHTML = this.getWidget();
        this.closeClickEventListener();
    }
    showModal() {
        this.modal.innerHTML = this.getWidget();
        this.closeClickEventListener();
    }
    async regenerate(name, external_uuid, amount, description = '') {
        this.timeExpired = false;
        this.success = false;
        this.errorMessage = '';
        this.generate(name, external_uuid, amount, description);
    }
    async generate(name, external_uuid, amount, description = '') {
        this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.LOADING;
        this.modal.classList.add('visible');
        this.showModal();
        let data = {
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
                "Accept-Language": this.locale,
                "Shop-Subscription-Key": this.shopSubscriptionKey
            },
            body: JSON.stringify(data)
        });
        if (response.ok) response.json().then((json)=>{
            this.response = new $2657731041a91f20$export$9f633d56d7ec90d3(json.image, json.domain, json.link, name, amount);
            this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.WAITING;
            this.updateWidget();
            var timer = document.getElementById('timer');
            timer.textContent = "30:0";
            this.startTimer();
            this.checkTransactionStatus(json.uuid).then();
        });
        else response.json().then((json)=>{
            this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.FAILED;
            this.errorMessage = json.message;
            this.updateWidget();
        });
    }
    getWidget() {
        const timerHTML = $2657731041a91f20$export$c31d0b96a47b16ab(this.timeExpired, this.requestStatus, this.locale);
        var $content = `
            <div class="apay-center-content" style="visibility: ${this.requestStatus === $2657731041a91f20$export$b9ca24a255e1ad7a.LOADING ? 'visible' : 'hidden'}">
                <div id="apay-loading"></div>
            </div>
            <div class="apay-center-content" style="text-align: center; color: red; visibility: ${this.requestStatus === $2657731041a91f20$export$b9ca24a255e1ad7a.FAILED ? 'visible' : 'hidden'}">
                ${this.errorMessage}
            </div>
            <div data-animation="slideInOutLeft" class="apay-widget apay-overflow-scroll-container" style="visibility: ${this.requestStatus === $2657731041a91f20$export$b9ca24a255e1ad7a.WAITING ? 'visible' : 'hidden'}">
                <div id="apBox">
                    ${$2657731041a91f20$export$1cf57cfcc6726c1e(timerHTML)}
                    <div id="apPrice">
                        <div>
                            <p id="apScantoPayText" style="font-weight: 400; color: 989898">
                                ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'scan-to-pay')}
                            </p>
                    
                            <p id="apTo" style="font-weight: 300">
                                <strong style="font-weight: 400; color: 607d8b"
                                >${this.response.domain}</strong
                                >
                            </p>
                        </div>
                        <div style="color: black">
                            <span style="font-size: 20px; font-weight: 400"> ${$2657731041a91f20$export$3dc27271f5d5c629(this.response.amount)}</span>
                            <sup style="font-weight: 500">FCFA</sup>
                        </div>
                    </div>
                    <div id="apBoxBody">
                        <h1 class="apay-qr-name">${this.response.name}</h1>
                        <div id="apQrcodeBox">
                            <img src="${this.response.image}" alt="qrcode" style="visibility: ${!this.timeExpired && this.requestStatus === $2657731041a91f20$export$b9ca24a255e1ad7a.WAITING ? 'visible' : 'hidden'}"/>
                        </div>
                        <a id="howToPay" href="https://test.akivaspay.com/client-documentation/web-payment" target="_blank">${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'how-to-pay')}</a>
                        <a href="${this.response.link}" class="apay-button" target="_blank">
                            ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'open-in-wallet')}
                        </a>
                        <br />
                    </div>
                </div>
            </div>
        `;
        if (this.success) $content = `
                <div class="apay-widget">
                    <div id="apBox">
                        ${$2657731041a91f20$export$1cf57cfcc6726c1e(timerHTML)}
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
                            <a href="#" class="apay-sucess-button apay-close-widget">
                                ok
                            </a>
                        </div>
                    </div>
                </div>
            `;
        else if (this.timeExpired) $content = `
                <div class="apay-widget">
                    <div id="apBox">
                        ${$2657731041a91f20$export$1cf57cfcc6726c1e(timerHTML)}
                        <div id="apPrice">
                            <div>
                                <p id="apScantoPayText" style="font-weight: 400; color: 989898">
                                    ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'scan-to-pay')}
                                </p>
                        
                                <p id="apTo" style="font-weight: 300">
                                    <strong style="font-weight: 400; color: 607d8b"
                                    >${this.response.domain}</strong
                                    >
                                </p>
                            </div>
                            <div style="color: black">
                                <span style="font-size: 20px; font-weight: 400"> ${$2657731041a91f20$export$3dc27271f5d5c629(this.response.amount)}</span>
                                <sup style="font-weight: 500">FCFA</sup>
                            </div>
                        </div>
                        <div id="apBoxBody">
                            <div id="apQrcodeBox">
                                <span style="color: red;">
                                    ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'qr-code-expired')}
                                </span>
                            </div>
                            <a href="#" id="apay-regenerate" class="apay-button">
                                ${$0d8a3a7d0b18547c$export$b6fc69901997e05.get(this.locale, 'regenerate')}
                            </a>
                            <br />
                        </div>
                    </div>
                </div>
            `;
        return `
            <div>
                <button id="apay-close-btn" class="apay-close-widget">
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
        this.checkTransactionInterval = setInterval(async ()=>{
            if (this.timeExpired && this.checkTransactionInterval !== null) {
                clearInterval(this.checkTransactionInterval);
                return;
            }
            var response = await fetch(this.baseUrl + 'find/transaction/' + uuid + "?filter_by=uuid", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Accept-Language": this.locale,
                    "Shop-Subscription-Key": this.shopSubscriptionKey
                }
            });
            if (response.status == 200) response.json().then((json)=>{
                if (json.success == true) {
                    this.success = true;
                    this.timeExpired = false;
                    this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.SUCCESS;
                    this.updateWidget();
                    this.emit('apay-transaction-success', json);
                    clearInterval(this.checkTransactionInterval);
                }
            });
            else response.json().then((json)=>{
                this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.FAILED;
                this.errorMessage = json.message;
                this.updateWidget();
                clearInterval(this.checkTransactionInterval);
            });
        }, 2500);
    }
    startTimer() {
        this.timerInterval = setInterval(()=>{
            try {
                let timer = document.getElementById('timer').innerHTML;
                let timeArray = timer.split(/[:]+/);
                let m = parseInt(timeArray[0]);
                let s = $debc315a2be2d942$export$defd62c0a9a12f72.formatSeconds(parseInt(timeArray[1] - 1));
                if (s === '59') m = m - 1;
                if (this.success) clearInterval(this.timerInterval);
                if (m < 0 || m === 0 && s === '00') {
                    this.timeExpired = true;
                    document.getElementById('timer').textContent = "";
                    this.updateWidget();
                    this.regenerateCodeClickEventListener();
                    clearInterval(this.timerInterval);
                } else if (m == NaN || s == NaN) clearInterval(this.timerInterval);
                else {
                    document.getElementById('timer').textContent = m.toString() + ":" + s.toString();
                    let percent = m / 30 * 100;
                    document.getElementById('apTimerMovement').style.width = percent + "%";
                }
            } catch (e) {
            }
        }, 100);
    }
    static formatSeconds(sec) {
        if (sec < 10 && sec >= 0) sec = "0" + sec;
        if (sec < 0) sec = "59";
        return sec;
    }
    closeWidget() {
        this.requestStatus = $2657731041a91f20$export$b9ca24a255e1ad7a.INITIALIZING;
        if (this.modal) {
            this.modal.classList.remove('visible');
            this.$modal = null;
        }
        if (this.checkTransactionInterval) clearInterval(this.checkTransactionInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timeExpired = false;
        this.success = false;
    }
    on(event, listener) {
        if (!(event in this.events)) this.events[event] = [];
        if (event === 'apay-regenerate-widget' && this.events[event].length > 0) throw Error(`Cannot listen to apay-regenerate-widget event twice`);
        this.events[event].push(listener);
    }
    emit(event, ...args) {
        if (!(event in this.events)) return;
        this.events[event].forEach((listener)=>listener(...args)
        );
    }
}
module.exports = $debc315a2be2d942$export$defd62c0a9a12f72;


//# sourceMappingURL=main.js.map
