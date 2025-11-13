// QRtists Authentication System with Supabase
// Note: You'll need to set your Supabase URL and anon key below

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Replace with your Supabase project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Supabase anon key

// Initialize Supabase client
let supabase;
if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Auth Manager
const authManager = {
  currentUser: null,
  currentModal: null,

  // Initialize auth state
  init() {
    this.createAuthModal(); // Create modal on initialization
    this.checkAuthState();
    this.setupAuthModal();
  },

  // Check if user is already logged in
  async checkAuthState() {
    // Check Supabase first
    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          this.currentUser = session.user;
          this.updateUI();
          await this.loadUserFavorites();
          return;
        }
      } catch (error) {
        console.error('Error checking Supabase auth state:', error);
      }

      // Listen for Supabase auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          this.currentUser = session.user;
          this.updateUI();
          this.loadUserFavorites();
        } else {
          this.currentUser = null;
          this.updateUI();
          this.clearFavorites();
        }
      });
    }

    // Check Firebase auth state
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // Convert Firebase user to a format compatible with our system
          this.currentUser = {
            id: user.uid,
            email: user.email,
            user_metadata: {
              username: user.displayName || user.email?.split('@')[0] || 'User'
            }
          };
          this.updateUI();
          this.loadUserFavorites();
        } else {
          // Only clear if Supabase user is also not set
          if (!this.currentUser || !supabase) {
            this.currentUser = null;
            this.updateUI();
            this.clearFavorites();
          }
        }
      });
    }
  },

  // Show auth modal
  showAuthModal(mode = 'login') {
    console.log('showAuthModal called with mode:', mode);
    
    // Ensure modal exists
    let modal = document.getElementById('authModal');
    if (!modal) {
      console.log('Modal not found, creating...');
      this.createAuthModal();
      modal = document.getElementById('authModal');
    }
    
    if (!modal) {
      console.error('Failed to create auth modal');
      alert('Unable to open sign-in modal. Please refresh the page.');
      return;
    }
    
    console.log('Showing modal');
    modal.style.display = 'flex';
    this.currentModal = mode;
    this.switchTab(mode);
    document.body.style.overflow = 'hidden';
    
    // Ensure modal is visible
    setTimeout(() => {
      if (modal && modal.style.display !== 'flex') {
        modal.style.display = 'flex';
      }
    }, 50);
  },

  // Hide auth modal
  hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
    this.clearMessages();
  },

  // Create auth modal HTML
  createAuthModal() {
    // Don't create if it already exists
    const existingModal = document.getElementById('authModal');
    if (existingModal) {
      console.log('Modal already exists');
      return;
    }
    
    console.log('Creating auth modal');
    const modalHTML = `
      <div id="authModal" class="auth-modal" style="display: none;">
        <div class="auth-modal-content">
          <button class="auth-close-btn" onclick="authManager.hideAuthModal()">&times;</button>
          
          <div class="auth-header">
            <div class="auth-header-icon">🎨</div>
            <h2 id="authModalTitle">Sign in</h2>
            <p id="authModalSubtitle">Enter details below</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" onclick="authManager.switchTab('login')">Sign In</button>
            <button class="auth-tab" onclick="authManager.switchTab('signup')">Sign Up</button>
          </div>

          <div id="authMessage" class="auth-message" style="display: none;"></div>

          <!-- Sign In Form -->
          <form id="loginForm" class="auth-form" onsubmit="authManager.handleLogin(event)">
            <div class="form-group">
              <label for="loginEmail">Email</label>
              <div class="form-input-wrapper">
                <svg class="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" id="loginEmail" name="email" placeholder="Enter your email" required autocomplete="email">
              </div>
            </div>
            <div class="form-group">
              <label for="loginPassword">Password</label>
              <div class="form-input-wrapper">
                <svg class="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input type="password" id="loginPassword" name="password" placeholder="Enter your password" required autocomplete="current-password">
              </div>
            </div>
            <button type="submit" class="auth-submit-btn">Sign In</button>
          </form>

          <!-- Sign Up Form -->
          <form id="signupForm" class="auth-form" style="display: none;" onsubmit="authManager.handleSignup(event)">
            <div class="form-group">
              <label for="signupUsername">Username</label>
              <div class="form-input-wrapper">
                <svg class="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input type="text" id="signupUsername" name="username" placeholder="Choose a username" required autocomplete="username">
              </div>
            </div>
            <div class="form-group">
              <label for="signupEmail">Email</label>
              <div class="form-input-wrapper">
                <svg class="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <input type="email" id="signupEmail" name="email" placeholder="Enter your email" required autocomplete="email">
              </div>
            </div>
            <div class="form-group">
              <label for="signupPassword">Password</label>
              <div class="form-input-wrapper">
                <svg class="form-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input type="password" id="signupPassword" name="password" placeholder="Create a password (min. 6 characters)" required autocomplete="new-password" minlength="6">
              </div>
            </div>
            <button type="submit" class="auth-submit-btn">Create Account</button>
          </form>

          <div class="auth-divider">
            <span>or</span>
          </div>

          <button class="auth-google-btn" onclick="authManager.handleGoogleAuth()">
            <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.965-2.184l-2.908-2.258c-.806.54-1.837.86-3.057.86-2.35 0-4.34-1.587-5.053-3.72H.957v2.331C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.954 10.698c-.18-.54-.282-1.117-.282-1.698s.102-1.158.282-1.698V4.971H.957C.348 6.175 0 7.55 0 9s.348 2.825.957 4.029l2.997-2.331z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.971L3.954 7.302C4.667 5.167 6.657 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div class="auth-footer">
            <p id="authFooterText">Don't have an account? <a href="#" onclick="authManager.switchTab('signup'); return false;">Sign up</a></p>
          </div>
        </div>
      </div>
    `;
    
    try {
      if (!document.body) {
        console.error('Document body not ready');
        // Wait for body to be ready
        setTimeout(() => {
          if (document.body) {
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            console.log('Modal inserted after wait');
          }
        }, 100);
        return;
      }
      
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Ensure the modal was created
      const createdModal = document.getElementById('authModal');
      if (!createdModal) {
        console.error('Failed to insert auth modal into DOM');
      } else {
        console.log('Auth modal created successfully');
      }
    } catch (error) {
      console.error('Error creating auth modal:', error);
    }
  },

  // Setup auth modal event listeners
  setupAuthModal() {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('authModal');
      if (e.target === modal) {
        this.hideAuthModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAuthModal();
      }
    });
  },

  // Switch between login and signup tabs
  switchTab(mode) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const loginTab = document.querySelector('.auth-tab[onclick*="login"]');
    const signupTab = document.querySelector('.auth-tab[onclick*="signup"]');
    const footerText = document.getElementById('authFooterText');
    const modalTitle = document.getElementById('authModalTitle');
    const modalSubtitle = document.getElementById('authModalSubtitle');

    if (mode === 'login') {
      if (loginForm) loginForm.style.display = 'flex';
      if (signupForm) signupForm.style.display = 'none';
      if (loginTab) loginTab.classList.add('active');
      if (signupTab) signupTab.classList.remove('active');
      if (modalTitle) modalTitle.textContent = 'Sign in';
      if (modalSubtitle) modalSubtitle.textContent = 'Enter details below';
      if (footerText) footerText.innerHTML = 'Don\'t have an account? <a href="#" onclick="authManager.switchTab(\'signup\'); return false;">Sign up</a>';
    } else {
      if (loginForm) loginForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'flex';
      if (loginTab) loginTab.classList.remove('active');
      if (signupTab) signupTab.classList.add('active');
      if (modalTitle) modalTitle.textContent = 'Sign up';
      if (modalSubtitle) modalSubtitle.textContent = 'Create your account';
      if (footerText) footerText.innerHTML = 'Already have an account? <a href="#" onclick="authManager.switchTab(\'login\'); return false;">Sign in</a>';
    }
    
    this.clearMessages();
  },

  // Handle login
  async handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    // Try Firebase first if available
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Convert Firebase user to compatible format
        this.currentUser = {
          id: user.uid,
          email: user.email,
          user_metadata: {
            username: user.displayName || user.email?.split('@')[0] || 'User'
          }
        };
        
        this.updateUI();
        this.hideAuthModal();
        this.showNotification('Successfully signed in!', 'success');
        await this.loadUserFavorites();
        return;
      } catch (error) {
        // If Firebase fails, try Supabase
        console.log('Firebase login failed, trying Supabase:', error);
      }
    }

    // Try Supabase if Firebase is not available or failed
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        this.currentUser = data.user;
        this.updateUI();
        this.hideAuthModal();
        this.showNotification('Successfully signed in!', 'success');
        await this.loadUserFavorites();
      } catch (error) {
        this.showMessage(error.message || 'Failed to sign in. Please check your credentials.', 'error');
      }
    } else {
      this.showMessage('Authentication is not configured. Please set up Firebase or Supabase.', 'error');
    }
  },

  // Handle signup
  async handleSignup(event) {
    event.preventDefault();

    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Try Firebase first if available
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update display name
        await user.updateProfile({
          displayName: username
        });
        
        // Convert Firebase user to compatible format
        this.currentUser = {
          id: user.uid,
          email: user.email,
          user_metadata: {
            username: username
          }
        };
        
        this.updateUI();
        this.hideAuthModal();
        this.showNotification('Account created successfully!', 'success');
        await this.loadUserFavorites();
        return;
      } catch (error) {
        // If Firebase fails, try Supabase
        console.log('Firebase signup failed, trying Supabase:', error);
      }
    }

    // Try Supabase if Firebase is not available or failed
    if (supabase) {
      try {
        // Sign up with email and password
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });

        if (error) throw error;

        // Create user profile in database
        if (data.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: data.user.id,
                username: username,
                email: email
              }
            ]);

          if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
            console.error('Error creating profile:', profileError);
          }
        }

        this.showMessage('Account created! Please check your email to verify your account.', 'success');
        setTimeout(() => {
          this.switchTab('login');
        }, 2000);
      } catch (error) {
        this.showMessage(error.message || 'Failed to create account. Please try again.', 'error');
      }
    } else {
      this.showMessage('Authentication is not configured. Please set up Firebase or Supabase.', 'error');
    }
  },

  // Handle Google authentication
  async handleGoogleAuth() {
    if (!supabase) {
      this.showMessage('Authentication is not configured. Please set your Supabase credentials.', 'error');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      this.showMessage(error.message || 'Failed to sign in with Google.', 'error');
    }
  },

  // Sign out
  async signOut() {
    try {
      // Close user menu dropdown
      const userDropdown = document.querySelector('.user-dropdown');
      if (userDropdown) {
        userDropdown.classList.remove('show');
      }

      // Sign out from Supabase if available
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }

      // Sign out from Firebase if available
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
      }

      // Clear user data
      this.currentUser = null;
      this.clearFavorites();
      
      // Update UI
      this.updateUI();
      
      // Show success notification
      this.showNotification('Successfully signed out!', 'success');
      
      // Optionally redirect to home page after a short delay
      setTimeout(() => {
        // Only redirect if we're not already on the home page
        const currentPath = window.location.pathname;
        if (currentPath !== '/index.html' && currentPath !== '/' && !currentPath.endsWith('index.html')) {
          window.location.href = 'index.html';
        }
      }, 1500);
      
    } catch (error) {
      console.error('Sign out error:', error);
      this.showNotification('Failed to sign out. Please try again.', 'error');
    }
  },

  // Update UI based on auth state
  updateUI() {
    const authButtons = document.querySelectorAll('.auth-button');
    const userMenus = document.querySelectorAll('.user-menu');
    const logoutButtons = document.querySelectorAll('.logout-button');
    const userNameSpans = document.querySelectorAll('.user-name');

    if (this.currentUser) {
      // Show user menu and logout button, hide auth button
      authButtons.forEach(btn => btn.style.display = 'none');
      userMenus.forEach(menu => menu.style.display = 'block');
      logoutButtons.forEach(btn => btn.style.display = 'inline-flex');
      
      // Update username
      const username = this.currentUser.user_metadata?.username || 
                       this.currentUser.email?.split('@')[0] || 
                       'User';
      userNameSpans.forEach(span => span.textContent = username);
    } else {
      // Show auth button, hide user menu and logout button
      authButtons.forEach(btn => btn.style.display = 'block');
      userMenus.forEach(menu => menu.style.display = 'none');
      logoutButtons.forEach(btn => btn.style.display = 'none');
    }
  },

  // Show message (for auth modal)
  showMessage(message, type = 'info') {
    const messageEl = document.getElementById('authMessage');
    if (!messageEl) return;

    messageEl.textContent = message;
    messageEl.className = `auth-message auth-message-${type}`;
    messageEl.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        this.clearMessages();
      }, 3000);
    }
  },

  // Show notification (for general notifications outside modal)
  showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotification = document.getElementById('authNotification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'authNotification';
    notification.className = `auth-notification auth-notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-family: Arial, sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      z-index: 10000;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
    `;

    // Set colors based on type
    if (type === 'success') {
      notification.style.background = '#d4edda';
      notification.style.color = '#155724';
      notification.style.border = '1px solid #c3e6cb';
    } else if (type === 'error') {
      notification.style.background = '#f8d7da';
      notification.style.color = '#721c24';
      notification.style.border = '1px solid #f5c6cb';
    } else {
      notification.style.background = '#d1ecf1';
      notification.style.color = '#0c5460';
      notification.style.border = '1px solid #bee5eb';
    }

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    if (!document.getElementById('authNotificationStyles')) {
      style.id = 'authNotificationStyles';
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  },

  // Clear messages
  clearMessages() {
    const messageEl = document.getElementById('authMessage');
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }
  },

  // Favorites Management
  favorites: new Set(),

  // Load user favorites from database
  async loadUserFavorites() {
    if (!supabase || !this.currentUser) {
      this.favorites.clear();
      this.updateFavoriteButtons();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('qr_code_id')
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      this.favorites.clear();
      if (data) {
        data.forEach(item => this.favorites.add(item.qr_code_id));
      }
      this.updateFavoriteButtons();
      
      // Also update after a short delay to catch dynamically rendered cards
      setTimeout(() => this.updateFavoriteButtons(), 500);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  },

  // Toggle favorite
  async toggleFavorite(qrCodeId) {
    if (!this.currentUser) {
      this.showAuthModal('login');
      return;
    }

    if (!supabase) {
      alert('Favorites feature requires Supabase configuration.');
      return;
    }

    const isFavorite = this.favorites.has(qrCodeId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', this.currentUser.id)
          .eq('qr_code_id', qrCodeId);

        if (error) throw error;
        this.favorites.delete(qrCodeId);
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorites')
          .insert([
            {
              user_id: this.currentUser.id,
              qr_code_id: qrCodeId
            }
          ]);

        if (error) throw error;
        this.favorites.add(qrCodeId);
      }

      this.updateFavoriteButtons();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    }
  },

  // Check if QR code is favorited
  isFavorite(qrCodeId) {
    return this.favorites.has(qrCodeId);
  },

  // Update favorite buttons on page
  updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const qrCodeId = btn.dataset.qrId;
      if (qrCodeId) {
        const isFav = this.isFavorite(qrCodeId);
        btn.classList.toggle('active', isFav);
        btn.querySelector('.favorite-icon')?.setAttribute('fill', isFav ? 'currentColor' : 'none');
      }
    });
  },

  // Clear favorites
  clearFavorites() {
    this.favorites.clear();
    this.updateFavoriteButtons();
  },

  // Get all favorites
  getFavorites() {
    return Array.from(this.favorites);
  }
};

// Make authManager globally accessible
window.authManager = authManager;

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => authManager.init());
} else {
  authManager.init();
}

