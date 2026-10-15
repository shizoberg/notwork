/* Consistent text-only editing controls for the personal profile. */
const beforeUnifiedUpload=uploadControl;uploadControl=function(kind,label){const titles={cover:'Kapak fotoğrafını düzenle',photo:'Profil fotoğrafını düzenle',portfolio:'Çalışma görseli ekle'};return `<label class="profile-edit-control">${titles[kind]||label}<input type="file" accept="image/jpeg,image/png,image/webp" data-upload="${kind}"></label>`};
const beforeUnifiedProfile=profile;profile=function(){return beforeUnifiedProfile().replace(/class="text-action" data-ui="choose-skills"/g,'class="profile-edit-control" data-ui="choose-skills"').replace(/class="text-action" data-ui="edit-links"/g,'class="profile-edit-control" data-ui="edit-links"')};
const beforeUnifiedLinks=linksBlock;linksBlock=function(links,own=false){return beforeUnifiedLinks(links,own).replace(/<button data-ui="edit-links">([\s\S]*?)<svg[\s\S]*?<\/svg><\/button>/g,'<button class="profile-edit-control" data-ui="edit-links">$1</button>')};
render();
