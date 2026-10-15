/* Horizontal member preview matches the event attendee circles. */
const beforeHorizontalMemberCard=categorizedCard;categorizedCard=function(s){const ids=spacePreviewMembers[s.id]||[];return beforeHorizontalMemberCard(s).replace(/<div class="community-mini-directory">[\s\S]*?<\/div><\/div>/,`<div class="community-horizontal-members"><div class="community-avatar-circles">${ids.map(id=>node(id)).join('')}<span class="community-more-members">+${Math.max(0,Number(s.count.replace('.',''))-ids.length)}</span></div></div>`)};
render();
