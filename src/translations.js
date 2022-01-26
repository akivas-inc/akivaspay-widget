const translations = {
    "en": {
        "qr-code-expired": "The Qrcode has expired",
        "scan-to-pay": "Scan to pay",
        "open-in-wallet": "Open in Wallet",
        "how-to-pay": "How do i pay?",
        "awaiting-payment": "Awaiting Payment ...",
        "successful-purchase-msg": "The payment has been successfully completed",
        "regenerate": "regenerate",
        "failed-to-fetch": "The widget failed to load, check your Internet connection.",
        "unknow-error-message": "Something went wrong, please try again later"
    },
    "fr": {
        "qr-code-expired": "Le Qrcode a expiré",
        "scan-to-pay": "Scannez pour payer",
        "open-in-wallet": "Ouvrir dans le portefeuille",
        "how-to-pay": "Comment payer ?",
        "awaiting-payment": "En attente de paiement...",
        "successful-purchase-msg": "Le paiement a été effectué avec succès",
        "regenerate": "régénérer",
        "failed-to-fetch": "Le chargement du widget a échoué, vérifiez votre connexion Internet.",
        "unknow-error-message": "Quelque chose s'est mal passé, veuillez réessayer plus tard"
    }
};

export class Localization {
    constructor(locale) {
        this.locale = locale;
    }

    get(key){
        return translations[this.locale][key];
    }
}
