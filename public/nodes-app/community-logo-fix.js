/* A single avatar overlaps the cover edge; no repeated cover wordmark. */
const beforeSingleLogoSpace=spacePage;spacePage=function(id){let html=beforeSingleLogoSpace(id);if(id==='notwork'){html=html.replace(/<span class="cover-label">[\s\S]*?<\/span>/,'').replace(/<span class="brand-photo"[\s\S]*?<\/span>/,'')}return html};
render();
