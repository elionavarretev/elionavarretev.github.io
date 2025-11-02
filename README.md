# Elio Navarrete - Portfolio Website

![Portfolio Preview](assets/img/about/about-ElioNavarrete.jpg)

A modern, responsive portfolio website showcasing the professional profile of Elio Navarrete, QA Automation Engineer and College Professor.

## 🌐 Live Website

Visit the live website: [elionavarretev.github.io](https://elionavarretev.github.io)

## 👨‍💼 About

This portfolio website presents Elio Navarrete's professional journey as a Lead QA Engineer with 9+ years of experience. Currently serving as Lead QA at Open Loop, Elio has demonstrated exceptional leadership in quality assurance, driving excellence in software testing processes and mentoring teams. The site highlights his expertise in QA automation, leadership in quality assurance, Scrum Master certification, and his role as a professor at UPC (Universidad Peruana de Ciencias Aplicadas).

## 🎯 Current Role

**Lead QA at Open Loop** (October 2025 - Present)
- Leading quality assurance initiatives and driving excellence in software testing processes
- Overseeing testing strategies and mentoring team members
- Ensuring highest quality standards across all projects
- Coordinating with cross-functional teams to implement best practices
- Optimizing testing workflows and delivering robust solutions

## 🚀 What's New

- 🌙 **Dark Mode Toggle**: Persistent theme switcher with OS preference detection
- 🧪 **Testing Portfolio Refresh**: Highlighted Playwright, Cypress, and Serenity BDD projects
- 🧬 **ORCID Integration**: Scientific publications auto-fetched from ORCID profile (0000-0001-8810-2068)
- 🔗 **Expanded Social Links**: Quick access to LinkedIn, GitHub, and ORCID profiles

## 🚀 Features

- **Responsive Design**: Fully responsive across all devices
- **Modern UI/UX**: Clean, professional design with smooth animations and accessible typography
- **Interactive Portfolio**: Filterable gallery spotlighting Playwright, Cypress, and Serenity BDD work
- **Scientific Publications**: Automated feed of recent ORCID publications (deduplicated & sorted)
- **SEO Optimized**: Meta tags, structured data, and Google Tag Manager integration
- **Fast Loading**: Optimized assets and efficient code structure
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard-friendly controls

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Custom styles with Bootstrap framework
- **JavaScript**: jQuery-based interactions and animations
- **SCSS**: Modular CSS architecture with preprocessing

### Libraries & Frameworks
- **Bootstrap 4**: Responsive grid system and components
- **jQuery**: DOM manipulation and AJAX requests
- **Font Awesome & Simple Line Icons**: Icon libraries
- **Animate.css**: CSS animations
- **Nivo Lightbox**: Image gallery functionality
- **MixItUp**: Portfolio filtering

### Backend
- **PHP**: Legacy contact form processing (currently disabled on UI)
- **GitHub Pages**: Static site hosting

## 📁 Project Structure

```
elionavarretev.github.io/
├── index.html                 # Main HTML file
├── README.md                  # Project documentation
└── assets/                    # Static assets
    ├── css/                   # Stylesheets
    │   ├── main.css          # Main styles
    │   ├── responsive.css    # Responsive design
    │   ├── about.css         # About section styles
    │   └── ...               # Additional CSS files
    ├── js/                   # JavaScript files
    │   ├── main.js           # Main JavaScript logic
    │   ├── menu.js           # Menu functionality
    │   └── ...               # Additional JS files
    ├── img/                  # Images and graphics
    │   ├── about/            # About section images
    │   ├── gallery/          # Portfolio images
    │   ├── icons/            # Social/media icons (e.g. ORCID)
    │   ├── slider/           # Hero slider images
    │   └── favi/             # Favicons and app icons
    ├── fonts/                # Web fonts
    ├── doc/                  # Documents (CV, certificates)
    ├── php/                  # PHP scripts
    └── scss/                 # SCSS source files
```

## 🎯 Sections

### 1. **Hero Area**
- Professional introduction
- Social media links (LinkedIn, GitHub, ORCID)
- Animated background slider

### 2. **About**
- Personal information and professional summary
- Contact details and availability status
- Download CV functionality

### 3. **Services**
- QA Lead expertise
- Scrum Master certification
- Professor role
- Consultancy services

### 4. **Resume**
- Educational background (UPC, Universidad Austral, PUCP, Pontificia Universidad Javeriana)
- Professional experience timeline
- Current positions at Open Loop and UPC
- Licenses & Certifications grid

### 5. **Portfolio**
- Interactive project showcase curated around automation/testing stacks
- Filterable by Playwright, Cypress, and Serenity BDD
- Links to GitHub repositories with project assets

### 6. **Scientific Publications**
- Dynamic list fed from ORCID public API
- Deduplicated using title/year keys and sorted by most recent
- DOI links when available

### 7. **Contact & Social**
- Footer with social links and location details
- Back-to-top shortcut for quick navigation

## 🔧 Setup & Installation

### Prerequisites
- Web browser
- Text editor (VS Code, Sublime Text, etc.)
- Git (for version control)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/elionavarretev/elionavarretev.github.io.git
   cd elionavarretev.github.io
   ```

2. **Open in browser**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Or simply open index.html in your browser
   ```

3. **Access locally**
   - Navigate to `http://localhost:8000` (if using a server)
   - Or open `index.html` directly in your browser

### Customization

1. **Update Personal Information**
   - Edit `index.html` to update personal details
   - Replace images in `assets/img/` with your own
   - Update CV in `assets/doc/`

2. **Modify Styling**
   - Edit SCSS files in `assets/scss/`
   - Compile to CSS or edit CSS files directly
   - Customize colors in `assets/scss/colors/_presets.scss`

3. **Add Projects**
   - Add new project images to `assets/img/gallery/`
   - Update portfolio section in `index.html`
   - Add corresponding GitHub repository links

4. **ORCID Publications**
   - Update the `orcid` variable in the inline script (near the end of `index.html`) to your ORCID iD
   - Adjust `summaries.slice(0, 20)` to change the number of entries shown

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1200px and above
- **Tablet**: 768px - 1199px
- **Mobile**: 320px - 767px

## 🎨 Customization Guide

### Colors
Edit `assets/scss/colors/_presets.scss` to change the color scheme:
```scss
$primary-color: #your-color;
$secondary-color: #your-color;
```

### Fonts
Update font imports in `index.html` and corresponding CSS files.

### Images
Replace placeholder images with your own:
- Profile photo: `assets/img/about/about-ElioNavarrete.jpg`
- Portfolio images: `assets/img/gallery/`
- Background images: `assets/img/background/`

## 📧 Contact Form

> The legacy contact form markup has been removed from the UI. To re-enable it, restore the section in `index.html` and configure the PHP endpoint under `assets/php/` or integrate a third-party email service.

## 🚀 Deployment

### GitHub Pages (Current)
1. Push changes to the `master` branch
2. GitHub Pages automatically deploys from the root directory
3. Site is available at `https://elionavarretev.github.io`

### Alternative Hosting
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **Firebase Hosting**: Google's hosting platform

## 📊 Performance

- **Lighthouse Score**: Optimized for performance, accessibility, and SEO
- **Loading Speed**: Compressed images and minified assets
- **Mobile Performance**: Responsive design with touch-friendly interactions

## 🔒 Security

- Form validation hooks ready for re-enabling contact form
- No sensitive information exposed in client-side code
- HTTPS enabled on GitHub Pages

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

While this is a personal portfolio, suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add some improvement'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Create a Pull Request

## 📞 Contact

**Elio Navarrete**
- 📧 Email: [elionavarretev@gmail.com](mailto:elionavarretev@gmail.com)
- 💼 LinkedIn: [linkedin.com/in/eliojeff](https://www.linkedin.com/in/eliojeff)
- 🐙 GitHub: [github.com/elionavarretev](https://github.com/elionavarretev)
- 🧬 ORCID: [orcid.org/0000-0001-8810-2068](https://orcid.org/0000-0001-8810-2068)
- 📍 Location: Miraflores, Lima, Perú

---

⭐ **Star this repository if you found it helpful!**

*Last updated: November 2025*
