/* Event identity integrated into its cover. */
const beforeIntegratedCoverLobby=lobby;lobby=function(){return beforeIntegratedCoverLobby().replace(/<div class="event-mini-cover">[\s\S]*?<\/div><div class="event-mini-identity">[\s\S]*?<\/div><\/div>/,`<div class="event-integrated-cover"><img src="assets/community-cover.jpg" alt="Notwork Buluşması etkinlik kapağı">${nodeTexture()}<div class="event-cover-shade"></div><div class="event-cover-identity"><span class="event-avatar" aria-label="Notwork etkinlik profil görseli">notwork.</span><h1>Notwork Buluşması</h1></div></div>`)};
render();
