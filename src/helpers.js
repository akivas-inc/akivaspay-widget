import { Localization } from "./translations.js";

const STATUS_OF_REQUEST = Object.freeze({
    INITIALIZING: 'initializing',
    WAITING: 'waiting',
    LOADING: 'loading',
    FAILED: 'failed',
    SUCCESS: 'success'
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

class Response {
    constructor(image, domain, link, name, amount){
        Object.assign(this, { image, domain, link, name, amount });
    }
}

const widgetHeader = (content = '') => `
    <div id="apBoxHeader">
        <div id="apLogo">
            <div id="apLogoCircle">
                <img src="https://api.apay.akivaspay.com/images/AKIVASPAY.png" alt="AkivasPay" />
            </div>
            <div id="apLogoText">AkivasPay</div>
        </div>
        ${content}
    </div>
`;

const timerSection = (expired, requestStatus, locale) => `
    <div id="apTimer" style="background-color: ${ expired ? 'red' : '#3cb364'}">
        ${ 
            expired == true ? 
            `
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${ Localization.get(locale, 'qr-code-expired') }</span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : requestStatus == STATUS_OF_REQUEST.WAITING ?
            `
                <span id="apTimerMovement"></span>
                <span id="apTimerText">
                    <span id="apTimerText-left"> ${ Localization.get(locale, 'awaiting-payment') } </span>
                    <span id="apTimerText-right"> 
                        <span id="timer"></span> 
                    </span>
                </span>
            ` : ''
        }
    </div>
`;

export {
    STATUS_OF_REQUEST,
    formatCurrency,
    Response,
    supported_locales,
    fallback_locale,
    widgetHeader,
    timerSection,
    Localization
}