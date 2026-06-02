# Miniop 10 — Tria llibres per a infants i joves

Informe tècnic de sanejament, optimització i preparació de publicació del miniop 10 **Tria llibres**.

## Resum executiu

Aquest projecte correspon a un website estàtic HTML/CSS/JS d’un miniop educatiu sobre la tria de llibres per a infants i joves.

S’ha fet una intervenció integral de rendiment i sanejament amb l’objectiu de:

* reduir dràsticament el pes de les pàgines;
* eliminar dependències externes bloquejants;
* mantenir l’experiència visual i pedagògica original;
* evitar que els usuaris hagin de sortir del web per consultar recursos multimèdia;
* preparar un paquet de publicació net i autocontingut;
* conservar els originals al repositori, però publicar només un `dist/` optimitzat.

L’estat final recomanat és:

```text
Artefacte de publicació: dist/
Estat: llest per publicar
Pes final aproximat de dist/: 14M
Fitxers a dist/: 211
Recursos externs automàtics en page load: 0
Rutes locals trencades detectades: 0
```

## Estat inicial detectat

L’auditoria inicial va identificar diversos problemes importants:

* pàgines internes amb pesos molt elevats, entre 9MB i 14MB+;
* imatges PNG/JPG originals servides directament;
* 110 imatges sense `loading="lazy"` ni `width`/`height`;
* fonts externes i duplicades;
* dependències externes bloquejants al `<head>`;
* scripts i iframes remots carregats automàticament;
* embeds de YouTube, Vimeo, SoundCloud, Slides, Issuu i CCMA carregats d’entrada;
* fitxers sobrants publicables, com `.DS_Store`, `.pxm`, `.map` i assets de treball;
* absència d’un artefacte net de deploy;
* pàgines legacy i recursos antics amb enllaços remots o trencats.

El problema més crític detectat posteriorment va ser la càrrega del servei extern:

```html
<link rel="stylesheet" href="https://weloveiconfonts.com/api/?family=entypo">
```

Aquest recurs provocava un retard molt gran i bloquejava el renderitzat inicial de la pàgina.

## Objectius de la intervenció

Els objectius principals han estat:

1. Fer la web molt més lleugera.
2. Evitar dependències externes automàtiques.
3. Mantenir l’aspecte visual general del curs.
4. Conservar el contingut multimèdia dins la mateixa pàgina.
5. Distingir correctament entre:

   * media interactiu extern;
   * imatges/cobertes estàtiques;
   * recursos morts o no recuperables.
6. Generar un paquet `dist/` net, publicable i autocontingut.
7. No actualitzar Bootstrap/jQuery ni fer redesign general.

## Principals canvis realitzats

### 1. Optimització massiva d’imatges

S’han convertit imatges locals pesades a versions optimitzades `.opt.webp`.

Exemples de reducció detectats durant la fase inicial:

| Pàgina          |  Pes abans | Pes després aproximat |
| --------------- | ---------: | --------------------: |
| `index.html`    |  4072.9 KB |              470.5 KB |
| `2/index.html`  |  3070.5 KB |              488.8 KB |
| `3/index.html`  |  8918.4 KB |             1810.8 KB |
| `4/index.html`  | 11313.9 KB |             1326.1 KB |
| `5/index.html`  | 14129.4 KB |             1986.1 KB |
| `10/index.html` |  5185.3 KB |              778.0 KB |
| `11/index.html` | 10345.2 KB |             1356.3 KB |

També s’han afegit, quan era segur:

* `width`;
* `height`;
* `decoding="async"`;
* `loading="lazy"` per a imatges no crítiques.

No s’ha aplicat `lazy` a les imatges principals above-the-fold quan això podia afectar el renderitzat inicial.

### 2. Eliminació de `weloveiconfonts.com` i Entypo

S’ha eliminat completament la dependència externa:

```text
https://weloveiconfonts.com/api/?family=entypo
```

També s’han eliminat:

* classes `entypo-*`;
* icones decoratives dependents d’Entypo;
* selectors CSS associats.

Validació final:

```bash
rg -n "weloveiconfonts|entypo|entypo-" .
```

Resultat esperat:

```text
cap coincidència
```

### 3. Autohosting de fonts

Inicialment el projecte carregava Google Fonts des de:

* `fonts.googleapis.com`;
* `fonts.gstatic.com`.

S’han substituït per fonts locals a:

```text
fonts/google/
css/fonts-local.css
```

