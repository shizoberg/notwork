/* Category labels belong to the cards; one selector filters the directory. */
const communityCategories={notwork:'Topluluk',withco:'Coworking Space',itu:'Tekno Park',jewelry:'Fuar'};
let selectedCommunityCategory='Tümü';
const beforeCategoryLabelCard=categorizedCard;
categorizedCard=function(s){return beforeCategoryLabelCard(s).replace(/(<div class="card-space-logo-row">[\s\S]*?)(<span class="community-member-badge[^>]*>[\s\S]*?<\/span>|<span class="tiny">Özel alan<\/span>)(<\/div>)/,`$1<span class="community-category-badge ${s.color}">${communityCategories[s.id]}</span>$3`)};
community=function(){return `<div class="filtered-community-cards">${verticalSpaces.map(categorizedCard).join('')}</div><p class="helper">Örnek alanlar · Web demosu</p>`};
render();
