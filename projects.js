// Projects Page JavaScript
class ProjectsPage {
    constructor() {
      this.slides = document.querySelectorAll('.slide');
      this.projectCards = document.querySelectorAll('.project-card');
      this.sliderContainer = document.querySelector('.slider-container');
      this.prevButton = document.querySelector('.slider-button.prev');
      this.nextButton = document.querySelector('.slider-button.next');
      this.filterToggle = document.querySelector('.filter-toggle');
      this.filterPanel = document.querySelector('.filter-panel');
      this.filterOptions = document.querySelectorAll('.filter-option input');
      
      this.currentPage = 0;
      this.slidesPerPage = this.getSlidesPerPage();
      this.autoSlideInterval = null;
      this.observer = null;
      
      // Spotlight pagination
      this.slidesPerPage = 3; // Show 3 slides at a time
      this.currentPage = 0;
      this.spotlightPrevButton = document.querySelector('.spotlight-section .pagination-button.prev-page');
      this.spotlightNextButton = document.querySelector('.spotlight-section .pagination-button.next-page');
      this.spotlightCurrentPageSpan = document.querySelector('.spotlight-section .current-page');
      this.spotlightTotalPagesSpan = document.querySelector('.spotlight-section .total-pages');
      
      // Community projects pagination
      this.projectsPerPage = 25; // Show 25 projects per page
      this.currentProjectsPage = window.location.pathname.includes('projects-page-2.html') ? 2 : 1;
      this.communityPrevButton = document.querySelector('.community-section .pagination-button.prev-page');
      this.communityNextButton = document.querySelector('.community-section .pagination-button.next-page');
      this.communityCurrentPageSpan = document.querySelector('.community-section .current-page');
      this.communityTotalPagesSpan = document.querySelector('.community-section .total-pages');
      
      this.allProjects = [];
      
      this.init();
    }
  