Fonts autohostejades:

* `Lora` 400;
* `Lora` 700;
* `Lora` italic 400;
* `Lora` italic 700;
* `Source Sans Pro` 400;
* `Source Sans Pro` 700;
* `Droid Serif` 400;
* `Droid Serif` 700;
* `Droid Serif` italic 400.

S’ha mantingut:

```css
font-display: swap;
```

Validació final:

```bash
rg -n "fonts.googleapis|fonts.gstatic" dist
```

Resultat esperat:

```text
cap coincidència
```

### 4. Eliminació d’Issuu automàtic

La pàgina `6/index.html` carregava automàticament:

```text
//e.issuu.com/embed.js
```

Aquest script ja no es carrega en page load.

S’ha substituït per un sistema de càrrega sota demanda:

* cap script remot inicial;
* placeholder local;
* càrrega inline dins la pàgina només després del clic;
* manteniment del `data-configid` antic quan escau.

Risc pendent:

```text
data-configid="0/12273045" sembla obsolet i el visor remot retorna “Not Found”.
```

Aquest punt queda documentat com a risc editorial/de contingut, no com a problema de rendiment.

### 5. Sistema de media click-to-load inline

S’ha implementat un patró per als recursos multimèdia externs:

```text
media interactiu extern → placeholder local + click-to-load inline
```

Això afecta recursos com:

* SoundCloud;
* Slides;
* YouTube;
* Vimeo;
* CCMA / 3Cat;
* Issuu;
* altres iframes o media remots.

El comportament final és:

```text
En page load:
- 0 iframes remots
- 0 scripts remots
- 0 imatges remotes actives

Després de clic:
- el recurs extern es carrega inline dins la mateixa pàgina
```

Això permet mantenir una càrrega inicial ràpida sense expulsar l’usuari fora del web.

### 6. Millora visual dels placeholders multimèdia

Els primers placeholders generats eren blocs grisos massa pobres visualment.

S’han substituït per placeholders amb:

* preview local;
* overlay;
* títol;
* botó principal “Carrega el contingut aquí”;
* enllaç secundari “Obre en pestanya nova” només com a fallback;
* dimensions adaptades al tipus de recurs.

Classes afegides o modificades:

```css
.media-placeholder
.media-placeholder--compact
.media-placeholder--video
.media-placeholder--document
.media-placeholder__bg
.media-placeholder__overlay
.media-placeholder__body
```

Cas destacat:

```text
SoundCloud a /6/ passa a una alçada compacta de 200px.
```

### 7. Previews exactes dels embeds remots

S’han substituït previews representatives per captures locals fidels del contingut remot quan ha estat possible.

S’han generat 23 previews `.webp` dins de carpetes com:

```text
*/assets/media-previews/
```

Proveïdors coberts:

* SoundCloud;
* Slides;
* Vimeo;
* 3Cat / CCMA;
* YouTube;
* imatges externes.

També s’ha creat una eina reutilitzable:

```text
tools/generate_embed_previews.js
```

Aquesta eina serveix per generar o mantenir captures locals dels embeds.

La carpeta `tools/` queda exclosa de `dist/`.

### 8. Correcció de cobertes de llibres a `10/index.html`

S’ha corregit una regressió important: algunes cobertes de llibres havien estat tractades com si fossin embeds externs.

Criteri final:

```text
Media interactiu extern → click-to-load inline.
Coberta de llibre / imatge estàtica → imatge local visible + zoom.
Recurs mort → nota editorial o substitució local documentada.
```

A `10/index.html` s’han convertit 6 cobertes de placeholder extern a imatge local visible amb zoom/lupa via Fluidbox.

Imatges locals creades:

```text
10/assets/img/shaun-tan-album.opt.webp
10/assets/img/noche-de-tormenta.opt.webp
10/assets/img/mort-en-el-nil.opt.webp
10/assets/img/pell-freda.opt.webp
10/assets/img/les-llagrimes-assassi.opt.webp
10/assets/img/tots-els-contes-calders.opt.webp
```

El SoundCloud continua com a únic `external-embed-placeholder` a `10/index.html`, perquè és media real.

Validació final de `10/index.html`:

```text
external-embed-placeholder: 1
placeholder restant: SoundCloud
placeholders de cobertes: 0
hotlinks de cobertes: 0
```

### 9. Creació de `dist/` net

S’ha creat el script:

```bash
./deploy_static_clean.sh
```

