/* Full-width QR entry above the personal profile cover. */
const beforeTopQrProfile=profile;
profile=function(){return beforeTopQrProfile().replace(/<div class="profile-qr-action">[\s\S]*?<\/div>/,'').replace('<article class="business-card own-business-card">','<article class="business-card own-business-card"><div class="profile-top-qr"><button class="secondary" data-ui="personal-qr">QR kodum</button></div>')};
render();