    init() {
      this.setupEventListeners();
      this.setupIntersectionObserver();
      this.slides.forEach(slide => {
        slide.style.display = 'block';
        slide.classList.remove('active');
        slide.style.animation = '';
      });
      this.checkSuccessMessage();
      this.setupPagination();
      this.updateSpotlightPagination();
      this.updateCommunityPagination();
      this.updateProjectsPage();
  
      // Add event listener for always-visible clear filters button
      const clearBtn = document.querySelector('.cta-buttons .clear-filters');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.clearFilters());
      }
    }
  
    getSlidesPerPage() {
      return window.innerWidth > 1024 ? 3 : window.innerWidth > 768 ? 2 : 1;
    }
  
    setupEventListeners() {
      // Slider navigation
      this.prevButton?.addEventListener('click', () => {
        this.prevPage();
        this.stopAutoSlide();
      });
  
      this.nextButton?.addEventListener('click', () => {
        this.nextPage();
        this.stopAutoSlide();
      });
  
      // Filter toggle
      this.filterToggle?.addEventListener('click', () => {
        const isHidden = this.filterPanel.style.display === 'none' || this.filterPanel.style.display === '';
        this.filterPanel.style.display = isHidden ? 'block' : 'none';
        this.filterToggle.classList.toggle('active');
      });
  
      // Filter options
      this.filterOptions?.forEach(option => {
        option.addEventListener('change', () => this.updateVisibility());
      });
  
      // Window resize
      window.addEventListener('resize', () => {
        this.updateSlidesPerPage();
      });
  
      // Event delegation for project cards
      document.addEventListener('click', (e) => {
        const card = e.target.closest('.slide, .project-card');
        if (card) {
          this.handleCardClick(card);
        }
      });
    }
  
    setupIntersectionObserver() {
      const options = {
        threshold: 0.5,
        rootMargin: '50px'
      };
  
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            const target = parseInt(counter.dataset.target);
            this.animateCounter(counter, target);
            this.observer.unobserve(counter);
          }
        });
      }, options);
  
      document.querySelectorAll('.metric-value').forEach(counter => {
        this.observer.observe(counter);
      });
    }
  
    showPage(page) {
      const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
      this.currentPage = (page + totalPages) % totalPages;
  
      this.slides.forEach((slide, index) => {
        const slidePosition = index - (this.currentPage * this.slidesPerPage);
        
        if (slidePosition >= 0 && slidePosition < this.slidesPerPage) {
          slide.style.display = 'block';
          slide.classList.add('active');
          slide.style.animation = 'slideIn 0.5s forwards';
          slide.style.animationDelay = `${slidePosition * 0.1}s`;
        } else {
          slide.style.display = 'none';
          slide.classList.remove('active');
          slide.style.animation = '';
        }
      });
    }
  
    nextPage() {
      this.showPage(this.currentPage + 1);
    }
  
    prevPage() {
      this.showPage(this.currentPage - 1);
    }
  
    startAutoSlide() {
      this.stopAutoSlide();
      this.autoSlideInterval = setInterval(() => this.nextPage(), 5000);
    }
  
    stopAutoSlide() {
      if (this.autoSlideInterval) {
        clearInterval(this.autoSlideInterval);
      }
    }
  
    updateSlidesPerPage() {
      this.slidesPerPage = this.getSlidesPerPage();
      this.showPage(this.currentPage);
    }
  
    animateCounter(counter, target) {
      let current = 0;
      const duration = 2000;
      const step = (target / duration) * 16;
      
      counter.classList.add('animate-count');
      
      const updateCounter = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.round(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target;
        }
      };
      
      updateCounter();
    }
  
    updateVisibility() {
      const selectedFilters = this.getSelectedFilters();
      this.updateFilterCount(selectedFilters);
      this.filterProjects(selectedFilters);
    }
  
    getSelectedFilters() {
      const filters = {
        category: new Set(),
        type: new Set()
      };
  
      this.filterOptions.forEach(option => {
        if (option.checked) {
          filters[option.name].add(option.value);
        }
      });
  
      return filters;
    }
  
    updateFilterCount(selectedFilters) {
      const totalSelected = Object.values(selectedFilters)
        .reduce((sum, set) => sum + set.size, 0);
      const filterCount = document.querySelector('.filter-count');
      
      if (totalSelected > 0) {
        filterCount.textContent = `(${totalSelected})`;
        this.filterToggle.classList.add('has-filters');
      } else {
        filterCount.textContent = '';
        this.filterToggle.classList.remove('has-filters');
      }
    }
  
    async filterProjects(selectedFilters) {
      const hasCategoryFilters = selectedFilters.category && selectedFilters.category.size > 0;
      const hasTypeFilters = selectedFilters.type && selectedFilters.type.size > 0;
  
      if (!hasCategoryFilters && !hasTypeFilters) {
        renderProjects(this.allProjects);
        return;
      }
  
      let filtered = this.allProjects;
      if (hasCategoryFilters) {
        filtered = filtered.filter(project =>
          Array.from(selectedFilters.category).includes(project.category)
        );
      }
      if (hasTypeFilters) {
        filtered = filtered.filter(project =>
          Array.from(selectedFilters.type).includes(project.type)
        );
      }
      if (filtered.length === 1) {
        window.showPopup(filtered[0]);
      } else if (filtered.length > 1) {
        this.showMultipleProjectsPopupFromData(filtered);
      } else {
        renderProjects(filtered);
      }
    }
  
    showMultipleProjectsPopup(cards) {
      console.log('Popup called with projects:', cards);
      // Remove any existing filter popups
      document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
      // Create popup overlay
      const div = document.createElement('div');
      div.className = 'popup-overlay filter-popup';
      div.innerHTML = `
        <div class="project-popup" style="max-width:900px;overflow:auto;max-height:90vh;">
          <button class="close-button" style="font-size:2.5rem;line-height:2rem;width:2.5rem;height:2.5rem;top:1rem;right:1rem;position:absolute;z-index:10;background:none;border:none;cursor:pointer;">×</button>
          <div style="padding:1rem 1rem 0 1rem;text-align:center;">
            <h2>Matching Projects</h2>
          </div>
          <div class="popup-projects-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;padding:1.5rem;"></div>
        </div>
      `;
      document.body.prepend(div);
      // Render each matching card as a mini card in the popup
      const grid = div.querySelector('.popup-projects-grid');
      cards.forEach(card => {
        const miniCard = card.cloneNode(true);
        miniCard.classList.add('popup-mini-card');
        // Remove any event listeners from the clone
        miniCard.onclick = null;
        grid.appendChild(miniCard);
      });
      // Robust close button
      const closeBtn = div.querySelector('.close-button');
      if (closeBtn) {
        closeBtn.onclick = () => div.remove();
      } else {
        // Fallback: close on overlay click
        div.onclick = (e) => {
          if (e.target === div) div.remove();
        };
      }
    }
  
    showNoResultsPopup() {
      // Remove any existing filter popups
      document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
      // Create a simple popup
      const div = document.createElement('div');
      div.className = 'popup-overlay filter-popup';
      div.innerHTML = `
        <div class="project-popup">
          <button class="close-button">×</button>
          <div style="padding:2rem;text-align:center;">
            <h2>No projects found in the selected category.</h2>
            <button class="secondary-button clear-filters">
              Clear Filters <span class="button-icon">×</span>
            </button>
          </div>
        </div>
      `;
      document.body.prepend(div);
      div.querySelector('.close-button').onclick = () => div.remove();
      div.querySelector('.clear-filters').onclick = () => this.clearFilters();
    }
  
    showAllProjects() {
      this.projectCards.forEach(card => card.style.display = 'block');
      // Remove any filter popups
      document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
    }
  
    handleCardClick(card) {
      if (this.autoSlideInterval) {
        this.stopAutoSlide();
      }
      
      // Remove any existing popups first
      document.querySelectorAll('.popup-overlay').forEach(el => el.remove());
      
      const template = document.querySelector('#project-popup-template');
      const popup = template.content.cloneNode(true);
      
      this.populatePopupContent(popup, card);
      document.body.appendChild(popup);
      
      this.setupPopupClose(popup, card);
    }
  
    populatePopupContent(popup, card) {
      const title = card.querySelector('h3').textContent;
      const tags = Array.from(card.querySelectorAll('.project-tags .tag')).map(tag => tag.cloneNode(true));
      
      popup.querySelector('h2').textContent = title;
      popup.querySelector('.member-name').textContent = 'Project Lead';
      popup.querySelector('.member-role').textContent = 'Project Manager';
      
      const popupTags = popup.querySelector('.project-tags');
      popupTags.innerHTML = '';
      tags.forEach(tag => popupTags.appendChild(tag));
      
      // Hide contact details and activity log since we no longer have that data
      const contactDetails = popup.querySelector('.contact-details');
      if (contactDetails) {
        contactDetails.style.display = 'none';
      }
      
      const activityList = popup.querySelector('.activity-list');
      if (activityList) {
        activityList.style.display = 'none';
      }
    }
  
  
  
    setupPopupClose(popup, card) {
      const overlay = document.querySelector('.popup-overlay');
      const closeButton = overlay.querySelector('.close-button');
      
      if (overlay) {
        const closePopup = () => {
          overlay.remove();
          if (card.classList.contains('slide')) {
            this.startAutoSlide();
          }
        };
        
        // Add click handler for overlay background
        overlay.onclick = (e) => {
          if (e.target === overlay) {
            closePopup();
          }
        };
        
        // Add click handler for close button
        if (closeButton) {
          closeButton.onclick = (e) => {
            e.stopPropagation(); // Prevent event from bubbling to overlay
            closePopup();
          };
        }
      }
    }
  
    checkSuccessMessage() {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('status') === 'success') {
        const successMessage = document.getElementById('submission-success');
        successMessage.style.display = 'block';
        
        window.history.replaceState({}, document.title, window.location.pathname);
        
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 10000);
      }
    }
  
    setupPagination() {
      // Setup spotlight pagination
      if (this.spotlightPrevButton && this.spotlightNextButton) {
        this.spotlightPrevButton.addEventListener('click', () => {
          if (this.currentPage > 0) {
            this.currentPage--;
            this.showPage(this.currentPage);
            this.updateSpotlightPagination();
          }
        });
  
        this.spotlightNextButton.addEventListener('click', () => {
          const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
          if (this.currentPage < totalPages - 1) {
            this.currentPage++;
            this.showPage(this.currentPage);
            this.updateSpotlightPagination();
          }
        });
      }
  
      // Setup community projects pagination
      if (this.communityPrevButton && this.communityNextButton) {
        this.communityPrevButton.addEventListener('click', () => {
          if (this.currentProjectsPage === 2) {
            window.location.href = 'projects.html';
          }
        });
  
        this.communityNextButton.addEventListener('click', () => {
          if (this.currentProjectsPage === 1) {
            window.location.href = 'projects-page-2.html';
          }
        });
      }
    }
  
    updateProjectsPage() {
      const startIndex = (this.currentProjectsPage - 1) * this.projectsPerPage;
      const endIndex = startIndex + this.projectsPerPage;
  
      this.projectCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    }
  
    updateSpotlightPagination() {
      if (!this.spotlightCurrentPageSpan || !this.spotlightTotalPagesSpan) return;
  
      const totalPages = Math.ceil(this.slides.length / this.slidesPerPage);
      
      this.spotlightCurrentPageSpan.textContent = this.currentPage + 1;
      this.spotlightTotalPagesSpan.textContent = totalPages;
      
      if (this.spotlightPrevButton) {
        this.spotlightPrevButton.disabled = this.currentPage === 0;
        this.spotlightPrevButton.innerHTML = '<span class="button-icon">←</span> Previous';
      }
      
      if (this.spotlightNextButton) {
        this.spotlightNextButton.disabled = this.currentPage === totalPages - 1;
        this.spotlightNextButton.innerHTML = 'Next <span class="button-icon">→</span>';
      }
    }
  
    updateCommunityPagination() {
      if (!this.communityCurrentPageSpan || !this.communityTotalPagesSpan) return;
      
      this.communityCurrentPageSpan.textContent = this.currentProjectsPage;
      this.communityTotalPagesSpan.textContent = 2; // We have 2 pages total
      
      if (this.communityPrevButton) {
        this.communityPrevButton.disabled = this.currentProjectsPage === 1;
        if (this.currentProjectsPage === 2) {
          this.communityPrevButton.innerHTML = '<span class="button-icon">←</span> Back to Project Hub';
        } else {
          this.communityPrevButton.innerHTML = '<span class="button-icon">←</span> Previous';
        }
      }
      
      if (this.communityNextButton) {
        this.communityNextButton.disabled = this.currentProjectsPage === 2;
        if (this.currentProjectsPage === 1) {
          this.communityNextButton.innerHTML = 'View More Projects <span class="button-icon">→</span>';
        } else {
          this.communityNextButton.innerHTML = 'Next <span class="button-icon">→</span>';
        }
      }
    }
  
    clearFilters() {
      // Uncheck all filter checkboxes
      this.filterOptions.forEach(option => {
        option.checked = false;
      });
  
      // Reset filter count
      const filterCount = document.querySelector('.filter-count');
      if (filterCount) {
        filterCount.textContent = '';
      }
  
      // Remove has-filters class from filter toggle
      this.filterToggle.classList.remove('has-filters');
  
      // Hide filter panel
      if (this.filterPanel) {
        this.filterPanel.style.display = 'none';
      }
  
      // Show all projects
      this.showAllProjects();
  
      // Remove any filter popups
      document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
    }
  
    showMultipleProjectsPopupFromData(projects) {
      // Remove any existing filter popups
      document.querySelectorAll('.popup-overlay.filter-popup').forEach(el => el.remove());
      // Create popup overlay
      const div = document.createElement('div');
      div.className = 'popup-overlay filter-popup';
      div.innerHTML = `
        <div class="project-popup" style="max-width:900px;overflow:auto;max-height:90vh;">
          <button class="close-button" style="font-size:2.5rem;line-height:2rem;width:2.5rem;height:2.5rem;top:1rem;right:1rem;position:absolute;z-index:10;background:none;border:none;cursor:pointer;">×</button>
          <div style="padding:1rem 1rem 0 1rem;text-align:center;">
            <h2>Matching Projects</h2>
          </div>
          <div class="popup-projects-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;padding:1.5rem;"></div>
        </div>
      `;
      document.body.prepend(div);
      // Render each matching project as a mini card in the popup
      const grid = div.querySelector('.popup-projects-grid');
      projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card popup-mini-card';
        card.innerHTML = `
          <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-tags">
              <span class="tag tag-type">${project.type || ''}</span>
              ${project.categories && project.categories.length > 0 ? 
                project.categories.map(cat => `<span class="tag tag-category ${cat.replace(/\s+/g, '-').replace(/\//g, '-')}">${cat}</span>`).join('') :
                (project.category ? `<span class="tag tag-category">${project.category}</span>` : '')
              }
              ${project.openToPartnerships ? '<span class="tag tag-partnership">Open to Partnerships</span>' : ''}
            </div>
          </div>
          <p class="project-description">${limitTo70Words(project.description)}</p>
        `;
        card.onclick = () => window.showPopup(project);
        grid.appendChild(card);
      });
      // Robust close button
      const closeBtn = div.querySelector('.close-button');
      if (closeBtn) {
        closeBtn.onclick = () => div.remove();
      } else {
        // Fallback: close on overlay click
        div.onclick = (e) => {
          if (e.target === div) div.remove();
        };
      }
    }
  }
  
  // Initialize the page when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    const projectsPage = new ProjectsPage();
    const grid = document.querySelector('.projects-grid');
    const template = document.getElementById('project-card-template');
    let allProjects = [];
    let filteredProjects = [];
  
    // Fetch project data
    fetch('projects.json')
      .then(res => res.json())
      .then(data => {
        allProjects = data;
        filteredProjects = data;
        projectsPage.allProjects = data;
        renderProjects(filteredProjects);
      });
  
    // Helper to format event date
    function formatEventDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString('default', { month: 'short', day: 'numeric' });
    }
  
    // Helper to limit text to 70 words
    function limitTo70Words(text) {
      if (!text) return '';
      const words = text.trim().split(/\s+/);
      if (words.length <= 70) return text;
      return words.slice(0, 70).join(' ') + '...';
    }
  
  
  
    // Render projects
    async function renderProjects(projects, showPlaceholders = true) {
      // Keep the placeholder tiles at the top - store references before clearing
      const addYourOwnTile = grid.querySelector('.add-your-own-tile');
      const sampleProfileTile = grid.querySelector('.sample-profile');
      
      // Clear the grid
      grid.innerHTML = '';
      
      // Re-add the placeholder tiles first (only if showPlaceholders is true)
      if (showPlaceholders) {
        if (addYourOwnTile) {
          grid.appendChild(addYourOwnTile);
        } else {
          // Recreate add-your-own tile if it doesn't exist
          const addYourOwnHTML = `
            <div class="add-your-own-tile" onclick="window.location.href='join-community.html'">
              <span class="add-your-own-icon">˚୨୧⋆.˚</span>
              <h3 class="add-your-own-title">add your own</h3>
              <p class="add-your-own-subtitle">join ctrl and showcase your niche & venture to the community</p>
              <a href="join-community.html" class="add-your-own-button">
                + join ctrl
                <span class="arrow">→</span>
              </a>
            </div>
          `;
          grid.insertAdjacentHTML('beforeend', addYourOwnHTML);
        }
        
        if (sampleProfileTile) {
          grid.appendChild(sampleProfileTile);
        } else {
          // Recreate sample profile tile if it doesn't exist
          const sampleProfileHTML = `
            <div class="person-card sample-profile">
              <div class="project-header">
                <h3 class="project-title">john doe</h3>
                <div class="project-tags">
                  <div class="project-type-tag">Personal Profile</div>
                  <span class="tag tag-category">Technology</span>
                  <span class="tag">React</span>
                  <span class="tag">Node.js</span>
                  <span class="tag">Python</span>
                  <span class="tag">AWS</span>
                </div>
              </div>
              <p class="project-description">Full-stack developer passionate about building sustainable tech solutions that make a positive impact on communities.</p>
              <div class="our-niche-tile">
                <div class="niche-header">
                  <span class="niche-icon">☕️</span>
                  <span class="niche-title">Their Niche</span>
                </div>
                <div class="niche-content">Building tech solutions for social impact and environmental sustainability</div>
              </div>
              <div class="project-actions">
                <a href="mailto:alex@example.com" class="action-button apply-button">
                  <span>Connect</span>
                  <span class="arrow">→</span>
                </a>
              </div>
            </div>
          `;
          grid.insertAdjacentHTML('beforeend', sampleProfileHTML);
        }
      }
      
      // Separate events, products, persons and regular projects
      const events = projects.filter(p => p.isEvent);
      const products = projects.filter(p => p.isProduct);
      const persons = projects.filter(p => p.ventureType === 'person');
      const regularProjects = projects.filter(p => !p.isEvent && !p.isProduct && p.ventureType !== 'person');
      
      // Interleave events, products, persons and projects
      const maxLen = Math.max(events.length, products.length, persons.length, regularProjects.length);
      const eventTemplate = document.getElementById('event-tile-template');
      const personTemplate = document.getElementById('person-card-template');
      for (let i = 0; i < maxLen; i++) {
        if (i < regularProjects.length) {
          const project = regularProjects[i];
          const card = template.content.cloneNode(true).querySelector('.project-card');

          // Set QR code ID for favorites functionality
          const qrId = project.id || project.title || `qr-${i}`;
          card.setAttribute('data-qr-id', qrId);
          if (card.classList.contains('qr-card')) {
            card.dataset.qrId = qrId;
          }

          // Title
          card.querySelector('.project-title').textContent = project.title;
          
          // Project type tag and category tags
          const tags = card.querySelector('.project-tags');
          tags.innerHTML = '';
          
          // Add project type tag first
          if (project.type) {
            const typeTag = document.createElement('div');
            typeTag.className = `project-type-tag ${project.type.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-')}`;
            typeTag.textContent = project.type.charAt(0).toUpperCase() + project.type.slice(1);
            tags.appendChild(typeTag);
          }
          
          // Update favorite button with QR ID
          const favoriteBtn = card.querySelector('.favorite-btn');
          if (favoriteBtn) {
            favoriteBtn.dataset.qrId = qrId;
            favoriteBtn.onclick = () => authManager.toggleFavorite(qrId);
          }

          // Update QR code image if available
          const qrImage = card.querySelector('.qr-code-image');
          if (qrImage && project.qrCode) {
            qrImage.src = project.qrCode;
            qrImage.alt = `${project.title} QR Code`;
          } else if (qrImage && project.image) {
            qrImage.src = project.image;
            qrImage.alt = `${project.title} QR Code`;
          }
          
          // Add category tags - use categories array if available, otherwise fall back to single category
          const categoriesToShow = project.categories && project.categories.length > 0 ? project.categories : (project.category ? [project.category] : []);
          categoriesToShow.forEach(category => {
            const categoryClass = category.replace(/\s+/g, '-').replace(/\//g, '-');
            const categoryTag = document.createElement('span');
            categoryTag.className = `tag tag-category ${categoryClass}`;
            categoryTag.textContent = category;
            tags.appendChild(categoryTag);
          });
          
          // Add partnership tag if open to partnerships
          if (project.openToPartnerships) {
            const partnershipTag = document.createElement('span');
            partnershipTag.className = 'tag tag-partnership';
            partnershipTag.textContent = 'Open to Partnerships';
            tags.appendChild(partnershipTag);
          }
          
  
          
          card.querySelector('.project-description').textContent = limitTo70Words(project.description);
          
          // Our Niche section
          const nicheContent = card.querySelector('.niche-content');
          if (nicheContent) {
            // Use the niche field from the JSON if available, otherwise fall back to other fields
            let nicheValue = project.niche || '';
            if (!nicheValue) {
              if (project.stage && project.modality) {
                nicheValue = `${project.stage} • ${project.modality}`;
              } else if (project.stage) {
                nicheValue = project.stage;
              } else if (project.modality) {
                nicheValue = project.modality;
              } else if (project.team) {
                nicheValue = project.team;
              } else {
                nicheValue = 'Building the future';
              }
            }
            nicheContent.textContent = nicheValue;
          }
          
          // Action buttons
          const instagramBtn = card.querySelector('.instagram-button');
          const connectBtn = card.querySelector('.apply-button');
          
          // Hide Instagram button since we no longer have Instagram data
          if (instagramBtn) {
            instagramBtn.style.display = 'none';
          }
          
          if (connectBtn) {
            // Use connectionLink for the Connect button
            connectBtn.href = project.connectionLink || '#';
            connectBtn.target = '_blank';
          }
          
  
          
  
          card.dataset.title = project.title || '';
          card.dataset.type = project.type || '';
          card.dataset.category = project.category || '';
  
  
  
  
  
  
          card.dataset.description = project.description || '';
  
          card.dataset.niche = project.niche || '';
          card.dataset.connectionLink = project.connectionLink || '';
  
          // Assign masonry height class based on content length
          const descriptionLength = project.description ? project.description.length : 0;
          const nicheLength = project.niche ? project.niche.length : 0;
          const totalContentLength = descriptionLength + nicheLength;
          
          if (totalContentLength > 200) {
            card.classList.add('extra-tall');
          } else if (totalContentLength > 120) {
            card.classList.add('tall');
          } else if (totalContentLength > 60) {
            card.classList.add('medium');
          } else {
            card.classList.add('short');
          }
  
          card.addEventListener('click', () => projectsPage.handleCardClick(card));
          grid.appendChild(card);
        }
        if (i < persons.length) {
          const person = persons[i];
          const card = personTemplate.content.cloneNode(true).querySelector('.person-card');
  
          // Person name
          card.querySelector('.project-title').textContent = person.personName || person.title || 'Anonymous';
          
          // Person description
          card.querySelector('.project-description').textContent = person.personDescription || person.description || 'Professional with diverse interests';
          
          // Update the bookmark icon with person emoji
          const bookmarkIcon = card.querySelector('.bookmark-icon');
          if (bookmarkIcon && person.emoji) {
            bookmarkIcon.textContent = person.emoji;
          }
          
          // Person tags
          const tags = card.querySelector('.project-tags');
          tags.innerHTML = '';
          
          // Add person type tag
          const typeTag = document.createElement('div');
          typeTag.className = 'project-type-tag';
          typeTag.textContent = 'Personal Profile';
          tags.appendChild(typeTag);
          
          // Add category tags - use categories array if available, otherwise fall back to single category
          const categoriesToShow = person.categories && person.categories.length > 0 ? person.categories : (person.category ? [person.category] : []);
          categoriesToShow.forEach(category => {
            const categoryClass = category.replace(/\s+/g, '-').replace(/\//g, '-');
            const categoryTag = document.createElement('span');
            categoryTag.className = `tag tag-category ${categoryClass}`;
            categoryTag.textContent = category;
            tags.appendChild(categoryTag);
          });
          
          // Add skills as individual tags (max 4)
          if (person.personSkills) {
            const skills = person.personSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0).slice(0, 4);
            skills.forEach(skill => {
              const skillTag = document.createElement('span');
              skillTag.className = 'tag';
              skillTag.textContent = skill;
              tags.appendChild(skillTag);
            });
          }
          
          // Niche section
          const nicheContent = card.querySelector('.niche-content');
          if (nicheContent) {
            nicheContent.textContent = person.personNiche || person.niche || 'Building the future';
          }
          
          // Action buttons
          const connectBtn = card.querySelector('.apply-button');
          if (connectBtn) {
            connectBtn.href = person.connectionLink || person.link || '#';
            connectBtn.target = '_blank';
          }
          
          // Assign masonry height class based on content length
          const nicheLength = person.personNiche ? person.personNiche.length : 0;
          const descriptionLength = person.personDescription ? person.personDescription.length : 0;
          const totalContentLength = nicheLength + descriptionLength;
          
          if (totalContentLength > 200) {
            card.classList.add('extra-tall');
          } else if (totalContentLength > 120) {
            card.classList.add('tall');
          } else if (totalContentLength > 60) {
            card.classList.add('medium');
          } else {
            card.classList.add('short');
          }
  
          card.addEventListener('click', () => projectsPage.handleCardClick(card));
          grid.appendChild(card);
        }
        if (i < products.length) {
          const product = products[i];
          const card = document.createElement('div');
          card.className = 'project-card product-card';
          card.innerHTML = `
            <div class="project-header">
              <div class="business-name">${product.businessName}</div>
              <h3 class="project-title">${product.title}</h3>
              <div class="project-tags">
                <span class="tag tag-type">${product.type}</span>
                <span class="tag tag-category">${product.category}</span>
                <span class="tag tag-price">${product.productPrice}</span>
              </div>
            </div>
            <p class="project-description">${limitTo70Words(product.description)}</p>
            <a href="${product.website}" class="view-product-button" target="_blank">
              View Product
              <span class="button-icon">→</span>
            </a>
          `;
          
          // Assign masonry height class for product cards
          const productContentLength = product.description ? product.description.length : 0;
          if (productContentLength > 150) {
            card.classList.add('tall');
          } else if (productContentLength > 80) {
            card.classList.add('medium');
          } else {
            card.classList.add('short');
          }
          
          grid.appendChild(card);
        }
        if (i < events.length) {
          const event = events[i];
          const tile = eventTemplate.content.cloneNode(true).querySelector('.event-tile');
          tile.querySelector('.event-tile-date').textContent = formatEventDate(event.date);
          tile.querySelector('.event-tile-title').textContent = event.title;
          tile.querySelector('.event-tile-desc').textContent = limitTo70Words(event.description);
          if (event.category) {
            tile.querySelector('.event-tile-category').textContent = event.category;
          } else {
            tile.querySelector('.event-tile-category').style.display = 'none';
          }
          tile.style.background = event.color || '#f6f8fc';
          tile.style.color = event.textColor || '#333';
          tile.style.cursor = 'pointer';
          
          // Assign masonry height class for event tiles
          const eventContentLength = event.description ? event.description.length : 0;
          if (eventContentLength > 120) {
            tile.classList.add('tall');
          } else if (eventContentLength > 60) {
            tile.classList.add('medium');
          } else {
            tile.classList.add('short');
          }
          
          if (event.link) {
            tile.onclick = () => window.open(event.link, '_blank');
          }
          grid.appendChild(tile);
        }
      }
      // If no results at all
      if (events.length === 0 && products.length === 0 && regularProjects.length === 0) {
        const msg = document.createElement('div');
        msg.textContent = 'no results :( add your own!';
        msg.style.color = '#888';
        msg.style.margin = '2rem 0';
        grid.appendChild(msg);
      }
      
      // Update favorite buttons after rendering
      if (window.authManager) {
        setTimeout(() => window.authManager.updateFavoriteButtons(), 300);
      }
    }
  
    // Popup logic
    function showPopup(project) {
      // Remove any existing popups first
      document.querySelectorAll('.popup-overlay').forEach(el => el.remove());
      
      const template = document.getElementById('project-popup-template');
      const popup = template.content.cloneNode(true);
      popup.querySelector('h2').textContent = project.title;
      const tags = popup.querySelector('.project-tags');
      tags.innerHTML = '';
      if (project.type) tags.innerHTML += `<span class="tag tag-type">${project.type}</span>`;
      
      // Add category tags - use categories array if available, otherwise fall back to single category
      const categoriesToShow = project.categories && project.categories.length > 0 ? project.categories : (project.category ? [project.category] : []);
      categoriesToShow.forEach(category => {
        const categoryClass = category.replace(/\s+/g, '-').replace(/\//g, '-');
        tags.innerHTML += `<span class="tag tag-category ${categoryClass}">${category}</span>`;
      });
      
      if (project.openToPartnerships) tags.innerHTML += `<span class="tag tag-partnership">Open to Partnerships</span>`;
      
      // Add connection link button if present
      if (project.connectionLink) {
        const btn = document.createElement('a');
        btn.href = project.connectionLink;
        btn.target = '_blank';
        btn.className = 'primary-button';
        btn.style.margin = '1rem 0 0 0';
        btn.innerHTML = 'Connect →';
        tags.parentNode.insertBefore(btn, tags.nextSibling);
      }
      
      // Set placeholder text for member info since we no longer have lead details
      popup.querySelector('.member-name').textContent = 'Project Lead';
      popup.querySelector('.member-role').textContent = 'Project Manager';
      // Hide contact details since we no longer have lead information
      const contactDetails = popup.querySelector('.contact-details');
      if (contactDetails) {
        contactDetails.style.display = 'none';
      }
  
      // Hide activity log section since we no longer have that data
      const activityList = popup.querySelector('.activity-list');
      if (activityList) {
        activityList.style.display = 'none';
      }
  
      document.body.appendChild(popup);
      
      const overlay = document.querySelector('.popup-overlay');
      const closeButton = overlay.querySelector('.close-button');
      
      const closePopup = () => {
        overlay.remove();
      };
      
      // Add click handler for overlay background
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          closePopup();
        }
      };
      
      // Add click handler for close button
      if (closeButton) {
        closeButton.onclick = (e) => {
          e.stopPropagation(); // Prevent event from bubbling to overlay
          closePopup();
        };
      }
    }
  
    window.showPopup = showPopup;
    window.projectsPage = projectsPage;
    window.renderProjects = renderProjects;
  }); 