Aquest script genera un paquet publicable:

```text
dist/
```

El paquet `dist/` exclou:

* `.git`;
* `dist`;
* `media`;
* `tools`;
* `index-2201205.html`;
* backups;
* `.DS_Store`;
* `*.pxm`;
* `*.psd`;
* `*.ai`;
* `*.map`;
* temporals;
* originals raster PNG/JPG no referenciats quan hi ha equivalent `.opt.webp`;
* assets de tema o demo no usats.

Resultat final:

```text
dist_size=14M
dist_files=211
missing_count=0
external_resources_remaining: buit
```

## Fitxers i carpetes rellevants

### HTML principals

```text
index.html
1/index.html
2/index.html
3/index.html
4/index.html
5/index.html
6/index.html
7/index.html
8/index.html
9/index.html
10/index.html
11/index.html
12/index.html
img/single.html
```

### CSS

```text
css/main.css
css/miniops.css
css/fonts-local.css
css/bootstrap.min.css
```

### JavaScript

```text
js/main.js
js/vendor/jquery-1.10.1.min.js
js/vendor/jquery.jpanelmenu.min.js
js/vendor/bootstrap.min.js
```

### Fonts locals

```text
fonts/google/
```

### Previews d’embeds

```text
*/assets/media-previews/
```

### Script de deploy

```text
deploy_static_clean.sh
```

### Eina de generació de previews

```text
tools/generate_embed_previews.js
```

## Validació realitzada

S’han executat validacions sobre el projecte i sobre `dist/`.

### Validació de patrons crítics

```bash
rg -n "weloveiconfonts|entypo|entypo-" .
rg -n "fonts.googleapis|fonts.gstatic" dist
rg -n "e\.issuu\.com|issuu" dist
find . -type f -name ".DS_Store"
```

Resultats esperats:

```text
No hi ha weloveiconfonts.
No hi ha entypo.
No hi ha Google Fonts remotes.
No hi ha Issuu carregat automàticament.
No hi ha .DS_Store.
```

### Validació de `dist/`

```bash
./deploy_static_clean.sh
```

Resultat final:

```text
dist_size=14M
dist_files=211
missing_count=0
external_resources_remaining:
```

### Validació de rutes

S’han comprovat amb servidor local:

```text
/
 /1/
 /2/
 /3/
 /4/
 /5/
 /6/
 /7/
 /8/
 /9/
 /10/
 /11/
 /12/
 /img/single.html
```

Resultat esperat:

```text
200 OK
```

### Validació amb Chromium

S’ha validat especialment:

```text
/6/
/10/
```

A l’estat inicial de pàgina:

```text
externalIframes=[]
externalScripts=[]
```

Després de clic:

```text
Els media externs vius es carreguen inline dins la mateixa pàgina.
```

## Com generar el paquet de publicació

Des de l’arrel del projecte:

```bash
./deploy_static_clean.sh
```

Això genera:

```text
dist/
```

La publicació s’ha de fer sempre des de `dist/`, no des de l’arrel del repositori.

## Com servir localment per validar

```bash
cd dist
python3 -m http.server 8790
```

Obrir al navegador:

```text
http://localhost:8790/
http://localhost:8790/6/
http://localhost:8790/10/
```

## Regla de publicació

No publicar mai l’arrel del repositori.

```text
Correcte:
dist/

Incorrecte:
arrel del projecte
```

L’arrel del projecte conserva originals, eines, fonts, backups o assets no publicables.

## Recomanació de desplegament

Exemple amb `rsync`:

```bash
./deploy_static_clean.sh
rsync -av --delete dist/ usuari@servidor:/ruta/publica/
```

El paràmetre `--delete` només s’ha d’utilitzar si la ruta de destí és segura i exclusiva per aquest website.

## Recomanació de cache i compressió

En producció, el servidor hauria d’aplicar:

### HTML

```text
Cache-Control: no-cache, must-revalidate
```

### Assets estàtics

Per CSS, JS, WebP, fonts i SVG:

```text
Cache-Control: public, max-age=31536000, immutable
```

### Compressió

Activar quan sigui possible:

```text
gzip
brotli
zstd
```

### Tipus MIME importants

Assegurar que el servidor envia correctament:

```text
.webp
.css
.js
.ttf
.woff
.woff2
```

## Recursos externs

### En page load

L’objectiu és:

```text
0 recursos externs automàtics
```

### Després de clic

