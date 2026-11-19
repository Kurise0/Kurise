from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
import re,subprocess,tinycss2
root=Path(__file__).resolve().parents[1]
soup=BeautifulSoup((root/'index.html').read_text(),'html.parser')
assert (root/'.nojekyll').exists()
ids=[tag.get('id') for tag in soup.select('[id]')]
assert len(ids)==len(set(ids)), 'duplicate DOM IDs'
paths=[]
for tag in soup.select('[src],link[href]'):
    url=tag.get('src') or tag.get('href')
    if url.startswith('./'):
        target=root/urlsplit(url).path[2:]
        assert target.is_file(),f'missing {target}'
        paths.append(target)
loader=(root/'loading.html').read_text()
for f in re.findall(r"'\./(?:css|js)/[^']+'",loader):
    file=root/urlsplit(f.strip("'")).path[2:]
    assert file.is_file(),f'missing critical preload {file}'
for file in (root/'js').glob('*.js'):
    result=subprocess.run(['node','--check',str(file)],capture_output=True)
    assert result.returncode==0,result.stderr.decode()
for file in (root/'css').glob('*.css'):
    errors=[t for t in tinycss2.parse_stylesheet(file.read_text(),skip_whitespace=True,skip_comments=True) if t.type=='error']
    assert not errors,(file,errors)
video=(root/'assets/hero-kurisu.mp4').read_bytes()
assert video.find(b'moov')<video.find(b'mdat'),'video not faststart'
assert soup.select_one('meta[property="og:type"]')
assert len(soup.select('nav#mainNavigation a[data-go]'))==5
# v11: existing source copy survives; removed slide and indicators do not return.
assert len(soup.select('#projectsTrack > .cinema-panel'))==3
assert not soup.select('#projectsTrack .panel-agent')
assert not soup.select('#globalScrollCue')
assert len(soup.select('#researchList .research-row'))==2
assert soup.select_one('#research .research-grid')
assert soup.select_one('#contactFilm source[data-src]')
assert (root/'assets/contact-background.mp4').is_file()
assert (root/'assets/contact-poster.jpg').is_file()
assert 'eridanus' not in (root/'index.html').read_text().lower()
assert 'eridanus' not in (root/'js/content.js').read_text().lower()
assert (root/'js/contact-film.js').is_file()
assert soup.select_one('link[href^="./css/v11.css"]')
assert len(soup.select('#project .project-dots button'))==3
# v12: user-supplied photos, compressed homepage film, origin typography and responsive layer.
assert soup.select_one('link[href^="./css/v12.css"]')
assert len(soup.select('.chapter-photo'))==3
assert soup.select_one('#index .hero-origin em')
assert len(soup.select('#index .hero-origin em'))==2
assert (root/'assets/about-kurisu.webp').is_file()
assert (root/'assets/competition-worldline.webp').is_file()
assert (root/'assets/hero-kurisu-poster.jpg').is_file()
assert (root/'assets/hero-kurisu.mp4').stat().st_size < 600_000
assert 'onPageEnter' in (root/'js/flow-points.js').read_text()
assert 'onPageEnter' in (root/'js/router.js').read_text()
assert 'onPageStart' in (root/'js/router.js').read_text()
assert 'onPageStart' in (root/'js/flow-points.js').read_text()
assert soup.select_one('link[href^="./css/v13.css"]')
assert 'v14.css?v=14' in loader
assert 'copy-reveal.js?v=14' in loader
assert (root/'assets/project-steins-gate.webp').is_file()
assert soup.select_one('#project > .chapter-photo-project')
assert soup.select_one('link[href^="./css/v14.css"]')
assert soup.select_one('script[src^="./js/copy-reveal.js"]')
assert not soup.find(string=re.compile('X / TWITTER'))
assert soup.select_one('a[href="https://x.com/KURISEW"] strong').get_text(strip=True)=='X'
assert 'hero-kurisu.mp4' in loader

print('PASS: local assets',len(paths),'JS/CSS syntax, 5 routes, 3 project slides, picture backdrops, origin cipher, chaos-to-form animation, video faststart')
