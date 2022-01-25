const translations = {
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

export class Localization {
    static get(locale, key){
        return translations[locale][key];
    }
}
