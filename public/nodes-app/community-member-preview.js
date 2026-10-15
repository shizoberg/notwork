/* Small member preview on each community card. */
const spacePreviewMembers={notwork:['ece','bora','selin'],withco:['ece','ada','can'],jewelry:['selin','bora','ada'],itu:['bora','can','ece']};
const beforeMemberPreviewCard=categorizedCard;categorizedCard=function(s){const ids=spacePreviewMembers[s.id]||[];return beforeMemberPreviewCard(s).replace('<p class="space-count">',`<div class="space-member-preview"><div class="space-preview-avatars">${ids.map(id=>`<span class="preview-member-avatar" aria-label="${people[id].name}">${people[id].photo?`<img src="${people[id].photo}" alt="">`:`<span>${networkAvatars[id]||people[id].initial}</span>`}</span>`).join('')}</div><span class="tiny">${ids.length} üye önizlemesi</span></div><p class="space-count">`)};
render();
