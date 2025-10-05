# 💍 Fullstack Assignment – Product List App

Bu proje, mücevher ürünlerini listeleyen tam kapsamlı (Full Stack) bir uygulamadır.  
Backend kısmı **FastAPI** ile geliştirilmiş, frontend kısmı ise **HTML + CSS + JavaScript (Swiper.js)** ile hazırlanmıştır.  
Proje canlı olarak Render (backend) ve Vercel (frontend) üzerinde barındırılmaktadır.

---

## 🚀 Canlı Demo

- **Frontend (Vercel):** [https://fullstack-assignment-murex.vercel.app](https://fullstack-assignment-murex.vercel.app)  
- **Backend (Render):** [https://fullstack-assignment-xs79.onrender.com](https://fullstack-assignment-xs79.onrender.com)

---

## 🧩 Özellikler

- Ürünlerin (yüzüklerin) listelenmesi  
- Altın fiyatına göre otomatik USD fiyat hesaplama  
- Renk seçenekleri (Yellow, White, Rose Gold)  
- Ürün popülerliği (yıldız sistemi ile)   
- Filtreleme ve API üzerinden veri çekme  
- Responsive tasarım

---

## ⚙️ Teknolojiler

### Backend:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Python 3.11+](https://www.python.org/)
- [Uvicorn](https://www.uvicorn.org/)
- [Dotenv](https://pypi.org/project/python-dotenv/)

### Frontend:
- Vanilla JavaScript  
- HTML5 / CSS3  
- [Swiper.js](https://swiperjs.com/)  
- Fetch API  

### Deployment:
- Backend → [Render.com](https://render.com)  
- Frontend → [Vercel](https://vercel.com)


## 🧠 Proje Yapısı
fullstack-assignment/
│
├── backend/
│ ├── app/
│ │ ├── main.py
│ │ ├── repo.py
│ │ ├── price.py
│ │ ├── gold.py
│ │ ├── filters.py
│ │ └── models.py
│ ├── .env
│ ├── requirements.txt
│ └── ...
│
├── frontend/
│ ├── index.html
│ ├── app.js
│ ├── style.css
│ └── ...
│
└── README.md

