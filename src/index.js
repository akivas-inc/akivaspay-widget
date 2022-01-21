"use strict";
import { STATUS_OF_REQUEST } from "./constants.js"
import { Localization } from "./translations.js";

class Response {
    constructor(image, domain, link, name, amount){
        Object.assign(this, { image, domain, link, name, amount });
    }
}

export class AkivasPayWidget {
    #baseUrl = "https://api.apay.akivaspay.com/";
    #shopSubscriptionKey;
    #cancelByUser = false;
    #success = false;
    #requestStatus = STATUS_OF_REQUEST.INITIALIZING;
    #timeExpired = false;
    #errorMessage = '';
    #locale;
    #apayContainer;
    #modal;
    #requests = [];
    #response = new Response();

    constructor(shopSubscriptionKey, locale = 'en') {
        this.#shopSubscriptionKey = shopSubscriptionKey;
        this.#locale = locale;
        this.#apayContainer = document.createElement('div');
        this.initDom();
    }

    initDom() {
        this.#apayContainer.innerHTML = '<div class="akivas-pay-modal" id="akivaspayModal" data-animation="slideInOutLeft"></div>';
        document.querySelector('body').appendChild(this.#apayContainer);
        this.#modal = document.getElementById("akivaspayModal");
    }

    #updateWidget() {
        this.#showModal();
    }

    #showModal() {
        this.#modal.innerHTML = this.#getModal();
    }

    show(name, external_uuid, amount, description = '') {
        
        this.#requestStatus = STATUS_OF_REQUEST.LOADING;
        let xhr = new XMLHttpRequest();
        xhr.open("POST", this.#baseUrl + 'generate/qrcode');
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept-Language", this.#locale);
        this.#requests.push(xhr);
        this.#modal.classList.add('visible');
        this.#showModal();
        let vm = this;
        xhr.onreadystatechange = function () {
            let response;
            if (xhr.status === 200) {
                try {
                    response = JSON.parse(xhr.responseText)
                    vm.#response = new Response(
                        response.image, 
                        response.domain, 
                        response.link,
                        name,
                        amount
                    );
                    vm.#updateWidget();
                    vm.#requestStatus = STATUS_OF_REQUEST.WAITING;
                    document.getElementById('timer').innerHTML = 30 + ":" + 0;
                    vm.#closeWidget();
                    vm.#startTimer().then();
                    vm.#checkQrPaymentStatus(response.uuid).then()
                } catch (e) {}

            } else {
                if (xhr.responseText) {
                    response = JSON.parse(xhr.responseText)
                    vm.#requestStatus = STATUS_OF_REQUEST.FAILED;
                    vm.#errorMessage = response.message;
                    vm.#updateWidget();
                }
                vm.#closeWidget()
            }
        }
        let data = {
            "shop-subscription-key": this.#shopSubscriptionKey,
            "name": name,
            "uuid": external_uuid,
            "amount": amount,
            "description": description
        };
        xhr.send(JSON.stringify(data));
        this.#closeWidget();
    }

    #getModal() {
        return `
    <button class="akivas-pay-close-modal" id="closeApayModal">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
    <div class="loading-content" style="visibility: ${this.#requestStatus === STATUS_OF_REQUEST.LOADING ? 'visible' : 'hidden'}">
        <div id="loading"></div>
    </div>

    <div class="loading-content" style="text-align: center; color: red; visibility: ${this.#requestStatus === STATUS_OF_REQUEST.FAILED ? 'visible' : 'hidden'}">
        ${this.#errorMessage}
    </div>
   <div class="apay-qr-modal-dialog" style="visibility: ${this.#requestStatus === STATUS_OF_REQUEST.WAITING ? 'visible' : 'hidden'}">
     <div id="apBox" >
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
             <span id="apTimerText-left" > ${this.#timeExpired ? Localization.get(this.#locale, 'qr-code-expired') : this.#success ? Localization.get(this.#locale, 'successful-purchase-msg') : Localization.get(this.#locale, 'awaiting-payment')} </span>
             <span id="apTimerText-right"> <span id="timer"></span> </span>
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
           <span style="font-size: 20px; font-weight: 400"> ${AkivasPayWidget.#formatCurrency(this.#response.amount)}</span>
           <sup style="font-weight: 500">FCFA</sup>
         </div>
       </div>
       <div id="apBoxBody" style="padding-right: 10px">
         <h1 style="font-weight: bold; text-align: center; margin-top:10px; padding-left: 10px;">${this.#response.name}</h1>
         <div id="apQrcodeBox">
           <img src="${this.#response.image}" width="150" height="150" alt="qrcode" style="visibility: ${(!this.#timeExpired && this.#requestStatus === STATUS_OF_REQUEST.WAITING) ? 'visible' : 'hidden'}"/>
         </div>
          <a id="howToPay" href="https://test.akivaspay.com/client-documentation/web-payment" target="_blank">${ Localization.get(this.#locale, 'how-to-pay') }</a>
         <a href="${this.#response.link}" id="apOpenWalletBtn" target="_blank">
         ${ Localization.get(this.#locale, 'open-in-wallet') }
         </a>
         <br />
       </div>
     </div>
   </div>`;
    }

    async #checkQrPaymentStatus(uuid) {
        if (this.#cancelByUser || this.#timeExpired) {
            return;
        }
        let xhr = new XMLHttpRequest();
        xhr.open("GET", this.#baseUrl + 'find/transaction/' + uuid + "?filter_by=uuid&shop-subscription-key=" + this.#shopSubscriptionKey);
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        this.#requests.push(xhr);
        let vm = this;
        xhr.onreadystatechange = async function () {
            let response;
            if (xhr.status === 406) {
                if (vm.#timeExpired) {
                    xhr.abort()
                    return;
                }
                await vm.#sleep(500);
                return vm.#checkQrPaymentStatus(uuid);
            } else if (xhr.status === 200) {
                this.#success = true;
                this.#showModal();
                vm.#closeWidget();
            } else {
                if (xhr.responseText) {
                    response = JSON.parse(xhr.responseText);
                    this.#requestStatus = STATUS_OF_REQUEST.FAILED;
                    this.#errorMessage = response.message;
                    this.#showModal();
                }
                vm.#closeWidget()
            }
        }
        xhr.send()
    }

    #sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static #formatCurrency(number, separator) {
        if (number) {
            let splitArray = number.toString().split('.')
            let decimalPart = ''
            if (splitArray.length > 1) {
                number = splitArray[0]
                decimalPart = '.' + splitArray[1]
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
        } else {
            return "0";
        }
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
                this.#showModal();
                this.#closeWidget();
                return;
            }
            document.getElementById('timer').innerHTML =
                m + ":" + s;
            let percent = (m / 30) * 100;
            document.getElementById('apTimerMovement').style.width = percent + "%";
            await this.#sleep(500);
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
        const closeEls = document.getElementById('closeApayModal');
        try {
            let vm = this;
            closeEls.addEventListener("click", function () {
                vm.#requestStatus = STATUS_OF_REQUEST.INITIALIZING;
                if (vm.#modal) {
                    vm.#modal.classList.remove('visible');
                    this.$modal = null;
                }
                this.#cancelByUser = true;
                this.#requests.forEach(function(request) {
                    request.abort();
                });
            });
        } catch(e){}

    }
}