Alguns recursos poden carregar proveïdors externs només sota demanda:

* SoundCloud;
* Slides;
* YouTube;
* Vimeo;
* CCMA / 3Cat;
* Issuu, si el recurs continua existint.

Això és intencionat.

## Riscos pendents coneguts

### Issuu a `6/index.html`

El recurs antic:

```text
data-configid="0/12273045"
```

sembla obsolet i el visor remot pot retornar:

```text
Not Found
```

No és un problema de rendiment, sinó de contingut extern mort.

Accions possibles:

* recuperar el document original;
* substituir-lo per un PDF o recurs local;
* eliminar el bloc;
* deixar una nota editorial clara indicant que el recurs ja no està disponible.

### YouTube amb thumbnails genèrics

Alguns vídeos només permeten obtenir un thumbnail oficial genèric o restringit.

Si el vídeo funciona després del clic, no és bloquejant.

### Coberta `Mort en el Nil`

La URL original de `bratac.cat` ja no resol. S’ha substituït per una imatge local equivalent de coberta.

Cal mantenir aquesta decisió documentada.

### Coberta Shaun Tan

La coberta queda identificada genèricament perquè el context textual no fixa un títol únic amb total seguretat.

Alt text utilitzat:

```text
Coberta d'un àlbum de Shaun Tan
```

## Criteris de manteniment futur

### 1. No afegir embeds directes

No afegir:

```html
<iframe src="https://...">
<script src="https://...">
```

directament als HTML principals.

Els recursos externs interactius han d’usar el patró:

```text
placeholder local + click-to-load inline
```

### 2. No hotlinkar cobertes de llibres

Les cobertes i imatges estàtiques han de ser locals:

```text
assets/img/*.opt.webp
```

i, si escau, amb Fluidbox:

```html
<a href="assets/img/coberta.opt.webp">
  <img src="assets/img/coberta.opt.webp" class="img-responsive img-thumbnail">
</a>
```

### 3. No publicar originals pesants

Els originals poden quedar al repo, però no han d’entrar a `dist/`.

### 4. Regenerar sempre `dist/`

Abans de publicar:

```bash
./deploy_static_clean.sh
```

### 5. Validar absència de tercers automàtics

Comprovació recomanada:

```bash
rg -n '<iframe[^>]+src=["'\'']https?://' dist --glob '*.html'
rg -n '<script[^>]+src=["'\'']https?://' dist --glob '*.html'
rg -n "fonts.googleapis|fonts.gstatic|weloveiconfonts|entypo" dist
```

## Proposta de commits recomanats

Si es vol separar històricament la feina feta:

```bash
git commit -m "Optimize static assets and image delivery"
git commit -m "Remove blocking external icon font dependency"
git commit -m "Self-host fonts and create clean static deploy"
git commit -m "Load external media inline on demand"
git commit -m "Use exact local previews for media placeholders"
git commit -m "Show book covers as local zoomable images"
```

Si ja està tot agrupat, un commit global raonable seria:

```bash
git commit -m "Prepare lightweight self-contained Miniop 10 static deploy"
```

## Estat final

El projecte queda en un estat publicable des de:

```text
dist/
```

Característiques finals:

```text
- paquet autocontingut;
- fonts locals;
- imatges optimitzades;
- cobertes locals visibles amb zoom;
- media extern sota demanda;
- previews locals fidels;
- cap recurs extern automàtic en page load;
- dist de 14M;
- rutes locals validades;
- cap missing asset detectat.
```

## Checklist abans de publicar

```text
[ ] Executar ./deploy_static_clean.sh
[ ] Servir dist/ localment
[ ] Revisar /
[ ] Revisar /6/
[ ] Revisar /10/
[ ] Revisar /12/
[ ] Revisar /img/single.html
[ ] Verificar que SoundCloud carrega inline després del clic
[ ] Verificar que Slides carrega inline després del clic
[ ] Verificar que les cobertes de /10/ són visibles i tenen zoom
[ ] Verificar que no hi ha recursos externs automàtics amb DevTools
[ ] Publicar només dist/
```

## Notes finals

Aquesta intervenció ha transformat el miniop en una web estàtica més ràpida, més robusta i més controlable.

El criteri final del projecte és:

```text
El contingut essencial ha de ser local, visible i lleuger.
El media extern ha de carregar-se només quan l’usuari ho demani.
El paquet publicable ha de ser dist/, no l’arrel del repositori.
```
