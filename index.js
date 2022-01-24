"use strict";
import { STATUS_OF_REQUEST, sleep, formatCurrency, Response, fallback_locale, supported_locales } from "./src/helpers.js"
import { Localization } from "./src/translations.js";

class AkivasPayWidget {
    #baseUrl = "https://api.apay.akivaspay.com/";
    #shopSubscriptionKey;
    #cancel = false;
    #success = false;
    #requestStatus = STATUS_OF_REQUEST.INITIALIZING;
    #timeExpired = false;
    #errorMessage = '';
    #locale;
    #apayContainer;
    #modal;
    #response = new Response();
    #interval;
    #events = {
        'apay-transaction': []
    };

    constructor(shopSubscriptionKey, locale = fallback_locale) {
        this.#shopSubscriptionKey = shopSubscriptionKey;
        if (locale in supported_locales) {
            this.#locale = locale;
        }
        else {
            this.#locale = fallback_locale;
        }
        this.#apayContainer = document.createElement('div');
        this.#initWidget();
    }

    #initWidget() {
        this.#apayContainer.innerHTML = '<div class="akivas-pay-modal" id="akivaspayModal" data-animation="slideInOutLeft"></div>';
        document.querySelector('body').appendChild(this.#apayContainer);
        this.#modal = document.getElementById("akivaspayModal");
    }

    #closeWidgetEventListener() {
        const closeEl = document.getElementById('apay-close-btn');
        if (closeEl) {
            closeEl.addEventListener('click', () => {
                this.#closeWidget();
            })
        }
    }

    #updateWidget() {
        this.#modal.innerHTML = this.#getModal();
        this.#closeWidgetEventListener();
    }

    #showModal() {
        this.#modal.innerHTML = this.#getModal();
        this.#closeWidgetEventListener();
    }

    async show(name, external_uuid, amount, description = '') {
        this.#requestStatus = STATUS_OF_REQUEST.LOADING;
        this.#modal.classList.add('visible');
        this.#showModal();
        let data = {
            "shop-subscription-key": this.#shopSubscriptionKey,
            "name": name,
            "uuid": external_uuid,
            "amount": amount,
            "description": description
        };

        var response = await fetch(this.#baseUrl + 'generate/qrcode', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Language": this.#locale
            },
            body: JSON.stringify(data),
        });
        
        if (response.ok) {
            response.json().then((json) => {
                this.#response = new Response(
                    json.image,
                    json.domain,
                    json.link,
                    name,
                    amount
                );
                this.#requestStatus = STATUS_OF_REQUEST.WAITING;
                this.#updateWidget();
                document.getElementById('timer').innerHTML = 30 + ":" + 0;
                this.#startTimer().then();
                this.#checkTransactionStatus(json.uuid).then()
            });
            
        }
        else {
            response.json().then((json) => {
                this.#requestStatus = STATUS_OF_REQUEST.FAILED;
                this.#errorMessage = json.message;
                this.#updateWidget();
            });
            
        }
        
    }

    #getModal() {
        var $content = `
            <div class="apay-center-content" style="visibility: ${this.#requestStatus === STATUS_OF_REQUEST.LOADING ? 'visible' : 'hidden'}">
                <div id="apay-loading"></div>
            </div>
            <div class="apay-center-content" style="text-align: center; color: red; visibility: ${this.#requestStatus === STATUS_OF_REQUEST.FAILED ? 'visible' : 'hidden'}">
                ${this.#errorMessage}
            </div>
            <div class="apay-widget" style="visibility: ${this.#requestStatus === STATUS_OF_REQUEST.WAITING ? 'visible' : 'hidden'}">
                <div id="apBox">
                    <div id="apBoxHeader">
                        <div id="apLogo">
                            <div id="apLogoCircle">
                                <img src="./../images/akivaspay.png" alt="AkivasPay" />
                            </div>
                            <div id="apLogoText">AkivasPay</div>
                        </div>
                        <div id="apTimer">
                            <div style="background-color: ${this.#timeExpired ? 'red' : 'transparent'}">
                                <span id="apTimerMovement"></span>
                                <span id="apTimerText">
                                    <span id="apTimerText-left"> ${this.#timeExpired ? Localization.get(this.#locale, 'qr-code-expired') : this.#success ? Localization.get(this.#locale, 'successful-purchase-msg') : Localization.get(this.#locale, 'awaiting-payment')} </span>
                                    <span id="apTimerText-right"> 
                                        <span id="timer"></span> 
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="apPrice">
                        <div>
                            <p id="apScantoPayText" style="font-weight: 400; color: #989898">
                                ${ Localization.get(this.#locale, 'scan-to-pay') }
                            </p>
                    
                            <p id="apTo" style="font-weight: 300">
                                <strong style="font-weight: 400; color: #607d8b"
                                >${this.#response.domain}</strong
                                >
                            </p>
                        </div>
                        <div style="color: black">
                            <span style="font-size: 20px; font-weight: 400"> ${formatCurrency(this.#response.amount)}</span>
                            <sup style="font-weight: 500">FCFA</sup>
                        </div>
                    </div>
                    <div id="apBoxBody" style="padding-right: 10px">
                        <h1 style="font-weight: bold; text-align: center; margin-top:10px; padding-left: 10px;">${this.#response.name}</h1>
                        <div id="apQrcodeBox">
                            <img src="${this.#response.image}" width="150" height="150" alt="qrcode" style="visibility: ${(!this.#timeExpired && this.#requestStatus === STATUS_OF_REQUEST.WAITING) ? 'visible' : 'hidden'}"/>
                        </div>
                        <a id="howToPay" href="https://test.akivaspay.com/client-documentation/web-payment" target="_blank">${ Localization.get(this.#locale, 'how-to-pay') }</a>
                        <a href="${this.#response.link}" class="apay-button" target="_blank">
                            ${ Localization.get(this.#locale, 'open-in-wallet') }
                        </a>
                        <br />
                    </div>
                </div>
            </div>
        `;

        if (this.#success) {
            $content = `
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
        }
        
        return `
            <div>
                <button id="apay-close-btn">
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

    async #checkTransactionStatus(uuid) {
        if ((this.#cancel || this.#timeExpired) && this.#interval !== null) {
            clearInterval(this.#interval);
        }

        this.#interval = setInterval(async () => {

            var response = await fetch(this.#baseUrl + 'find/transaction/' + uuid + "?filter_by=uuid&shop-subscription-key=" + this.#shopSubscriptionKey, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Accept-Language": this.#locale
                }
            });

            if (response.status == 200) {
                this.#success = true;
                this.#updateWidget();
                this.#emit('apay-transaction', response);
            }
            else {
                response.json().then((json) => {
                    this.#requestStatus = STATUS_OF_REQUEST.FAILED;
                    this.#errorMessage = json.message;
                    this.#updateWidget();
                });
                
            }

        }, 2500);
    }

    async #startTimer() {
        try {
            let timer = document.getElementById('timer').innerHTML;
            let timeArray = timer.split(/[:]+/);
            let m = timeArray[0];
            let s = AkivasPayWidget.#checkSecond((timeArray[1] - 1));
            if (s === "59") {
                m = m - 1
            }
            if (this.#success) {
                return;
            }
            if (m < 0) {
                this.#timeExpired = true;
                this.#updateWidget();
                return;
            }
            document.getElementById('timer').innerHTML =
                m + ":" + s;
            let percent = (m / 30) * 100;
            document.getElementById('apTimerMovement').style.width = percent + "%";
            await sleep(500);
            return this.#startTimer();
        } catch (e) {}
    }

    static #checkSecond(sec) {
        if (sec < 10 && sec >= 0) {
            sec = "0" + sec
        }
        if (sec < 0) {
            sec = "59"
        }
        return sec;
    }

    #closeWidget() {
        this.#requestStatus = STATUS_OF_REQUEST.INITIALIZING;
        if (this.#modal) {
            this.#modal.classList.remove('visible');
            this.$modal = null;
        }
        if (this.#interval) {
            clearInterval(this.#interval);
        }
        this.#cancel = true;

    }

    on(event, listener) {
        if (!(event in this.#events)) {
            this.#events[event] = [];
        }
        this.#events[event].push(listener);
    }

    #emit(event, ...args) {
        if (!(event in this.#events)) {
            return;
        }
        this.#events[event].forEach(listener => listener(...args));
    }
}

export default AkivasPayWidget;