import { STATUS_OF_REQUEST, formatCurrency, Response, fallback_locale, supported_locales, widgetHeader, timerSection, Localization } from "./helpers.js";
import styles from './styles.css';

export class AkivasPayWidget {
    baseUrl = "https://api.apay.akivaspay.com/";
    shopSubscriptionKey;
    success = true;
    requestStatus = STATUS_OF_REQUEST.INITIALIZING;
    timeExpired = false;
    errorMessage = '';
    locale;
    apayContainer;
    modal;
    response = new Response();
    checkTransactionInterval;
    timerInterval;
    events = {
        'apay-transaction-success': [],
        'apay-regenerate-widget': []
    };

    constructor(shopSubscriptionKey, locale = fallback_locale) {
        this.shopSubscriptionKey = shopSubscriptionKey;
        if (locale in supported_locales) {
            this.locale = locale;
        }
        else {
            this.locale = fallback_locale;
        }
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
        if (regenerateBtn != null && this.timeExpired) {
            regenerateBtn.addEventListener('click', () => {
                this.emit('apay-regenerate-widget');
            });
        }
    }

    closeClickEventListener() {
        const closeElts = Object.values(document.getElementsByClassName('apay-close-widget'));
        if (closeElts.length > 0) {
            closeElts.forEach(el => {
                el.addEventListener('click', () => {
                    this.closeWidget();
                })
            });
        }
        
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
        this.requestStatus = STATUS_OF_REQUEST.LOADING;
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
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            response.json().then((json) => {
                this.response = new Response(
                    json.image,
                    json.domain,
                    json.link,
                    name,
                    amount
                );
                this.requestStatus = STATUS_OF_REQUEST.WAITING;
                this.updateWidget();
                var timer = document.getElementById('timer');
                timer.textContent = 30 + ":" + 0;
                this.startTimer();
                this.checkTransactionStatus(json.uuid).then()
            });
            
        }
        else {
            response.json().then((json) => {
                this.requestStatus = STATUS_OF_REQUEST.FAILED;
                this.errorMessage = json.message;
                this.updateWidget();
            });
            
        }
        
    }

    getWidget() {
        const timerHTML = timerSection(this.timeExpired, this.requestStatus, this.locale);
        var $content = `
            <div class="apay-center-content" style="visibility: ${this.requestStatus === STATUS_OF_REQUEST.LOADING ? 'visible' : 'hidden'}">
                <div id="apay-loading"></div>
            </div>
            <div class="apay-center-content" style="text-align: center; color: red; visibility: ${this.requestStatus === STATUS_OF_REQUEST.FAILED ? 'visible' : 'hidden'}">
                ${this.errorMessage}
            </div>
            <div data-animation="slideInOutLeft" class="apay-widget apay-overflow-scroll-container" style="visibility: ${this.requestStatus === STATUS_OF_REQUEST.WAITING ? 'visible' : 'hidden'}">
                <div id="apBox">
                    ${ widgetHeader(timerHTML) }
                    <div id="apPrice">
                        <div>
                            <p id="apScantoPayText" style="font-weight: 400; color: 989898">
                                ${ Localization.get(this.locale, 'scan-to-pay') }
                            </p>
                    
                            <p id="apTo" style="font-weight: 300">
                                <strong style="font-weight: 400; color: 607d8b"
                                >${this.response.domain}</strong
                                >
                            </p>
                        </div>
                        <div style="color: black">
                            <span style="font-size: 20px; font-weight: 400"> ${formatCurrency(this.response.amount)}</span>
                            <sup style="font-weight: 500">FCFA</sup>
                        </div>
                    </div>
                    <div id="apBoxBody">
                        <h1 class="apay-qr-name">${this.response.name}</h1>
                        <div id="apQrcodeBox">
                            <img src="${this.response.image}" alt="qrcode" style="visibility: ${(!this.timeExpired && this.requestStatus === STATUS_OF_REQUEST.WAITING) ? 'visible' : 'hidden'}"/>
                        </div>
                        <a id="howToPay" href="https://test.akivaspay.com/client-documentation/web-payment" target="_blank">${ Localization.get(this.locale, 'how-to-pay') }</a>
                        <a href="${this.response.link}" class="apay-button" target="_blank">
                            ${ Localization.get(this.locale, 'open-in-wallet') }
                        </a>
                        <br />
                    </div>
                </div>
            </div>
        `;

        if (this.success) {
            $content = `
                <div class="apay-widget">
                    <div id="apBox">
                        ${ widgetHeader(timerHTML) }
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
        }
        else if (this.timeExpired) {
            $content = `
                <div class="apay-widget">
                    <div id="apBox">
                        ${ widgetHeader(timerHTML) }
                        <div id="apPrice">
                            <div>
                                <p id="apScantoPayText" style="font-weight: 400; color: 989898">
                                    ${ Localization.get(this.locale, 'scan-to-pay') }
                                </p>
                        
                                <p id="apTo" style="font-weight: 300">
                                    <strong style="font-weight: 400; color: 607d8b"
                                    >${this.response.domain}</strong
                                    >
                                </p>
                            </div>
                            <div style="color: black">
                                <span style="font-size: 20px; font-weight: 400"> ${formatCurrency(this.response.amount)}</span>
                                <sup style="font-weight: 500">FCFA</sup>
                            </div>
                        </div>
                        <div id="apBoxBody">
                            <div id="apQrcodeBox">
                                <span style="color: red;">
                                    ${ Localization.get(this.locale, 'qr-code-expired') }
                                </span>
                            </div>
                            <a href="#" id="apay-regenerate" class="apay-button">
                                ${ Localization.get(this.locale, 'regenerate') }
                            </a>
                            <br />
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div>
                <button id="apay-close-btn" class="apay-close-widget">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div>
                ${ $content }
                </div>
            </div>
        `;
    }

    async checkTransactionStatus(uuid) {
        this.checkTransactionInterval = setInterval(async () => {
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
            
            if (response.status == 200) {
                response.json().then((json) => {
                    if (json.success == true) {
                        this.success = true;
                        this.timeExpired = false;
                        this.requestStatus = STATUS_OF_REQUEST.SUCCESS;
                        this.updateWidget();
                        this.emit('apay-transaction-success', json);
                        clearInterval(this.checkTransactionInterval);
                    }
                    
                });
                
            }
            else {
                response.json().then((json) => {
                    this.requestStatus = STATUS_OF_REQUEST.FAILED;
                    this.errorMessage = json.message;
                    this.updateWidget();
                    clearInterval(this.checkTransactionInterval);
                });
                
            }

        }, 2500);
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            try {
                let timer = document.getElementById('timer').innerHTML;
                let timeArray = timer.split(/[:]+/);
                let m = parseInt(timeArray[0]);
                let s = AkivasPayWidget.formatSeconds(parseInt((timeArray[1] - 1)));
                if (s === '59') {
                    m = m - 1;
                }

                if (this.success) {
                    clearInterval(this.timerInterval);
                }

                if (m < 0 || ( m === 0 && s === '00')) {
                    this.timeExpired = true;
                    document.getElementById('timer').textContent = "";
                    this.updateWidget();
                    this.regenerateCodeClickEventListener();
                    clearInterval(this.timerInterval);
                }
                else {
                    if (m == NaN || s == NaN) {
                        clearInterval(this.timerInterval);
                    }
                    else {
                        document.getElementById('timer').textContent = m.toString() + ":" + s.toString();
                        let percent = (m / 30) * 100;
                        document.getElementById('apTimerMovement').style.width = percent + "%";
                    }
                    
                }
                
            } catch (e) {}
        }, 100);
        
    }

    static formatSeconds(sec) {
        if (sec < 10 && sec >= 0) {
            sec = "0" + sec;
        }
        if (sec < 0) {
            sec = "59";
        }
        return sec;
    }

    closeWidget() {
        this.requestStatus = STATUS_OF_REQUEST.INITIALIZING;
        if (this.modal) {
            this.modal.classList.remove('visible');
            this.$modal = null;
        }

        if (this.checkTransactionInterval) {
            clearInterval(this.checkTransactionInterval);
        }

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timeExpired = false;
        this.success = false;
    }

    on(event, listener) {
        if (!(event in this.events)) {
            this.events[event] = [];
        }

        if (event === 'apay-regenerate-widget' && this.events[event].length > 0) {
            throw Error(`Cannot listen to apay-regenerate-widget event twice`);
        }
        
        this.events[event].push(listener);
    }

    emit(event, ...args) {
        if (!(event in this.events)) {
            return;
        }
        this.events[event].forEach(listener => listener(...args));
    }
}

module.exports = AkivasPayWidget;