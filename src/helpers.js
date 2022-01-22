const STATUS_OF_REQUEST = Object.freeze({
    INITIALIZING: 'initializing',
    WAITING: 'waiting',
    LOADING: 'loading',
    FAILED: 'failed',
});

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

export {
    sleep,
    STATUS_OF_REQUEST,
    formatCurrency,
    Response
}