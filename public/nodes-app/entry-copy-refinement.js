/* One entry heading, and the same short introduction as the profile card. */
Object.entries(details).forEach(([id,detail])=>{if(people[id])people[id].headline=detail.headline});
const beforeSingleEntryHeading=eventEntry;eventEntry=function(){return beforeSingleEntryHeading().replace(/<h2>Etkinliğine katıl\.<\/h2>/,'')};
render();
