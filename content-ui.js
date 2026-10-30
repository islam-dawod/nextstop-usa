(()=>{
const $=s=>document.querySelector(s);
const CATS=window.USAGCD_CATS||{},UITXT=window.USAGCD_UITXT||{},GI18N=window.USAGCD_GUIDES_I18N||{};
const curLang=()=>($('#language')&&$('#language').value)||'en';
const fixed={preview:'GUIDES · OFFICIAL SOURCES',sample:'USAGCD guide · English',sampleShort:'Read the guide',updates:'START HERE',footer:'Independent publication, not a government service. General information, not individual immigration advice. Images are AI-generated illustrations. Guides are in English; other translations are drafts pending review. See source status for automated collection availability.',newsletterDemo:'Browse official sources →',newsletterTitle:'Keep the official source close.',newsletterText:'Use the source desk to check announcements before changing your plans.',careerTitle:'Research your profession',careerText:'Choose an occupation group to open official BLS profiles. These are career statistics, not job offers or visa eligibility results.',explore:'Open career research'};
// draft-note style (kept minimal; uses the site's own tokens)
const st=document.createElement('style');st.textContent='.draft-note{border:1px solid var(--line);border-inline-start:3px solid var(--red);background:#fff;padding:11px 15px;font-size:12px;line-height:1.6;color:var(--muted);margin:0 0 20px;border-radius:2px}';document.head.appendChild(st);
function editorialLabels(){const lang=curLang();const U=UITXT[lang];Object.entries(fixed).forEach(([key,val])=>{let v=val,l='en',d='ltr';if(U&&key==='sample'){v=U.badge;l=lang;d=lang==='ar'?'rtl':'ltr';}if(U&&key==='sampleShort'){v=U.readGuide;l=lang;d=lang==='ar'?'rtl':'ltr';}document.querySelectorAll('[data-t="'+key+'"]').forEach(el=>{el.textContent=v;el.lang=l;el.dir=d;});});}
editorialLabels();
$('#language').addEventListener('change',()=>{editorialLabels();render();});
$('.nav-inner>.cta').href='#newsroom';$('.nav-inner>.cta').removeAttribute('data-t');$('.nav-inner>.cta').textContent='Official sources';
const groups=['Visas','Work','Study','Travel'];
function topic(cat){$('#guide-filter').value=cat;$('#guide-search').value='';render();$('#library').scrollIntoView({behavior:'smooth'});}
document.querySelectorAll('.update h3').forEach((h,i)=>{h.removeAttribute('data-t');const a=document.createElement('a');a.href='#library';a.textContent=h.textContent;h.replaceChildren(a);a.addEventListener('click',()=>topic(groups[i]));});
document.querySelectorAll('.story').forEach((s,i)=>{const a=document.createElement('a');a.href='#library';a.className='cta';a.textContent='Read '+groups[i+1].toLowerCase()+' guides';a.addEventListener('click',()=>topic(groups[i+1]));s.append(a);});
$('.newsletter .preview-tag').outerHTML='<a class="preview-tag" href="#newsroom">Browse official sources →</a>';
function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;}
function link(title,url){const a=el('a',title);a.href=url;return a;}
function render(){
  const lang=curLang(),U=UITXT[lang],cmap=CATS[lang]||{},gi=GI18N[lang]||{};
  const q=$('#guide-search').value.trim().toLowerCase(),cat=$('#guide-filter').value;
  let note=$('#guide-draft-note');
  if(!note){note=el('p',null,'draft-note');note.id='guide-draft-note';$('#guide-grid').before(note);}
  if(U){note.hidden=false;note.textContent=U.draftBanner;note.lang=lang;note.dir=lang==='ar'?'rtl':'ltr';}else{note.hidden=true;}
  const items=USAGCD_GUIDES.filter(g=>{const t=gi[g.id];const hay=JSON.stringify([g,t||'',cmap[g.category]||'']).toLowerCase();return (cat==='All'||g.category===cat)&&hay.includes(q);});
  $('#guide-count').textContent=items.length+' guides';
  $('#guide-grid').replaceChildren(...items.map(g=>{
    const t=gi[g.id]||{};
    const title=t.title||g.title,desc=t.description||g.description,secs=t.sections||g.sections,catLabel=cmap[g.category]||g.category;
    const a=el('article',null,'guide');a.id='guide-'+g.id;if(U){a.lang=lang;a.dir=lang==='ar'?'rtl':'ltr';}
    const im=el('img');im.src=g.image;im.alt='AI-generated '+g.category.toLowerCase()+' illustration';im.loading='lazy';
    const b=el('div',null,'guide-body');b.append(el('span',catLabel,'category'),el('h3',title),el('p',desc));
    const d=el('details');d.append(el('summary',U?U.readGuide:'Read guide'));
    secs.forEach(s=>d.append(el('h4',s.title),el('p',s.text)));
    const prepared=U?U.prepared.replace('{date}',g.reviewed):'Prepared '+g.reviewed+' · Original USAGCD planning guide. Check current official instructions.';
    d.append(el('p',prepared,'meta'),link((U?U.officialRef:'Official reference: ')+g.source,g.url));
    b.append(d);a.append(im,b);return a;}));
}
$('#guide-search').addEventListener('input',render);$('#guide-filter').addEventListener('change',render);render();
const sources=[['Visa announcements','State Department','Official visa notices and their current scope.','https://travel.state.gov/content/travel/en/News/visas-news.html'],['Immigration alerts','USCIS','Open the official newsroom for immigration updates.','https://www.uscis.gov/newsroom'],['Employment releases','BLS','Official RSS source; automated availability shown above.','https://www.bls.gov/feed/'],['Tourism monitor','NTTO','Visitor arrivals, reporting periods and preliminary versus final releases.','https://www.trade.gov/i-94-arrivals-program'],['Student visa guide','State Department','Official information for prospective international students.','https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html'],['Explore national parks','NPS','Destination planning, access, reservations and current alerts.','https://www.nps.gov/planyourvisit/index.htm']];
$('#source-directory').replaceChildren(...sources.map(([title,name,desc,url])=>{const n=el('article',null,'source-card');n.append(el('span',name,'category'),el('h3',title),el('p',desc),link('Open official source →',url));return n;}));
Promise.resolve(window.USAGCD_NEWS).then(data=>{const successful=data.sources.filter(s=>s.status==='ok');const stale=Date.now()-Date.parse(data.attemptedAt)>86400000;$('#feed-status').textContent='Last collection attempt: '+(data.attemptedAt||'not run')+'. '+successful.length+' of '+data.sources.length+' sources available. '+data.sources.filter(s=>s.status!=='ok').map(s=>s.name+': automatic collection unavailable.').join(' ')+(stale?' Saved collection is over 24 hours old.':'')+' Direct official links remain available. Source headlines are not editorially verified guidance.';$('#news-items').replaceChildren(...data.sources.flatMap(s=>(s.items||[]).slice(0,5).map(item=>{const n=el('article',null,'source-card');const url=new URL(item.url);if(url.protocol!=='https:')return n;n.append(el('span',s.name,'category'),el('h3',item.title),el('p',(item.publishedAt?'Source date: '+item.publishedAt:'Source publication date unavailable')+' · Last successful collection: '+s.lastSuccess,'meta'),link('Read the original →',url.href));return n;})));}).catch(()=>{$('#feed-status').textContent='Saved feed could not be loaded. Use the official source links below. If viewing a local file, open it through a local web server.';});
const original=$('#career-form'),form=original.cloneNode(true);original.replaceWith(form);form.innerHTML='<label for="profession">Occupation group (English)</label><select id="profession" aria-label="Occupation group"><option value="computer-and-information-technology">Technology</option><option value="healthcare">Healthcare</option><option value="architecture-and-engineering">Engineering</option><option value="education-training-and-library">Education</option><option value="construction-and-extraction">Construction</option><option value="business-and-financial">Business & finance</option></select><button class="cta">Show official profiles</button>';
form.addEventListener('submit',e=>{e.preventDefault();const result=$('#result');result.hidden=false;result.lang='en';result.dir='ltr';result.replaceChildren(el('p','Compare duties, education and data years. These profiles do not establish permission to work or employer sponsorship.'),link('Open BLS occupation profiles →','https://www.bls.gov/ooh/'+$('#profession').value+'/home.htm'));});
$('#budget-form').addEventListener('submit',e=>{e.preventDefault();const total=Number($('#days').value)*Number($('#daily').value)+Number($('#fixed').value);$('#budget-result').textContent='Your estimate: '+new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(total)+'. Add any contingency or costs you have not included.';});
})();
