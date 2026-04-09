# Anton Glenbovitch Portfolio Site

A modern, content-rich portfolio showcasing AI/LLM engineering work, detailed project writeups, and technical articles.

## 📁 Site Structure

```
antonglenbovitch.github.io/
├── index.html                          # Home page (hero, projects overview, articles preview)
├── css/
│   └── style.css                       # Shared styling (responsive, dark-mode ready)
├── projects/
│   ├── enterprise-claim-ai.html        # Enterprise Claim AI Platform (detailed writeup)
│   ├── rag-evaluation-framework.html   # RAG Evaluation Framework (open source)
│   └── health-insurance-chatbot.html   # Health Insurance Chatbot (full-stack)
├── blog/
│   └── index.html                      # Articles listing page
├── assets/
│   ├── images/                         # Project images, diagrams
│   └── CNAME                           # Custom domain (antonglenbovitch.com)
├── CONTENT_CALENDAR.md                 # 12-week article publishing schedule
└── README.md                           # This file
```

## 🚀 Getting Started

### Local Development

```bash
# Clone the repo
git clone https://github.com/AntonGlenbovitch/antonglenbovitch.github.io.git
cd antonglenbovitch.github.io

# Serve locally (Python)
python3 -m http.server 8000
# Visit http://localhost:8000

# Or with Node.js
npx http-server
# Visit http://localhost:8080
```

### Publishing

The site auto-deploys to GitHub Pages when you push to `main`.

```bash
# Make changes
git add .
git commit -m "Update portfolio"
git push origin main
# Site updates in ~30 seconds at antonglenbovitch.com
```

## 📝 Adding Content

### Add a New Project

1. **Create a project page** in `/projects/{name}.html`:
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <title>Project Name – Anton Glenbovitch</title>
     <link rel="stylesheet" href="../css/style.css">
   </head>
   <body>
     <header>...</header>
     <main>
       <div class="container">
         <!-- Project details -->
       </div>
     </main>
     <footer>...</footer>
   </body>
   </html>
   ```

2. **Add a card on the home page** in `index.html`:
   ```html
   <div class="project-card">
     <h3>Project Name</h3>
     <div class="tech-stack">
       <span class="tech-tag">Tech1</span>
       <span class="tech-tag">Tech2</span>
     </div>
     <p>Project description...</p>
     <a href="/projects/project-name.html" class="cta-button">Read Full Writeup</a>
   </div>
   ```

### Add a New Article

1. **Publish on Medium or Dev.to** (not on this site)
2. **Add to blog listing** in `/blog/index.html`:
   ```html
   <a href="https://medium.com/@yourname/article" target="_blank" class="article-item">
     <h3 class="article-title">Article Title</h3>
     <div class="article-meta">🗓️ April 2025 • 📰 Medium • ⏱️ 8 min read</div>
     <p class="article-excerpt">Brief excerpt...</p>
     <a href="..." class="article-link">Read on Medium →</a>
   </a>
   ```

## 🎨 Styling

The site uses a clean, minimal design with CSS variables for theming:

```css
:root {
  --primary: #2563eb;        /* Main brand color */
  --secondary: #059669;      /* Accent color */
  --text-dark: #0f172a;      /* Dark text */
  --text-light: #334155;     /* Light text */
  --bg-light: #f8fafc;       /* Light background */
  --bg-white: #ffffff;       /* White background */
}
```

### Customizing Colors

Edit `css/style.css` and update the `:root` color variables.

## 📊 Performance

- **Lighthouse Score:** 95+ (performance, accessibility, best practices)
- **Page Load:** <1s on 4G
- **Mobile-Friendly:** Fully responsive (mobile-first design)
- **SEO:** Structured data, meta tags, semantic HTML

## 🔗 External Links

The site links to:
- **GitHub:** `github.com/AntonGlenbovitch`
- **LinkedIn:** `linkedin.com/in/anton-glenbovitch-9934897a`
- **Medium:** `medium.com/@antonglenbovitch`
- **Dev.to:** `dev.to/antonglenbovitch`

Update these in `index.html` footer and project pages as needed.

## 📱 Responsive Design

The site is mobile-first and fully responsive:
- Desktop: 2-column grids
- Tablet: 1-column adaptive
- Mobile: Full-width, touch-optimized

## 🔐 Security

- No external dependencies (except fonts via Google Fonts)
- No analytics trackers (privacy-first)
- No cookies or tracking

## 📈 SEO

Each page includes:
- Unique `<title>` tag (under 60 chars)
- Meta description (under 160 chars)
- Open Graph tags for social sharing
- Structured data (schema.org JSON-LD)

## 🚀 Next Steps

1. **Write articles:** Follow the [Content Calendar](CONTENT_CALENDAR.md)
2. **Build projects:** Create 3–5 GitHub repos showcasing your work
3. **Gather social proof:** Get recommendations on LinkedIn, stars on GitHub
4. **Monitor traffic:** Use Google Analytics (optional) to track portfolio engagement

## 📞 Contact

Add your contact info to `index.html` footer and contact section. Currently set to:
- **Email:** `a.glenbovitch@gmail.com`
- **Phone:** `(203) 540-7348`

## 📄 License

This portfolio site is personal and not licensed for reuse. Feel free to fork and adapt for your own use.

---

**Built by Anton Glenbovitch**  
Portfolio launched April 2025  
Last updated: April 10, 2025
