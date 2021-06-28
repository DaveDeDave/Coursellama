'use strict';

const cookieModal = new bootstrap.Modal(document.getElementById('cookie_consent'), {backdrop: 'static'});

function setConsent() {
    document.cookie = "consent=1; path=/";
}

function consentGiven() {
    let cookies = document.cookie.split('; ');
    return cookies.find(v => v.split('=')[0] == 'consent') ? true : false;
}

window.onload = () => {
    if(!consentGiven())
        cookieModal.show();
};
