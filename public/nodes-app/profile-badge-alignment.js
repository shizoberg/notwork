/* Membership sits to the right of the location on the same baseline. */
const beforeRightBadgeIdentity=cardIdentity;cardIdentity=function(args){let html=beforeRightBadgeIdentity(args);const badge=html.match(/<div class="card-member">[\s\S]*?<\/div>/);if(!badge)return html;html=html.replace(badge[0],'');return html.replace(`<p class="card-location">${escapeHTML(args.city)}</p>`,`<div class="card-location-row"><p class="card-location">${escapeHTML(args.city)}</p>${badge[0]}</div>`)};
render();
