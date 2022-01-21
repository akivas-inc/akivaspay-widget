import {AkivasPayWidget} from "./index.js";

const widget = new AkivasPayWidget(
    'apayo3qglb76hpitvymz9w5ks2jac810d',
    'fr'
);

document.getElementById('apay').addEventListener('click', function() {
    widget.show('Pen', '1212121212', '100');
});