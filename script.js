/**
 * DecodeLabs Internship Portal - Dynamic State Management & SPA Routing
 * Full-Stack Vanilla ES6 Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  const BACKEND_API_URL = 'http://127.0.0.1:5000/api/tasks';
  const BACKEND_HEALTH_URL = 'http://127.0.0.1:5000/api/health';

  // --- BACKUP STATIC ROADMAP STATE (LocalStorage Fallback) ---
  const backupTasks = [
    {
      id: 1,
      title: "Semantic Scaffolding",
      category: "architecture",
      status: "completed",
      progress: 100,
      desc: "Constructing a standard document with appropriate HTML5 landmark elements for SEO and WCAG compatibility.",
      deliverables: "Validated HTML5 structure with zero semantic structural errors.",
      timeline: "Sprint 1 (Completed)",
      spec: [
        "Implementation of core regions: <header>, <nav>, <aside>, <main>, <footer>",
        "Ensured nesting hierarchy is grammatically correct and meaningful",
        "Wired skip-to-content links for accessibility compliance",
        "Avoided generic container layouts where semantic markers apply"
      ]
    },
    {
      id: 2,
      title: "Responsive CSS Grid",
      category: "architecture",
      status: "completed",
      progress: 100,
      desc: "Establishing a strict 2D macro grid layout for viewport transitions, maintaining header and footer alignment.",
      deliverables: "Grid areas declaration with clean responsiveness.",
      timeline: "Sprint 1 (Completed)",
      spec: [
        "Defined grid template areas for header, sidebar, main, and footer",
        "Created mobile-first layout transforming from 1-column to 2-columns",
        "Applied grid template columns mapping for collapsed and expanded views",
        "Leveraged CSS alignment properties to avoid spacer wrapper elements"
      ]
    },
    {
      id: 3,
      title: "Fluid Typography",
      category: "architecture",
      status: "in-progress",
      progress: 60,
      desc: "Leveraging the clamp function to auto-scale fonts smoothly between viewport ranges, replacing hard media rules.",
      deliverables: "Fluid sizing variables mapped across standard headers.",
      timeline: "Sprint 2 (Active)",
      spec: [
        "Calculated minimum and maximum boundaries for headers using clamp()",
        "Integrated viewport relative units (vw) into responsive calculations",
        "Created structured typography hierarchy with consistent line heights",
        "Validated resizing behavior to ensure scale remains within design constraints"
      ]
    },
    {
      id: 4,
      title: "Off-canvas Drawer",
      category: "interactivity",
      status: "completed",
      progress: 100,
      desc: "Developing a clean off-canvas drawer transition for small screens using responsive toggles and focus traps.",
      deliverables: "Interactive sidebar navigation with responsive toggle trigger.",
      timeline: "Sprint 2 (Completed)",
      spec: [
        "Configured CSS transition mappings using hardware-accelerated transforms",
        "Implemented aria-expanded toggles and screen reader state visibility",
        "Prevented layout focus leaks when navigation drawer is collapsed",
        "Created click-away overlay behavior mapping for better UX"
      ]
    },
    {
      id: 5,
      title: "Warmth Theme",
      category: "polish",
      status: "in-progress",
      progress: 40,
      desc: "Refining contrast tokens for light and dark modes, mapping variables to HSL grounding tones.",
      deliverables: "CSS custom properties mapping with dark theme class modifiers.",
      timeline: "Sprint 3 (Upcoming)",
      spec: [
        "Configured custom properties variables for background, text, and border",
        "Selected soft contrast palette: Mocha Mousse, Ethereal Blue, Moonlit Grey",
        "Optimized contrast ratios for text accessibility (WCAG AA standard)",
        "Added localStorage listeners to preserve selected theme across page views"
      ]
    },
    {
      id: 6,
      title: "UI State Filters",
      category: "interactivity",
      status: "pending",
      progress: 0,
      desc: "Binding JS click events to filter grid cards via category parameters, managing layout state reflows.",
      deliverables: "Dynamic state updates and filter selectors active.",
      timeline: "Sprint 3 (Planning)",
      spec: [
        "Created categories mapping: Architecture, Interactivity, Aesthetic Polish",
        "Constructed filter triggers using tablist attributes",
        "Toggled DOM element visibility classes dynamically using target attributes",
        "Optimized rendering updates to prevent layout shifts during shifts"
      ]
    }
  ];

  // --- STATE VARIABLES ---
  let tasksData = [];
  let notifications = [
    { id: 1, title: 'Portal Redesign Active 🎨', desc: 'Welcome to your premium, colorful, and fully functional internship portal.', time: 'Just now', unread: true },
    { id: 2, title: 'REST API Sync Active 🔌', desc: 'Syncing internship roadmap tasks with Node.js local API server.', time: '2 minutes ago', unread: true },
    { id: 3, title: 'Accessibility Standard AA 🌐', desc: 'Portal meets color contrast WCAG guidelines for optimal reading.', time: '1 hour ago', unread: false }
  ];
  let currentPreset = 'mocha';
  let activeCategory = 'all';
  let searchTerm = '';
  let deleteTargetId = null;
  let isOffline = false;

  // --- SELECTORS ---
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle');
  const appSidebar = document.getElementById('app-sidebar');
  const liveDateSpan = document.getElementById('live-date');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tasksGrid = document.getElementById('tasks-grid');
  const taskSearchInput = document.getElementById('task-search-input');
  
  // Stats Selectors
  const statProgressVal = document.getElementById('stat-progress');
  const statProgressFill = document.querySelector('.stat-card:nth-child(1) .progress-fill');
  const statCompletedVal = document.getElementById('stat-completed');
  const statCompletedFill = document.querySelector('.stat-card:nth-child(2) .progress-fill');
  const statHoursVal = document.getElementById('stat-hours');
  const statHoursFill = document.querySelector('.stat-card:nth-child(3) .progress-fill');

  // Modals Selectors
  const detailModal = document.getElementById('detail-modal');
  const editTaskForm = document.getElementById('edit-task-form');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const modalDeleteBtn = document.getElementById('modal-delete-btn');
  const modalBackdrop = document.getElementById('modal-close-backdrop');
  
  const addTaskModal = document.getElementById('add-task-modal');
  const addTaskForm = document.getElementById('add-task-form');
  const btnAddTaskTrigger = document.getElementById('btn-add-task');
  const addModalCloseBtn = document.getElementById('add-modal-close-btn');
  const addModalCancelBtn = document.getElementById('add-modal-cancel-btn');
  const addModalBackdrop = document.getElementById('add-modal-close-backdrop');
  const addProgressInput = document.getElementById('add-progress');
  const addProgressValSpan = document.getElementById('add-progress-val');

  const deleteConfirmModal = document.getElementById('delete-confirm-modal');
  const deleteModalCloseBtn = document.getElementById('delete-modal-close-btn');
  const deleteModalCancelBtn = document.getElementById('delete-modal-cancel-btn');
  const deleteModalConfirmBtn = document.getElementById('delete-modal-confirm-btn');
  const deleteModalBackdrop = document.getElementById('delete-modal-close-backdrop');
  const deleteConfirmTitleSpan = document.getElementById('delete-task-title-confirm');

  // Dropdowns Selectors
  const notificationToggle = document.getElementById('notification-toggle');
  const notificationsDropdown = document.getElementById('notifications-dropdown');
  const notificationsList = document.getElementById('notifications-list');
  const notificationBadge = document.getElementById('notification-badge');
  const markAllReadBtn = document.getElementById('mark-all-read');

  const profileToggle = document.getElementById('profile-toggle');
  const profileDropdown = document.getElementById('profile-dropdown');
  const btnAvailability = document.getElementById('btn-availability');
  const btnLogout = document.getElementById('btn-logout');
  const linkProfileSettings = document.getElementById('link-profile-settings');

  // Settings Selectors
  const profileSettingsForm = document.getElementById('profile-settings-form');
  const inputProfileName = document.getElementById('input-profile-name');
  const inputProfileRole = document.getElementById('input-profile-role');
  const btnRefreshDiagnostics = document.getElementById('btn-refresh-diagnostics');
  const themeSelectorBtns = document.querySelectorAll('.theme-selector-btn');

  let lastFocusedElement = null;

  // --- SPA VIEW ROUTING MANAGEMENT ---
  const switchView = (targetHash) => {
    // Valid target hashes: '#overview' (Dashboard), '#tasks', '#metrics', '#settings'
    const views = {
      '#overview': ['.dashboard-hero', '.stats-container', '#tasks'],
      '#tasks': ['#tasks'],
      '#metrics': ['#metrics'],
      '#settings': ['#settings']
    };

    const activeSelectors = views[targetHash] || views['#overview'];

    // Hide all view landmarks
    document.querySelectorAll('.dashboard-section, .stats-container, .dashboard-hero').forEach(el => {
      el.classList.remove('active');
    });

    // Show matching landmarks
    activeSelectors.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) el.classList.add('active');
    });

    // Sync Active Sidebar Link styles
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === targetHash) {
        link.classList.add('active');
      }
    });

    // Close mobile drawer on route trigger
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  // Wire sidebar navigation click handlers
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHash = link.getAttribute('href');
      if (targetHash.startsWith('#')) {
        e.preventDefault();
        switchView(targetHash);
        window.history.pushState(null, null, targetHash);
      }
    });
  });

  // Wire profile dropdown edit links
  if (linkProfileSettings) {
    linkProfileSettings.addEventListener('click', (e) => {
      e.preventDefault();
      switchView('#settings');
      window.history.pushState(null, null, '#settings');
      profileDropdown.classList.remove('active');
    });
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const activeHash = ['#overview', '#tasks', '#metrics', '#settings'].includes(location.hash) ? location.hash : '#overview';
    switchView(activeHash);
  });

  // --- THEME & COLOR PRESET CONTROLLERS ---
  const initTheme = () => {
    // Load Dark/Light mode
    const savedTheme = localStorage.getItem('decode-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);

    // Load Color Preset theme
    const savedPreset = localStorage.getItem('decode-preset') || 'mocha';
    setThemePreset(savedPreset);
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('decode-theme', theme);

    const moonIcon = themeToggleBtn.querySelector('.icon-moon');
    const sunIcon = themeToggleBtn.querySelector('.icon-sun');

    if (theme === 'dark') {
      moonIcon.style.display = 'none';
      sunIcon.style.display = 'block';
      themeToggleBtn.setAttribute('aria-label', 'Switch to warm light theme');
    } else {
      moonIcon.style.display = 'block';
      sunIcon.style.display = 'none';
      themeToggleBtn.setAttribute('aria-label', 'Switch to warm dark theme');
    }
  };

  const setThemePreset = (presetName) => {
    currentPreset = presetName;
    document.documentElement.setAttribute('data-theme-preset', presetName);
    localStorage.setItem('decode-preset', presetName);

    // Sync button UI states in settings tab
    themeSelectorBtns.forEach(btn => {
      if (btn.dataset.themeName === presetName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Push notification alert about color changes
    pushNotification(
      'Theme Preset Repainted 🎨',
      `Interface color scheme switched to ${presetName.toUpperCase()} dashboard theme.`
    );
  };

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });

  themeSelectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setThemePreset(btn.dataset.themeName);
    });
  });

  // --- MOBILE SIDEBAR DRAWER LOGIC ---
  const toggleSidebar = () => {
    const isOpen = body.classList.toggle('sidebar-open');
    sidebarToggleBtn.setAttribute('aria-expanded', isOpen);

    const menuIcon = sidebarToggleBtn.querySelector('.icon-menu');
    const closeIcon = sidebarToggleBtn.querySelector('.icon-close');

    if (isOpen) {
      menuIcon.style.display = 'none';
      closeIcon.style.display = 'block';
    } else {
      menuIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
  };

  const closeSidebar = () => {
    if (body.classList.contains('sidebar-open')) {
      body.classList.remove('sidebar-open');
      sidebarToggleBtn.setAttribute('aria-expanded', 'false');
      sidebarToggleBtn.querySelector('.icon-menu').style.display = 'block';
      sidebarToggleBtn.querySelector('.icon-close').style.display = 'none';
    }
  };

  sidebarToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSidebar();
  });

  document.addEventListener('click', (event) => {
    if (body.classList.contains('sidebar-open') && 
        !appSidebar.contains(event.target) && 
        !sidebarToggleBtn.contains(event.target)) {
      closeSidebar();
    }
  });

  // --- DATE RENDERER ---
  const renderLiveDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    liveDateSpan.textContent = today.toLocaleDateString('en-US', options);
  };

  // --- PROFILE LOGIC ---
  const initProfile = () => {
    const name = localStorage.getItem('profile-name') || 'Muhammad Danyal';
    const role = localStorage.getItem('profile-role') || 'Frontend Intern';
    updateProfileUI(name, role);

    // Sync input values in settings card
    inputProfileName.value = name;
    inputProfileRole.value = role;
  };

  const updateProfileUI = (name, role) => {
    // Update local variables
    localStorage.setItem('profile-name', name);
    localStorage.setItem('profile-role', role);

    // Generate initials avatar
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Update Profile elements across the DOM
    document.querySelectorAll('.profile-name').forEach(el => el.textContent = name);
    document.querySelectorAll('.profile-role').forEach(el => el.textContent = role);
    document.getElementById('header-avatar').textContent = initials;
    document.getElementById('dropdown-avatar').textContent = initials;
  };

  profileSettingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = inputProfileName.value.trim();
    const newRole = inputProfileRole.value.trim();
    if (newName.length >= 3 && newRole.length >= 3) {
      updateProfileUI(newName, newRole);
      pushNotification('Profile Updated Successfully 👤', `Your display settings were changed to ${newName}.`);
      alert('Profile updated successfully!');
    }
  });

  // --- NOTIFICATIONS DROPDOWNS LOGIC ---
  const renderNotifications = () => {
    notificationsList.innerHTML = '';
    
    const unreadCount = notifications.filter(n => n.unread).length;
    if (unreadCount > 0) {
      notificationBadge.style.display = 'block';
    } else {
      notificationBadge.style.display = 'none';
    }

    if (notifications.length === 0) {
      notificationsList.innerHTML = `<li class="notification-empty">No new notifications.</li>`;
      return;
    }

    notifications.forEach(item => {
      const li = document.createElement('li');
      li.className = `notification-item ${item.unread ? 'unread' : ''}`;
      li.innerHTML = `
        <span class="notification-title">${item.title}</span>
        <span class="notification-desc">${item.desc}</span>
        <span class="notification-time">${item.time}</span>
      `;
      li.addEventListener('click', () => {
        item.unread = false;
        renderNotifications();
      });
      notificationsList.appendChild(li);
    });
  };

  const pushNotification = (title, desc) => {
    const nextId = notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1;
    notifications.unshift({
      id: nextId,
      title,
      desc,
      time: 'Just now',
      unread: true
    });
    renderNotifications();
  };

  // Toggle Dropdowns
  notificationToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.remove('active');
    notificationsDropdown.classList.toggle('active');
  });

  profileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    notificationsDropdown.classList.remove('active');
    profileDropdown.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    notificationsDropdown.classList.remove('active');
    profileDropdown.classList.remove('active');
  });

  markAllReadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifications.forEach(n => n.unread = false);
    renderNotifications();
  });

  btnAvailability.addEventListener('click', (e) => {
    e.stopPropagation();
    const indicator = document.querySelector('.status-card .status-indicator');
    const label = document.querySelector('.status-card .status-desc');
    
    if (indicator.classList.contains('online')) {
      indicator.className = 'status-indicator warning';
      label.textContent = 'Busy / In Focus';
      pushNotification('Status Toggled ⏰', 'Availability status changed to Busy/Focus.');
    } else if (indicator.classList.contains('warning')) {
      indicator.className = 'status-indicator online';
      label.textContent = 'Local Dev Active';
      pushNotification('Status Toggled 🟢', 'Availability status changed back to Active.');
    } else {
      indicator.className = 'status-indicator online';
      label.textContent = 'Local Dev Active';
    }
  });

  btnLogout.addEventListener('click', () => {
    pushNotification('Sign Out Simulated 🚪', 'Authentication logout workflow triggered successfully.');
    alert('Simulated Sign Out! Refresh page to log back in.');
  });

  // --- DIAGNOSTICS LOGIC ---
  const loadDiagnostics = async () => {
    const diagStatus = document.getElementById('diag-api-status');
    const diagUptime = document.getElementById('diag-api-uptime');
    const diagMemory = document.getElementById('diag-api-memory');
    const diagPlatform = document.getElementById('diag-api-platform');

    diagStatus.textContent = 'Connecting...';
    diagStatus.className = 'status-badge warning';

    try {
      const response = await fetch(BACKEND_HEALTH_URL);
      const result = await response.json();

      if (result.success && result.status === 'healthy') {
        diagStatus.textContent = 'Live Backend Active';
        diagStatus.className = 'status-badge success';
        diagUptime.textContent = result.uptime;
        diagMemory.textContent = result.system.memoryUsage;
        diagPlatform.textContent = `${result.system.platform.toUpperCase()} (${result.system.nodeVersion})`;
      } else {
        throw new Error('API returned unhealthy payload');
      }
    } catch (error) {
      console.warn('Diagnostics api connection failed.', error);
      diagStatus.textContent = 'Offline (Backup Mode)';
      diagStatus.className = 'status-badge danger';
      diagUptime.textContent = '-';
      diagMemory.textContent = '-';
      diagPlatform.textContent = 'Browser sandbox';
    }
  };

  btnRefreshDiagnostics.addEventListener('click', loadDiagnostics);

  // --- DYNAMIC SEARCH & FILTER COMBINATION ---
  const filterAndRenderTasks = () => {
    let filtered = [...tasksData];

    // 1. Filter Category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }

    // 2. Filter Search terms
    if (searchTerm.trim().length > 0) {
      const query = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.desc.toLowerCase().includes(query)
      );
    }

    renderTasks(filtered);
  };

  // Bind Search events
  taskSearchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    filterAndRenderTasks();
  });

  // Bind Category Tabs click
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      activeCategory = tab.dataset.category;
      filterAndRenderTasks();
    });
  });

  // --- CRUD API: READ ENGINE ---
  const loadTasksFromBackend = async () => {
    try {
      console.log('Connecting to backend tasks API...');
      const response = await fetch(BACKEND_API_URL);
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('Successfully synchronized tasks with server!');
        tasksData = result.data;
        isOffline = false;
        
        // Sync connection status label
        const statusCard = document.querySelector('.status-card');
        if (statusCard) {
          statusCard.querySelector('.status-indicator').className = 'status-indicator online';
          statusCard.querySelector('.status-desc').textContent = 'Live Backend Active';
        }
      } else {
        throw new Error('API returned failure payload status.');
      }
    } catch (error) {
      console.warn('Backend tasks API connection failed. Fallback to LocalStorage client database.', error);
      isOffline = true;
      
      // Load from LocalStorage or backupTasks
      const savedTasks = localStorage.getItem('decode-local-tasks');
      if (savedTasks) {
        tasksData = JSON.parse(savedTasks);
      } else {
        tasksData = [...backupTasks];
        localStorage.setItem('decode-local-tasks', JSON.stringify(tasksData));
      }
      
      const statusCard = document.querySelector('.status-card');
      if (statusCard) {
        statusCard.querySelector('.status-indicator').className = 'status-indicator warning';
        statusCard.querySelector('.status-desc').textContent = 'Offline (Backup Mode)';
      }
    }

    filterAndRenderTasks();
    updateStatsSummary(tasksData);
  };

  const renderTasks = (tasks) => {
    tasksGrid.innerHTML = '';
    
    if (tasks.length === 0) {
      tasksGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">
          <p>No tasks found matching current filters.</p>
        </div>
      `;
      return;
    }

    tasks.forEach(task => {
      const card = document.createElement('article');
      card.className = `task-card ${task.status}`;
      card.dataset.taskId = task.id;
      card.dataset.category = task.category;
      
      card.innerHTML = `
        <button class="btn-trash" aria-label="Delete task ${task.title}" data-task-id="${task.id}">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
          </svg>
        </button>
        <div class="task-badge-row">
          <span class="category-badge">${task.category}</span>
          <span class="status-pill ${task.status}">${task.status.replace('-', ' ')}</span>
        </div>
        <h3 class="task-card-title">${task.title}</h3>
        <p class="task-card-desc">${task.desc}</p>
        <div class="task-card-footer">
          <div class="task-progress-info">
            <span>Progress</span>
            <strong>${task.progress}%</strong>
          </div>
          <button class="btn-detail" aria-label="View details for ${task.title}">
            <span>Details</span>
            <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
            </svg>
          </button>
        </div>
      `;
      
      tasksGrid.appendChild(card);
    });
  };

  const updateStatsSummary = (tasks) => {
    if (tasks.length === 0) {
      statProgressVal.textContent = `0%`;
      statProgressFill.style.width = `0%`;
      statCompletedVal.textContent = `0 / 0`;
      statCompletedFill.style.width = `0%`;
      statHoursVal.textContent = `0h`;
      statHoursFill.style.width = `0%`;
      return;
    }

    // Average Progress
    const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
    const avgProgress = Math.round(totalProgress / tasks.length);
    statProgressVal.textContent = `${avgProgress}%`;
    statProgressFill.style.width = `${avgProgress}%`;
    statProgressFill.parentNode.setAttribute('aria-label', `Progress is ${avgProgress}%`);

    // Tasks Completed
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    statCompletedVal.textContent = `${completedCount} / ${tasks.length}`;
    const completedPercent = Math.round((completedCount / tasks.length) * 100);
    statCompletedFill.style.width = `${completedPercent}%`;
    statCompletedFill.parentNode.setAttribute('aria-label', `${completedCount} out of ${tasks.length} tasks completed`);

    // Hours calculation (simulated based on progress values)
    const trackedHours = tasks.reduce((sum, t) => sum + (t.progress * 0.4), 0).toFixed(1);
    statHoursVal.textContent = `${trackedHours}h`;
    const hoursPercent = Math.min(Math.round((trackedHours / 40) * 100), 100);
    statHoursFill.style.width = `${hoursPercent}%`;
    statHoursFill.parentNode.setAttribute('aria-label', `${trackedHours} hours out of 40 hours target`);
  };

  // --- CRUD API: CREATE ENGINE ---
  addTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('add-title').value.trim();
    const category = document.getElementById('add-category').value;
    const status = document.getElementById('add-status').value;
    const progress = parseInt(document.getElementById('add-progress').value, 10);
    const desc = document.getElementById('add-desc').value.trim();
    const deliverables = document.getElementById('add-deliverables').value.trim();
    const specsRaw = document.getElementById('add-spec').value.trim();

    // Map Technical Requirements specs array from lines
    const spec = specsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    const taskPayload = {
      title,
      category,
      status,
      progress,
      desc,
      deliverables,
      spec,
      timeline: status === 'completed' ? 'Sprint 2 (Completed)' : (status === 'in-progress' ? 'Sprint 3 (Active)' : 'Sprint 3 (Planning)')
    };

    try {
      if (isOffline) {
        throw new Error('Offline mode active. Redirect to LocalStorage.');
      }

      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      const result = await response.json();

      if (result.success) {
        pushNotification('Task Created successfully 🚀', `"${title}" has been appended to the roadmap database.`);
      } else {
        throw new Error(result.message || 'Validation error returned from REST server.');
      }
    } catch (error) {
      console.warn('API POST failed, writing task to local client cache...', error);
      const nextId = tasksData.length > 0 ? Math.max(...tasksData.map(t => t.id)) + 1 : 1;
      const localNewTask = {
        id: nextId,
        ...taskPayload
      };
      tasksData.push(localNewTask);
      localStorage.setItem('decode-local-tasks', JSON.stringify(tasksData));
      pushNotification('Task Created (Offline Cache) 💾', `"${title}" saved in local browser storage.`);
    }

    // Reset layout
    addTaskForm.reset();
    addProgressValSpan.textContent = '50';
    closeModalWindow(addTaskModal);
    loadTasksFromBackend();
  });

  addProgressInput.addEventListener('input', (e) => {
    addProgressValSpan.textContent = e.target.value;
  });

  // --- CRUD API: UPDATE ENGINE ---
  const openEditModal = (taskId) => {
    const task = tasksData.find(t => t.id === parseInt(taskId));
    if (!task) return;

    lastFocusedElement = document.activeElement;

    // Build the form-based modal body content dynamically
    modalTitle.textContent = "Edit Roadmap Task";
    document.getElementById('edit-task-id').value = task.id;

    const specsText = task.spec ? task.spec.join('\n') : '';

    modalBodyContent.innerHTML = `
      <div class="form-group">
        <label for="edit-title">Task Title</label>
        <input type="text" id="edit-title" value="${task.title}" required minlength="3">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="edit-category">Category</label>
          <select id="edit-category" required>
            <option value="architecture" ${task.category === 'architecture' ? 'selected' : ''}>Architecture</option>
            <option value="interactivity" ${task.category === 'interactivity' ? 'selected' : ''}>Interactivity</option>
            <option value="polish" ${task.category === 'polish' ? 'selected' : ''}>Polish</option>
          </select>
        </div>
        <div class="form-group">
          <label for="edit-status">Status</label>
          <select id="edit-status" required>
            <option value="pending" ${task.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label for="edit-progress">Progress (<span id="edit-progress-val">${task.progress}</span>%)</label>
        <div class="progress-slider-wrapper">
          <input type="range" id="edit-progress" min="0" max="100" value="${task.progress}">
          <span class="progress-slider-val" id="edit-progress-display">${task.progress}%</span>
        </div>
      </div>
      <div class="form-group">
        <label for="edit-desc">Description</label>
        <textarea id="edit-desc" required minlength="10" rows="3">${task.desc}</textarea>
      </div>
      <div class="form-group">
        <label for="edit-deliverables">Deliverables</label>
        <input type="text" id="edit-deliverables" value="${task.deliverables}" required>
      </div>
      <div class="form-group">
        <label for="edit-spec">Technical Requirements (One per line)</label>
        <textarea id="edit-spec" required rows="3">${specsText}</textarea>
      </div>
    `;

    // Bind slider input helper inside dynamic content
    const editProgressInput = document.getElementById('edit-progress');
    const editProgressValText = document.getElementById('edit-progress-display');
    const editProgressValHeader = document.getElementById('edit-progress-val');
    
    editProgressInput.addEventListener('input', (e) => {
      editProgressValText.textContent = `${e.target.value}%`;
      editProgressValHeader.textContent = e.target.value;
      
      // Auto-toggle status to completed if slider hits 100
      const statusSelect = document.getElementById('edit-status');
      if (parseInt(e.target.value, 10) === 100) {
        statusSelect.value = 'completed';
      } else if (parseInt(e.target.value, 10) > 0 && statusSelect.value === 'pending') {
        statusSelect.value = 'in-progress';
      }
    });

    // Auto update slider if status selector is toggled
    const editStatusSelect = document.getElementById('edit-status');
    editStatusSelect.addEventListener('change', (e) => {
      if (e.target.value === 'completed') {
        editProgressInput.value = 100;
        editProgressValText.textContent = '100%';
        editProgressValHeader.textContent = '100';
      } else if (e.target.value === 'pending') {
        editProgressInput.value = 0;
        editProgressValText.textContent = '0%';
        editProgressValHeader.textContent = '0';
      }
    });

    openModalWindow(detailModal);
  };

  editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = parseInt(document.getElementById('edit-task-id').value, 10);
    const title = document.getElementById('edit-title').value.trim();
    const category = document.getElementById('edit-category').value;
    const status = document.getElementById('edit-status').value;
    const progress = parseInt(document.getElementById('edit-progress').value, 10);
    const desc = document.getElementById('edit-desc').value.trim();
    const deliverables = document.getElementById('edit-deliverables').value.trim();
    const specsRaw = document.getElementById('edit-spec').value.trim();

    const spec = specsRaw.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    const taskPayload = {
      title,
      category,
      status,
      progress,
      desc,
      deliverables,
      spec,
      timeline: status === 'completed' ? 'Sprint 2 (Completed)' : (status === 'in-progress' ? 'Sprint 3 (Active)' : 'Sprint 3 (Planning)')
    };

    try {
      if (isOffline) {
        throw new Error('Offline mode active.');
      }

      const response = await fetch(`${BACKEND_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload)
      });
      const result = await response.json();

      if (result.success) {
        pushNotification('Task Saved Successfully 🔧', `Changes for "${title}" synchronized with REST API.`);
      } else {
        throw new Error(result.message || 'REST PUT validation rejected request.');
      }
    } catch (error) {
      console.warn('API PUT failed, saving edits to client-side localStorage cache...', error);
      const index = tasksData.findIndex(t => t.id === id);
      if (index !== -1) {
        tasksData[index] = {
          id,
          ...taskPayload
        };
        localStorage.setItem('decode-local-tasks', JSON.stringify(tasksData));
        pushNotification('Task Updated (Offline Cache) 💾', `"${title}" saved in local browser storage.`);
      }
    }

    closeModalWindow(detailModal);
    loadTasksFromBackend();
  });

  // --- CRUD API: DELETE ENGINE ---
  const triggerDeleteConfirmation = (taskId) => {
    const task = tasksData.find(t => t.id === parseInt(taskId));
    if (!task) return;

    deleteTargetId = task.id;
    deleteConfirmTitleSpan.textContent = task.title;

    // Close detail modal if open
    detailModal.classList.remove('active');

    openModalWindow(deleteConfirmModal);
  };

  deleteModalConfirmBtn.addEventListener('click', async () => {
    if (!deleteTargetId) return;

    const task = tasksData.find(t => t.id === deleteTargetId);
    const title = task ? task.title : `ID ${deleteTargetId}`;

    try {
      if (isOffline) {
        throw new Error('Offline Mode active.');
      }

      const response = await fetch(`${BACKEND_API_URL}/${deleteTargetId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        pushNotification('Task Deleted 🗑️', `"${title}" removed from the portal database.`);
      } else {
        throw new Error(result.message || 'API DELETE request failed.');
      }
    } catch (error) {
      console.warn('API DELETE failed, purging task from local storage cache...', error);
      tasksData = tasksData.filter(t => t.id !== deleteTargetId);
      localStorage.setItem('decode-local-tasks', JSON.stringify(tasksData));
      pushNotification('Task Purged (Offline Cache) 💾', `"${title}" purged from browser storage.`);
    }

    deleteTargetId = null;
    closeModalWindow(deleteConfirmModal);
    loadTasksFromBackend();
  });

  // --- ACCESSIBLE MODALS OPEN/CLOSE CONTROL ---
  const openModalWindow = (modalElement) => {
    modalElement.classList.add('active');
    modalElement.setAttribute('aria-hidden', 'false');
    
    // Focus first input or button inside
    const focusable = modalElement.querySelectorAll('input, select, textarea, button');
    if (focusable.length > 0) focusable[0].focus();

    document.addEventListener('keydown', trapFocus);
  };

  const closeModalWindow = (modalElement) => {
    modalElement.classList.remove('active');
    modalElement.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', trapFocus);

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  const trapFocus = (e) => {
    const activeModal = document.querySelector('.modal.active');
    if (!activeModal) return;

    if (e.key === 'Escape') {
      closeModalWindow(activeModal);
      return;
    }

    if (e.key === 'Tab') {
      const focusable = activeModal.querySelectorAll('button, input, select, textarea, [tabindex="0"]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
  };

  // Wire Modal triggers & bindings
  btnAddTaskTrigger.addEventListener('click', () => {
    lastFocusedElement = document.activeElement;
    openModalWindow(addTaskModal);
  });

  addModalCloseBtn.addEventListener('click', () => closeModalWindow(addTaskModal));
  addModalCancelBtn.addEventListener('click', () => closeModalWindow(addTaskModal));
  addModalBackdrop.addEventListener('click', () => closeModalWindow(addTaskModal));

  modalCloseBtn.addEventListener('click', () => closeModalWindow(detailModal));
  modalCancelBtn.addEventListener('click', () => closeModalWindow(detailModal));
  modalBackdrop.addEventListener('click', () => closeModalWindow(detailModal));

  deleteModalCloseBtn.addEventListener('click', () => closeModalWindow(deleteConfirmModal));
  deleteModalCancelBtn.addEventListener('click', () => closeModalWindow(deleteConfirmModal));
  deleteModalBackdrop.addEventListener('click', () => closeModalWindow(deleteConfirmModal));

  modalDeleteBtn.addEventListener('click', () => {
    const taskId = document.getElementById('edit-task-id').value;
    triggerDeleteConfirmation(taskId);
  });

  // Event Delegation for Buttons inside dynamic tasks cards
  tasksGrid.addEventListener('click', (e) => {
    const detailBtn = e.target.closest('.btn-detail');
    const deleteBtn = e.target.closest('.btn-trash');

    if (detailBtn) {
      const card = detailBtn.closest('.task-card');
      openEditModal(card.dataset.taskId);
    } else if (deleteBtn) {
      e.stopPropagation();
      triggerDeleteConfirmation(deleteBtn.dataset.taskId);
    }
  });

  // --- INITIALIZATION ON START ---
  initTheme();
  initProfile();
  renderLiveDate();
  renderNotifications();
  loadTasksFromBackend();
  loadDiagnostics();

  // Run view switcher based on URL hash
  const initialHash = ['#overview', '#tasks', '#metrics', '#settings'].includes(location.hash) ? location.hash : '#overview';
  switchView(initialHash);
});
