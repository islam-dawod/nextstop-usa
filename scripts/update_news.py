"""Collect headlines only. Preserve last successful data on source failure."""
import json, urllib.request, urllib.parse, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
SOURCES=[{'name':'BLS','url':'https://www.bls.gov/feed/bls_latest.rss','kind':'rss'}, {'name':'State Department','url':'https://travel.state.gov/content/travel/en/News/visas-news.html','kind':'html'}]
class VisaLinks(HTMLParser):
 def __init__(self): super().__init__(); self.current=None; self.items=[]
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   url=urllib.parse.urljoin(SOURCES[1]['url'],dict(attrs).get('href',''))
   p=urllib.parse.urlparse(url)
   if p.scheme=='https' and p.netloc=='travel.state.gov' and (('/News/visas-news/' in p.path) or ('/newsroom/visas/' in p.path)) and p.path.endswith('.html'): self.current=[url,[]]
 def handle_data(self,text):
  if self.current: self.current[1].append(text)
 def handle_endtag(self,tag):
  if tag=='a' and self.current:
   url,parts=self.current; title=' '.join(' '.join(parts).split())
   if len(title)>12:self.items.append({'title':title,'url':url,'publishedAt':None})
   self.current=None

def parse(data,source):
 if source['kind']=='html':
  parser=VisaLinks();parser.feed(data.decode('utf-8'));items=parser.items
 else:
  root=ET.fromstring(data);items=[{'title':i.findtext('title','').strip(),'url':i.findtext('link','').strip(),'publishedAt':i.findtext('pubDate')} for i in root.findall('.//item')]
 host=urllib.parse.urlparse(source['url']).hostname
 unique={i['url']:i for i in items if i['title'] and urllib.parse.urlparse(i['url']).scheme=='https' and urllib.parse.urlparse(i['url']).hostname==host}
 if not unique: raise ValueError('No valid headlines returned; source format may have changed')
 return list(unique.values())[:30]
def main():
 path=ROOT/'data/news.json';previous=json.loads(path.read_text()) if path.exists() else {'sources':[]};old={s['name']:s for s in previous['sources']};now=datetime.now(timezone.utc).isoformat();out=[]
 for source in SOURCES:
  record={**source,'status':'unavailable','items':old.get(source['name'],{}).get('items',[]),'lastSuccess':old.get(source['name'],{}).get('lastSuccess')}
  try:
   request=urllib.request.Request(source['url'],headers={'User-Agent':'USAGCDSourceCollector/1.0','Accept':'application/rss+xml, application/xml, text/html'})
   with urllib.request.urlopen(request,timeout=25) as response:
    data=response.read(2_000_001)
   if len(data)>2_000_000:raise ValueError('Source too large')
   record.update(items=parse(data,source),status='ok',lastSuccess=now)
  except Exception as error:
   record['status']='unavailable — '+type(error).__name__;print(source['name'],record['status'])
  out.append(record)
 path.parent.mkdir(exist_ok=True);payload=json.dumps({'attemptedAt':now,'sources':out},ensure_ascii=False,indent=2);path.write_text(payload);(ROOT/'data/news.js').write_text('window.USAGCD_NEWS = '+payload+';')
 if not any(s['status']=='ok' for s in out):print('WARNING: All sources unavailable; preserved previous items. No live collection verified.')
if __name__=='__main__':main()
