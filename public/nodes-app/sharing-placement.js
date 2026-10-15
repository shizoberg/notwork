/* QR belongs to Profile; receiving and proximity actions belong to Nodes. */
const beforeSharingPlacementProfile=profile;profile=function(){return beforeSharingPlacementProfile().replace(/<div class="quick-connect-actions">[\s\S]*?<\/div>/,'<div class="profile-qr-action"><button class="profile-edit-control" data-ui="personal-qr">QR kodum</button></div>')};
const beforeSharingPlacementNodes=nodes;nodes=function(){return beforeSharingPlacementNodes().replace(/<div class="quick-node-entry">[\s\S]*?<\/div>/,`<div class="nodes-sharing-bar" aria-label="Kişi ekle"><button data-ui="scan-person">${icon('qr')}<span>QR oku</span></button><button data-ui="nearby-person">${icon('nodes')}<span>Yakın paylaşım</span></button></div>`)};
render();
