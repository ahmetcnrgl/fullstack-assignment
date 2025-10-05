//API
async function fetchProducts(){
  const r = await fetch(`${window.API_URL}/products`);
  if(!r.ok) throw new Error('API error');
  return r.json();
}
function cap(s){ return s[0].toUpperCase()+s.slice(1); }

// Stars
function renderStars(value5){
  const pct = Math.max(0, Math.min(100, (Number(value5) / 5) * 100));
  const wrap = document.createElement('span');
  wrap.className = 'stars precise-wrap';

  const base = document.createElement('span');
  base.className = 'stars-base';
  base.textContent = '★★★★★';

  const fill = document.createElement('span');
  fill.className = 'stars-fill';
  fill.textContent = '★★★★★';
  fill.style.width = pct + '%';

  wrap.appendChild(base);
  wrap.appendChild(fill);
  return wrap;
}


function clamp(v, a=0, b=255){ return Math.min(b, Math.max(a, v)); }

function rgbDist2(a, b){
  const dr = a.r-b.r, dg = a.g-b.g, db = a.b-b.b;
  return dr*dr + dg*dg + db*db;
}


function sampleCornerAvg(ctx, w, h, size=16){
  const samples = [];
  const regions = [
    {x:0, y:0},
    {x:w-size, y:0},
    {x:0, y:h-size},
    {x:w-size, y:h-size},
  ];
  for(const {x,y} of regions){
    const {data} = ctx.getImageData(x, y, size, size);
    let r=0,g=0,b=0,n=0;
    for(let i=0;i<data.length;i+=4){
      const A = data[i+3];
      if(A<240) continue; 
      r+=data[i]; g+=data[i+1]; b+=data[i+2]; n++;
    }
    if(n>0) samples.push({r:r/n, g:g/n, b:b/n});
  }
  if(!samples.length) return {r:245,g:245,b:245};
  const s = samples.reduce((a,c)=>({r:a.r+c.r,g:a.g+c.g,b:a.b+c.b}),{r:0,g:0,b:0});
  return {r: s.r/samples.length, g: s.g/samples.length, b: s.b/samples.length};
}


async function removeBackgroundByKeying(imgEl, options={}){
  const TH = options.TH ?? 26*26;      
  const MIN_L = options.MIN_L ?? 200; 
  const FEATHER = options.FEATHER ?? 1; 

  try{
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgEl.src;
    await img.decode();

    const w = img.width, h = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const key = sampleCornerAvg(ctx, w, h, 16); 
    const im = ctx.getImageData(0, 0, w, h);
    const data = im.data;

    for (let y=0; y<h; y++){
      for (let x=0; x<w; x++){
        const k = (y*w + x) * 4;
        const r=data[k], g=data[k+1], b=data[k+2], a=data[k+3];
        if(a===0) continue;

        const max = Math.max(r,g,b);
        const near = rgbDist2({r,g,b}, key) <= TH;
        if (near && max >= MIN_L){
          data[k+3] = 0; 
        }
      }
    }

  
    if(FEATHER>0){
      const out = new Uint8ClampedArray(data);
      const alpha = (x,y)=> out[((y*w+x)<<2)+3] || 0;
      for (let y=1; y<h-1; y++){
        for (let x=1; x<w-1; x++){
          const k = (y*w + x) * 4;
          if (out[k+3]===0){
            const around = alpha(x-1,y)+alpha(x+1,y)+alpha(x,y-1)+alpha(x,y+1);
            if (around>0 && around<1020){
              data[k+3] = 80; 
            }
          }
        }
      }
    }

    ctx.putImageData(im, 0, 0);
    imgEl.src = canvas.toDataURL('image/png');
  }catch(err){
    console.warn('removeBackgroundByKeying fallback:', err?.message||err);
  }
}

const EMPTY_DATA_URL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

async function processImageUrl(url){
  // proxy üzerinden al
  const proxied = `${window.API_URL}/img?url=${encodeURIComponent(url)}`;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = proxied;
  await img.decode();
  const tmp = document.createElement('img');
  tmp.src = proxied;
  await removeBackgroundByKeying(tmp, { TH: 26*26, MIN_L: 200, FEATHER: 1 });
  return tmp.src; // data URL
}

async function setProcessedImage(imgEl, url){
  if(!imgEl) return;
  imgEl.style.opacity = '0';
  imgEl.src = EMPTY_DATA_URL; 
  try{
    const out = await processImageUrl(url);
    imgEl.src = out;
  }finally{
    requestAnimationFrame(()=>{ imgEl.style.opacity = '1'; });
  }
}
// =============================================================================

function productTile(p){
  const colors = ["yellow","white","rose"].filter(c => !!(p.images && p.images[c]));
  const current = { color: colors[0] };

  const el = document.createElement('div');
  el.className = 'tile';
  el.innerHTML = `
    <div class="thumb"><img id="img" src="${p.images[current.color]}" alt="${p.name}"></div>

    <div class="name">${p.name}</div>
    <div class="price">$${Number(p.priceUSD).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})} USD</div>

    <div class="row">
      <div class="small" id="colorLabel">${cap(current.color)} Gold</div>
      <div class="swatches"></div>
    </div>

    <div class="row">
      <div class="stars" id="stars"></div>
      <div class="rating">${p.popularity5}/5</div>
    </div>
  `;

  // Stars
  const starsEl = el.querySelector('#stars');
  starsEl.innerHTML = '';
  starsEl.appendChild(renderStars(p.popularity5));

  // Arka plan ayarları
  const imgEl = el.querySelector('#img');
  setProcessedImage(imgEl, p.images[current.color]);

  // Renk seçici
  const swatches = el.querySelector('.swatches');
  const colorLabel = el.querySelector('#colorLabel');
  if(colors.length <= 1){
    swatches.parentElement.style.display = 'none';
  } else {
    colors.forEach((c,i)=>{
      const b=document.createElement('button');
      b.className='swatch' + (i===0 ? ' active' : '');
      b.dataset.color=c; b.title=`${cap(c)} Gold`;
      b.addEventListener('click', ()=>{
        swatches.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        setProcessedImage(imgEl, p.images[c]);
        colorLabel.textContent = `${cap(c)} Gold`;
      });
      swatches.appendChild(b);
    });
  }

  return el;
}

(async ()=>{
  const host = document.getElementById('product-slides');
  try{
    const data = await fetchProducts();

    data.items.forEach(p=>{
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.appendChild(productTile(p));
      host.appendChild(slide);
    });

    new Swiper('.products-swiper', {
      loop: true,
      spaceBetween: 48,
      navigation: {
        nextEl: '.products-swiper .main-next',
        prevEl: '.products-swiper .main-prev'
      },
      slidesPerView: 1,
      breakpoints: {
        680:  { slidesPerView: 2 },
        980:  { slidesPerView: 3 },
        1240: { slidesPerView: 4 }
      }
    });
  }catch(e){
    host.innerHTML = `<pre style="white-space:pre-wrap">Hata: ${e?.message || e}</pre>`;
    console.error(e);
  }
})();

