import { Localization } from "./translations.js";

const STATUS_OF_REQUEST = Object.freeze({
    NOT_STARTED: 'not started',
    WAITING: 'waiting',
    LOADING: 'loading',
    FAILED: 'failed',
    SUCCESS: 'success',
    CANCEL: 'cancel'
});

const supported_locales = ['en', 'fr'];
const fallback_locale = 'en';
const formatCurrency = (number, separator) => {
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

class WidgetData {
    constructor(image, domain, link, name, amount, description, external_id){
        Object.assign(this, { image, domain, link, name, amount, description, external_id });
    }
}

const widgetHeader = (content = '') => `
    <div id="apBoxHeader">
        <div id="apLogo">
            <div id="apLogoCircle">
                <a href="https://akivaspay.com" target="_blank">
                    <img src="https://akivaspay.com/images/AKIVASPAY.png" alt="AkivasPay" />
                </a>
            </div>
            <div id="apLogoText">AkivasPay</div>
        </div>
        ${content}
    </div>
`;

const timerSection = (expired, requestStatus, localization) => `
    <div id="apTimer" style="background-color: ${ expired ? 'red' : '#3cb364'}">
        ${ 
            expired == true ? 
            `
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${ localization.get('qr-code-expired') }</span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : requestStatus == STATUS_OF_REQUEST.WAITING ?
            `
                <span id="apTimerMovement"></span>
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${ localization.get('awaiting-payment') } </span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : ''
        }
    </div>
`;

function createPrivateStore () {
    let store = new WeakMap();
    return function (inst) {
        let obj = store.get(inst);
        if (!obj) {
            obj = {};
            store.set(inst, obj);
        };
        return obj;
    };
}

export {
    STATUS_OF_REQUEST,
    formatCurrency,
    WidgetData,
    supported_locales,
    fallback_locale,
    widgetHeader,
    timerSection,
    Localization,
    createPrivateStore
}