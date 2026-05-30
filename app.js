// App State
let locations = [];
let markers = {};
let currentLang = 'he'; // 'he' or 'en'
let currentCategory = 'all';
let editorMode = false;
let activeMappingLocationId = null;
let isRepositioningFromForm = false;
let map = null;
let imageOverlay = null;
let showMarkers = true;

// Image dimensions (from struct analysis)
const IMG_WIDTH = 7146;
const IMG_HEIGHT = 5079;
const bounds = [[0, 0], [IMG_HEIGHT, IMG_WIDTH]];

// Translations Dictionary
const t = {
  he: {
    appTitle: "כישור הזמן",
    appSubtitle: "המפה האינטראקטיבית",
    langTooltip: "Switch to English",
    editorTooltip: "הפעל/כבה מצב עריכה",
    editorText: "מצב עריכה",
    searchInput: "חיפוש מיקום...",
    filterAll: "הכל",
    filterCapital: "ערי בירה",
    filterCity: "ערים",
    filterVillage: "כפרים",
    filterStedding: "סטדינג",
    filterPortalStone: "אבני שער",
    filterRuins: "חורבות",
    filterDistrict: "מחוזות",
    filterRegion: "איזורים",
    filterLandmark: "אתרים",
    mappedTitle: "מקומות שמופו",
    unmappedTitle: "מקומות להצבה במפה",
    addNewBtn: "הוסף מקום חדש",
    editorBannerDesc: "<strong>מצב עריכה פעיל:</strong> לחץ על מקום שטרם מופה מהרשימה ואז לחץ על המפה להצבתו, או לחץ ישירות על המפה ליצירת מקום חדש.",
    coordsLabel: "קואורדינטות:",
    mappingAlertText: "לחץ על המפה כדי להציב את",
    cancelText: "ביטול",
    repositionBtn: "מקם במפה",
    modalTitleAdd: "הוספת מקום חדש",
    modalTitleEdit: "עריכת מיקום",
    emptyStateText: "אין מקומים התואמים את החיפוש או הסינון הנוכחי",
    toastSaveSuccess: "הנתונים נשמרו בהצלחה בקובץ בדיסק!",
    toastSaveFallback: "השרת אינו זמין. הנתונים נשמרו בזיכרון הדפדפן (Local Storage)!",
    toastSaveError: "שגיאה בשמירת הנתונים!",
    toastLocationPlaced: "המיקום הוצב בהצלחה!",
    toastLocationDeleted: "המיקום נמחק בהצלחה!",
    confirmDelete: "האם אתה בטוח שברצונך למחוק מיקום זה?",
    passwordPrompt: "אנא הזן סיסמת עריכה:",
    passwordIncorrect: "סיסמה שגויה! הגישה נדחתה.",
    categoryNames: {
      capital: "עיר בירה",
      city: "עיר",
      village: "כפר",
      stedding: "סטדינג",
      portal_stone: "אבן שער",
      ruins: "חורבות",
      district: "מחוז",
      region: "איזור",
      landmark: "אתר"
    }
  },
  en: {
    appTitle: "Wheel of Time",
    appSubtitle: "Interactive Map",
    langTooltip: "החלף לעברית",
    editorTooltip: "Enable/Disable Editor Mode",
    editorText: "Editor Mode",
    searchInput: "Search location...",
    filterAll: "All",
    filterCapital: "Capitals",
    filterCity: "Cities",
    filterVillage: "Villages",
    filterStedding: "Steddins",
    filterPortalStone: "Portal Stones",
    filterRuins: "Ruins",
    filterDistrict: "Districts",
    filterRegion: "Areas",
    filterLandmark: "Landmarks",
    mappedTitle: "Mapped Locations",
    unmappedTitle: "Locations to Place",
    addNewBtn: "Add New Location",
    editorBannerDesc: "<strong>Editor Mode Active:</strong> Select an unmapped location from the list then click on the map to place it, or click anywhere on the map to create a new location.",
    coordsLabel: "Coordinates:",
    mappingAlertText: "Click on the map to place",
    cancelText: "Cancel",
    repositionBtn: "Locate on Map",
    modalTitleAdd: "Add New Location",
    modalTitleEdit: "Edit Location Details",
    emptyStateText: "No locations match the current search or filter",
    toastSaveSuccess: "Data successfully saved to locations.json on disk!",
    toastSaveFallback: "Server offline. Saved to browser Local Storage fallback!",
    toastSaveError: "Error saving data to disk!",
    toastLocationPlaced: "Location placed successfully!",
    toastLocationDeleted: "Location deleted successfully!",
    confirmDelete: "Are you sure you want to delete this location?",
    passwordPrompt: "Please enter editor password:",
    passwordIncorrect: "Incorrect password! Access denied.",
    categoryNames: {
      capital: "Capital",
      city: "City",
      village: "Village",
      stedding: "Stedding",
      portal_stone: "Portal Stone",
      ruins: "Ruins",
      district: "District",
      region: "Area",
      landmark: "Landmark"
    }
  }
};

// Start the Application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initEventListeners();
  loadLocations();

  // Register Service Worker for Progressive Web App (PWA) installation
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('[Service Worker] Registered successfully', reg.scope))
        .catch(err => console.error('[Service Worker] Registration failed:', err));
    });
  }

  // Check protocol and display warning if opened via file://
  if (window.location.protocol === 'file:') {
    showProtocolWarning();
  }
});

// Initialize Leaflet Map
function initMap() {
  // Setup Leaflet map with simple Cartesian coordinate system
  map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 3,
    zoomSnap: 0.25,
    zoomDelta: 0.5,
    maxBounds: [[-1000, -1000], [IMG_HEIGHT + 1000, IMG_WIDTH + 1000]],
    maxBoundsViscosity: 0.6,
    attributionControl: false
  });

  // Display the huge map image overlay
  imageOverlay = L.imageOverlay('afavl8.jpeg', bounds).addTo(map);

  // Zoom to fit the entire map image initially
  map.fitBounds(bounds);
  
  // Custom Zoom Control positioning (bottom-left / bottom-right depending on RTL)
  map.zoomControl.setPosition(currentLang === 'he' ? 'bottomleft' : 'bottomright');
}

// Load Locations from Server (with Cloud Firestore & LocalStorage fallback)
async function loadLocations() {
  // If Google Firebase Cloud Firestore is initialized and active
  if (window.db) {
    try {
      const snapshot = await db.collection('locations').get();
      if (snapshot.empty) {
        console.log('Firestore is empty. Migrating data from locations.json...');
        // Load from local static locations.json for initial migration
        const response = await fetch(`locations.json?_=${Date.now()}`);
        locations = await response.json();
        
        // Save in batches to Firestore
        const batch = db.batch();
        locations.forEach(loc => {
          const docRef = db.collection('locations').doc(loc.id);
          batch.set(docRef, loc);
        });
        await batch.commit();
        console.log('Successfully migrated locations to Cloud Firestore!');
      } else {
        // Load existing locations from cloud Firestore
        locations = [];
        snapshot.forEach(doc => {
          locations.push(doc.data());
        });
        console.log(`Loaded ${locations.length} locations from Cloud Firestore successfully.`);
      }
      renderLocationsList();
      renderMarkersOnMap();
      return; // Successfully loaded from cloud, skip local fallbacks
    } catch (error) {
      console.error('Failed to load from Cloud Firestore. Falling back to local methods...', error);
    }
  }

  // Local/Offline Fallback (Standard Node.js / LocalStorage loading)
  try {
    const response = await fetch(`/api/locations?_=${Date.now()}`);
    if (!response.ok) throw new Error('Server returned error status');
    locations = await response.json();
    console.log('Loaded locations from server successfully', locations);
  } catch (error) {
    console.warn('Could not fetch locations from server, falling back to LocalStorage or default', error);
    const localData = localStorage.getItem('wot_locations');
    if (localData) {
      try {
        locations = JSON.parse(localData);
        showToast(currentLang === 'he' ? 'נטענו נתונים שמורים מהדפדפן' : 'Loaded saved browser data', 'warning');
      } catch (e) {
        locations = [];
      }
    } else {
      // If absolutely no data, fetch the local static locations.json directly (read-only mode)
      try {
        const localResponse = await fetch(`locations.json?_=${Date.now()}`);
        locations = await localResponse.json();
      } catch (e) {
        console.error('Failed to load local static locations file', e);
      }
    }
  }

  renderLocationsList();
  renderMarkersOnMap();
}

// Render Leaflet Markers on Map
function renderMarkersOnMap() {
  // Clear any existing markers
  Object.values(markers).forEach(marker => map.removeLayer(marker));
  markers = {};

  // If markers are toggled off globally, don't show any markers
  if (!showMarkers) return;

  // Place markers for locations that have coordinates
  locations.forEach(loc => {
    if (!loc.coords) return; // skip unmapped locations

    // Category Filter Synchronization: show only markers that match sidebar selection
    if (currentCategory !== 'all' && loc.category !== currentCategory) return;

    const [y, x] = loc.coords;
    
    // Create a custom styled marker HTML element
    const name = currentLang === 'he' ? loc.name_he : loc.name_en;
    const category = loc.category || 'city';
    
    const icon = L.divIcon({
      className: `map-marker ${category} id-${loc.id}`,
      html: `<div class="marker-pin" title="${name}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    // Add marker to map
    const marker = L.marker([y, x], { icon: icon }).addTo(map);
    
    // Bind elegant bilingual popup
    marker.bindPopup(() => createPopupContent(loc));
    
    // Store reference to marker
    markers[loc.id] = marker;
  });
}

// Create Custom Popup HTML Content
function createPopupContent(loc) {
  const name = currentLang === 'he' ? loc.name_he : loc.name_en;
  const desc = currentLang === 'he' ? (loc.desc_he || 'אין תיאור זמין.') : (loc.desc_en || 'No description available.');
  const catName = t[currentLang].categoryNames[loc.category || 'city'];
  
  let actionsHtml = '';
  if (editorMode) {
    actionsHtml = `
      <div class="popup-footer" style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px; justify-content: flex-end; gap: 8px; display: flex;">
        <button onclick="editLocation('${loc.id}')" class="card-btn card-btn-secondary" style="font-size:0.7rem; padding: 2px 6px;">
          <i class="fa-solid fa-pen-to-square"></i> ${currentLang === 'he' ? 'עריכה' : 'Edit'}
        </button>
        <button onclick="deleteLocation('${loc.id}')" class="card-btn card-btn-danger" style="font-size:0.7rem; padding: 2px 6px;">
          <i class="fa-solid fa-trash-can"></i> ${currentLang === 'he' ? 'מחיקה' : 'Delete'}
        </button>
      </div>
    `;
  }

  return `
    <div class="popup-container" dir="${currentLang === 'he' ? 'rtl' : 'ltr'}">
      <header class="popup-header">
        <span class="popup-title">${name}</span>
        <span class="category-tag ${loc.category || 'city'}">${catName}</span>
      </header>
      <article class="popup-desc">${desc}</article>
      ${actionsHtml}
    </div>
  `;
}

// Render the Sidebar lists of Mapped & Unmapped locations
function renderLocationsList() {
  const mappedList = document.getElementById('mapped-list');
  const unmappedList = document.getElementById('unmapped-list');
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.toLowerCase().trim();

  // Clear lists
  mappedList.innerHTML = '';
  unmappedList.innerHTML = '';

  let mappedCount = 0;
  let unmappedCount = 0;

  // Filter locations based on search and category filter
  const filteredLocs = locations.filter(loc => {
    // Category Filter
    if (currentCategory !== 'all' && loc.category !== currentCategory) return false;
    
    // Search Query Filter
    if (query) {
      const nameEn = (loc.name_en || '').toLowerCase();
      const nameHe = (loc.name_he || '').toLowerCase();
      const descEn = (loc.desc_en || '').toLowerCase();
      const descHe = (loc.desc_he || '').toLowerCase();
      
      return nameEn.includes(query) || nameHe.includes(query) || descEn.includes(query) || descHe.includes(query);
    }
    
    return true;
  });

  // Category Priority Order
  const categoryOrder = {
    capital: 1,
    city: 2,
    village: 3,
    stedding: 4,
    portal_stone: 5,
    ruins: 6,
    district: 7,
    region: 8,
    landmark: 9
  };

  // Sort: first by category priority, then alphabetically within each category
  filteredLocs.sort((a, b) => {
    const orderA = categoryOrder[a.category] || 99;
    const orderB = categoryOrder[b.category] || 99;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Sort alphabetically within the same category
    const nameA = (currentLang === 'he' ? a.name_he : a.name_en).toLowerCase();
    const nameB = (currentLang === 'he' ? b.name_he : b.name_en).toLowerCase();
    
    return nameA.localeCompare(nameB, currentLang === 'he' ? 'he' : 'en');
  });

  // Populate lists
  filteredLocs.forEach(loc => {
    const isMapped = loc.coords !== null;
    const card = createLocationCard(loc, isMapped);
    
    if (isMapped) {
      mappedList.appendChild(card);
      mappedCount++;
    } else {
      unmappedList.appendChild(card);
      unmappedCount++;
    }
  });

  // Update counters
  document.getElementById('mapped-count').textContent = mappedCount;
  document.getElementById('unmapped-count').textContent = unmappedCount;

  // Show empty state if no matching locations
  if (filteredLocs.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'empty-state';
    emptyMsg.textContent = t[currentLang].emptyStateText;
    mappedList.appendChild(emptyMsg);
  }

  // Toggle Unmapped group visibility based on unmapped locations availability
  const unmappedGroup = document.getElementById('unmapped-group');
  if (unmappedCount > 0) {
    unmappedGroup.style.display = 'flex';
  } else {
    unmappedGroup.style.display = 'none';
  }
}

// Create Sidebar HTML Card for a location
function createLocationCard(loc, isMapped) {
  const card = document.createElement('div');
  card.className = `location-card id-${loc.id}`;
  if (loc.id === activeMappingLocationId) card.classList.add('selected');

  const name = currentLang === 'he' ? loc.name_he : loc.name_en;
  const catName = t[currentLang].categoryNames[loc.category || 'city'];
  
  // Build map icon button HTML if mapped
  let mapIconHtml = '';
  if (isMapped) {
    mapIconHtml = `
      <button class="header-map-btn tooltip ${loc.category || 'city'}" data-tooltip="${currentLang === 'he' ? 'הצג במפה' : 'Show on Map'}">
        <i class="fa-solid fa-location-dot"></i>
      </button>
    `;
  } else {
    if (!editorMode) {
      mapIconHtml = `
        <span class="unmapped-badge tooltip" data-tooltip="${currentLang === 'he' ? 'טרם מופה' : 'Not mapped yet'}">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </span>
      `;
    }
  }

  card.innerHTML = `
    <header class="card-header" style="border: none; padding: 0; margin: 0; display: flex; justify-content: space-between; align-items: center;">
      <div class="card-header-right" style="display: flex; align-items: center; gap: 8px;">
        ${mapIconHtml}
        <span class="location-name">${name}</span>
      </div>
      <div class="header-meta" style="display: flex; align-items: center; gap: 8px;">
        <span class="category-tag ${loc.category || 'city'}">${catName}</span>
      </div>
    </header>
    <div class="card-body" style="display: none;"></div>
  `;

  // Click on the map button focuses the location
  if (isMapped) {
    const mapBtn = card.querySelector('.header-map-btn');
    if (mapBtn) {
      mapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        focusLocationOnMap(loc);
      });
    }
    
    // Click on the entire card also focuses it
    card.addEventListener('click', () => {
      focusLocationOnMap(loc);
    });
  }

  // If editor mode, we still show the action panel for editing/deleting/mapping
  const actions = document.createElement('div');
  actions.className = 'card-actions';

  if (editorMode) {
    if (isMapped) {
      const editBtn = document.createElement('button');
      editBtn.className = 'card-btn card-btn-secondary';
      editBtn.innerHTML = `<i class="fa-solid fa-pen"></i>`;
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        editLocation(loc.id);
      });
      actions.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'card-btn card-btn-danger';
      deleteBtn.innerHTML = `<i class="fa-solid fa-trash-can"></i>`;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteLocation(loc.id);
      });
      actions.appendChild(deleteBtn);
    } else {
      const placeBtn = document.createElement('button');
      placeBtn.className = `card-btn ${activeMappingLocationId === loc.id ? 'btn-danger' : 'card-btn-primary'}`;
      placeBtn.innerHTML = activeMappingLocationId === loc.id 
        ? `<i class="fa-solid fa-ban"></i> <span>${t[currentLang].cancelText}</span>`
        : `<i class="fa-solid fa-crosshairs"></i> <span>${currentLang === 'he' ? 'מקם' : 'Place'}</span>`;
      
      placeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeMappingLocationId === loc.id) {
          cancelMappingMode();
        } else {
          startMappingMode(loc.id);
        }
      });
      actions.appendChild(placeBtn);
    }
    card.appendChild(actions);
  }

  return card;
}

// Center map on location and open its popup
function focusLocationOnMap(loc) {
  if (!loc.coords) return;
  const [y, x] = loc.coords;
  
  // Highlight active card in sidebar
  document.querySelectorAll('.location-card').forEach(c => c.classList.remove('selected'));
  const card = document.querySelector(`.location-card.id-${loc.id}`);
  if (card) card.classList.add('selected');

  // Center view smoothly
  map.setView([y, x], 0); // Zoom level 0 for nice balanced view
  
  // Open popup
  if (markers[loc.id]) {
    // Add custom selected animation classes
    document.querySelectorAll('.map-marker').forEach(m => m.classList.remove('selected'));
    const markerEl = document.querySelector(`.map-marker.id-${loc.id}`);
    if (markerEl) markerEl.classList.add('selected');
    
    markers[loc.id].openPopup();
  }

  // On mobile screens, automatically close the sidebar drawer to show the map location
  if (window.innerWidth <= 768) {
    const sidebar = document.getElementById('sidebar-panel');
    const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (mobileToggleBtn) {
        const icon = mobileToggleBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    }
  }
}

// Start Map Placement mode for a specific unmapped location
function startMappingMode(locId) {
  activeMappingLocationId = locId;
  const loc = locations.find(l => l.id === locId);
  const name = currentLang === 'he' ? loc.name_he : loc.name_en;

  // Highlight selected card
  renderLocationsList();

  // Change mouse cursor to crosshair on map
  document.getElementById('map').style.cursor = 'crosshair';

  // Show Mapping HUD Banner
  const alertPanel = document.getElementById('mapping-alert-panel');
  document.getElementById('mapping-alert-text').innerHTML = `${t[currentLang].mappingAlertText} <strong>${name}</strong>`;
  alertPanel.style.display = 'flex';
}

// Cancel Map Placement mode
function cancelMappingMode() {
  activeMappingLocationId = null;
  document.getElementById('map').style.cursor = '';
  document.getElementById('mapping-alert-panel').style.display = 'none';
  renderLocationsList();
}

// Event Listeners initialization
function initEventListeners() {
  // Mobile Sidebar Toggle and Backdrop close
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const sidebar = document.getElementById('sidebar-panel');
  const backdrop = document.getElementById('sidebar-backdrop');

  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      const icon = mobileToggleBtn.querySelector('i');
      if (sidebar.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }

  if (backdrop && sidebar && mobileToggleBtn) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      const icon = mobileToggleBtn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-bars';
    });
  }

  // Toggle Markers Visibility
  const toggleMarkersBtn = document.getElementById('toggle-markers-btn');
  if (toggleMarkersBtn) {
    toggleMarkersBtn.addEventListener('click', toggleMarkersVisibility);
  }

  // Language Button Toggle
  const langBtn = document.getElementById('lang-btn');
  langBtn.addEventListener('click', toggleLanguage);

  // Editor Mode Toggle
  const editorBtn = document.getElementById('editor-btn');
  editorBtn.addEventListener('click', toggleEditorMode);

  // Search Input listener
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', () => {
    clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
    renderLocationsList();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    renderLocationsList();
    searchInput.focus();
  });

  // Category Filter Chips
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCategory = chip.getAttribute('data-category');
      renderLocationsList();
      renderMarkersOnMap(); // Synchronize map markers with clicked category filter!
    });
  });

  // Editor Mode Action: Add New Custom Button
  document.getElementById('add-custom-btn').addEventListener('click', () => {
    openLocationForm(null, [Math.round(IMG_HEIGHT / 2), Math.round(IMG_WIDTH / 2)]);
  });

  // Sidebar Form Action Buttons
  document.getElementById('close-form-btn').addEventListener('click', closeLocationForm);
  document.getElementById('cancel-form-btn').addEventListener('click', closeLocationForm);
  document.getElementById('reposition-location-btn').addEventListener('click', startRepositioningMode);
  
  // Submit Location Form
  document.getElementById('location-form').addEventListener('submit', handleFormSubmit);

  // Map click listener for editor actions
  map.on('click', handleMapClick);

  // Map hover coordinate helper
  map.on('mousemove', (e) => {
    if (editorMode) {
      const y = Math.round(e.latlng.lat);
      const x = Math.round(e.latlng.lng);
      
      const coordsDisplay = document.getElementById('coords-display-panel');
      if (y >= 0 && y <= IMG_HEIGHT && x >= 0 && x <= IMG_WIDTH) {
        coordsDisplay.style.display = 'flex';
        document.getElementById('coords-value').textContent = `Y: ${y}, X: ${x}`;
      } else {
        coordsDisplay.style.display = 'none';
      }
    }
  });

  // Close coords panel button
  document.getElementById('close-coords-btn').addEventListener('click', () => {
    document.getElementById('coords-display-panel').style.display = 'none';
  });

  // Cancel mapping overlay button
  document.getElementById('cancel-mapping-btn').addEventListener('click', cancelMappingMode);
}

// Toggle Interface Language
function toggleLanguage() {
  currentLang = currentLang === 'he' ? 'en' : 'he';
  
  // Update HTML dir and lang attributes
  const htmlEl = document.documentElement;
  htmlEl.setAttribute('lang', currentLang);
  htmlEl.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');

  // Reposition Leaflet zoom controls
  map.zoomControl.setPosition(currentLang === 'he' ? 'bottomleft' : 'bottomright');

  // Update UI texts based on current language
  document.getElementById('app-title').textContent = t[currentLang].appTitle;
  document.getElementById('app-subtitle').textContent = t[currentLang].appSubtitle;
  
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.setAttribute('data-tooltip', t[currentLang].langTooltip);

  const editorBtn = document.getElementById('editor-btn');
  if (editorBtn) {
    editorBtn.setAttribute('data-tooltip', t[currentLang].editorTooltip);
  }

  const toggleMarkersBtn = document.getElementById('toggle-markers-btn');
  if (toggleMarkersBtn) {
    toggleMarkersBtn.setAttribute('data-tooltip', currentLang === 'he' ? 'הצג/הסתר סימניות' : 'Show/Hide Markers');
  }

  document.getElementById('search-input').placeholder = t[currentLang].searchInput;
  
  // Re-translate filter chips
  document.getElementById('filter-all').textContent = t[currentLang].filterAll;
  document.getElementById('filter-capital').textContent = t[currentLang].filterCapital;
  document.getElementById('filter-city').textContent = t[currentLang].filterCity;
  document.getElementById('filter-village').textContent = t[currentLang].filterVillage;
  document.getElementById('filter-stedding').textContent = t[currentLang].filterStedding;
  document.getElementById('filter-portal-stone').textContent = t[currentLang].filterPortalStone;
  document.getElementById('filter-ruins').textContent = t[currentLang].filterRuins;
  document.getElementById('filter-district').textContent = t[currentLang].filterDistrict;
  document.getElementById('filter-region').textContent = t[currentLang].filterRegion;
  document.getElementById('filter-landmark').textContent = t[currentLang].filterLandmark;

  document.getElementById('btn-add-new-text').textContent = t[currentLang].addNewBtn;
  document.getElementById('coords-label').textContent = t[currentLang].coordsLabel;
  document.getElementById('cancel-mapping-text').textContent = t[currentLang].cancelText;

  // Translate reposition button
  const repositionBtnText = document.getElementById('reposition-btn-text');
  if (repositionBtnText) {
    repositionBtnText.textContent = t[currentLang].repositionBtn;
  }

  // Translate active form title
  const formSectionTitle = document.getElementById('form-section-title');
  if (formSectionTitle) {
    const formId = document.getElementById('form-id').value;
    formSectionTitle.textContent = formId ? t[currentLang].modalTitleEdit : t[currentLang].modalTitleAdd;
  }

  // Re-translate the protocol-warning-banner if it exists
  const warningBanner = document.querySelector('.protocol-warning-banner');
  if (warningBanner) {
    const isHe = currentLang === 'he';
    warningBanner.innerHTML = isHe ? `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span><strong>שים לב:</strong> האתר נפתח כקובץ מקומי. שינויים שתבצע יישמרו בדפדפן בלבד. לשמירה לצמיתות בדיסק, אנא היכנס דרך השרת: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></span>
    ` : `
      <i class="fa-solid fa-triangle-exclamation"></i>
      <span><strong>Warning:</strong> Opened as local file. Changes will save to browser memory only. To persist to disk, access via server: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></span>
    `;
  }

  // Re-render components with translated language
  renderLocationsList();
  renderMarkersOnMap();
}

// Toggle Editor Mode
function toggleEditorMode() {
  if (!editorMode) {
    const password = prompt(t[currentLang].passwordPrompt);
    if (password !== 'shimi') {
      showToast(t[currentLang].passwordIncorrect, 'error');
      return;
    }
  }

  editorMode = !editorMode;
  
  const editorBtn = document.getElementById('editor-btn');
  const banner = document.getElementById('editor-banner');
  const coordsDisplay = document.getElementById('coords-display-panel');
  
  if (editorMode) {
    if (editorBtn) editorBtn.classList.add('active');
    banner.style.display = 'block';
    showToast(currentLang === 'he' ? 'מצב עריכה הופעל' : 'Editor Mode activated', 'warning');
  } else {
    if (editorBtn) editorBtn.classList.remove('active');
    banner.style.display = 'none';
    coordsDisplay.style.display = 'none';
    cancelMappingMode();
    closeLocationForm();
    showToast(currentLang === 'he' ? 'מצב עריכה כובה' : 'Editor Mode deactivated');
  }

  // Re-render lists and markers to update cards with edit buttons
  renderLocationsList();
  renderMarkersOnMap();
}

// Handle Click on the Leaflet Map
function handleMapClick(e) {
  if (!editorMode) return;

  const y = Math.round(e.latlng.lat);
  const x = Math.round(e.latlng.lng);

  // If we are currently repositioning coordinates for the active form
  if (isRepositioningFromForm) {
    document.getElementById('form-y').value = y;
    document.getElementById('form-x').value = x;
    document.getElementById('form-y-display').textContent = y;
    document.getElementById('form-x-display').textContent = x;
    document.getElementById('form-coords-preview-group').style.display = 'flex';
    
    showToast(currentLang === 'he' ? 'קואורדינטות עודכנו בטופס!' : 'Coordinates updated in form!', 'success');
    
    // Reset repositioning mode
    isRepositioningFromForm = false;
    document.getElementById('map').style.cursor = '';
    document.getElementById('mapping-alert-panel').style.display = 'none';
  }
  // Else if we are currently placing an existing location
  else if (activeMappingLocationId) {
    const loc = locations.find(l => l.id === activeMappingLocationId);
    loc.coords = [y, x];
    
    showToast(`${t[currentLang].toastLocationPlaced}: ${currentLang === 'he' ? loc.name_he : loc.name_en}`, 'success');
    
    // Reset mapping mode
    activeMappingLocationId = null;
    document.getElementById('map').style.cursor = '';
    document.getElementById('mapping-alert-panel').style.display = 'none';
    
    // Save, render, and focus
    saveLocations();
    renderLocationsList();
    renderMarkersOnMap();
    focusLocationOnMap(loc);
  } else {
    // No active location being mapped, clicking on map creates a *new* custom location at this click coordinate
    openLocationForm(null, [y, x]);
  }
}

// Open Dialog / Sidebar Form to create or edit location details
function openLocationForm(locId = null, coords = null) {
  const formSection = document.getElementById('sidebar-form-section');
  const title = document.getElementById('form-section-title');
  const form = document.getElementById('location-form');
  
  form.reset();

  if (locId) {
    // Edit Mode
    const loc = locations.find(l => l.id === locId);
    title.textContent = t[currentLang].modalTitleEdit;
    
    document.getElementById('form-id').value = loc.id;
    document.getElementById('form-name-en').value = loc.name_en || '';
    document.getElementById('form-name-he').value = loc.name_he || '';
    document.getElementById('form-category').value = loc.category || 'city';
    document.getElementById('form-desc-en').value = loc.desc_en || '';
    document.getElementById('form-desc-he').value = loc.desc_he || '';
    
    if (loc.coords) {
      document.getElementById('form-y').value = loc.coords[0];
      document.getElementById('form-x').value = loc.coords[1];
      document.getElementById('form-y-display').textContent = loc.coords[0];
      document.getElementById('form-x-display').textContent = loc.coords[1];
      document.getElementById('form-coords-preview-group').style.display = 'flex';
    } else {
      document.getElementById('form-y').value = '';
      document.getElementById('form-x').value = '';
      document.getElementById('form-coords-preview-group').style.display = 'none';
    }
  } else {
    // Add Mode
    title.textContent = t[currentLang].modalTitleAdd;
    document.getElementById('form-id').value = '';
    
    if (coords) {
      document.getElementById('form-y').value = coords[0];
      document.getElementById('form-x').value = coords[1];
      document.getElementById('form-y-display').textContent = coords[0];
      document.getElementById('form-x-display').textContent = coords[1];
      document.getElementById('form-coords-preview-group').style.display = 'flex';
    } else {
      document.getElementById('form-y').value = '';
      document.getElementById('form-x').value = '';
      document.getElementById('form-coords-preview-group').style.display = 'none';
    }
  }

  // Hide lists and filters to let the form occupy the entire sidebar height
  document.querySelector('.filter-section').style.display = 'none';
  document.querySelector('.locations-section').style.display = 'none';

  // Show the form section inside the sidebar!
  formSection.style.display = 'flex';
  
  // Auto-focus first field
  document.getElementById('form-name-en').focus();

  // Scroll form container to the top
  form.scrollTop = 0;
}

// Close Location Form
function closeLocationForm() {
  const formSection = document.getElementById('sidebar-form-section');
  if (formSection.style.display === 'none') return; // already closed

  formSection.style.display = 'none';
  isRepositioningFromForm = false;

  // Restore lists and filters
  document.querySelector('.filter-section').style.display = 'block';
  document.querySelector('.locations-section').style.display = 'flex';
}

// Start repositioning from the active sidebar form
function startRepositioningMode() {
  isRepositioningFromForm = true;
  
  // Get active location name for custom HUD text
  const nameHe = document.getElementById('form-name-he').value.trim();
  const nameEn = document.getElementById('form-name-en').value.trim();
  const name = currentLang === 'he' ? (nameHe || 'מיקום חדש') : (nameEn || 'New Location');
  
  // Change mouse cursor to crosshair on map
  document.getElementById('map').style.cursor = 'crosshair';
  
  // Show Mapping HUD Banner
  const alertPanel = document.getElementById('mapping-alert-panel');
  document.getElementById('mapping-alert-text').innerHTML = `${t[currentLang].mappingAlertText} <strong>${name}</strong>`;
  alertPanel.style.display = 'flex';
}

// Handle Submission of the Location Details Form
function handleFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('form-id').value;
  const nameEn = document.getElementById('form-name-en').value.trim();
  const nameHe = document.getElementById('form-name-he').value.trim();
  const category = document.getElementById('form-category').value;
  const descEn = document.getElementById('form-desc-en').value.trim();
  const descHe = document.getElementById('form-desc-he').value.trim();
  const yVal = document.getElementById('form-y').value;
  const xVal = document.getElementById('form-x').value;
  
  const coords = yVal && xVal ? [parseInt(yVal), parseInt(xVal)] : null;

  if (id) {
    // Edit existing location
    const locIndex = locations.findIndex(l => l.id === id);
    if (locIndex !== -1) {
      locations[locIndex] = {
        ...locations[locIndex],
        name_en: nameEn,
        name_he: nameHe,
        category,
        desc_en: descEn,
        desc_he: descHe,
        coords
      };
      showToast(currentLang === 'he' ? 'המיקום עודכן בהצלחה' : 'Location updated successfully', 'success');
    }
  } else {
    // Create new location
    // Generate unique ID based on name or timestamp
    const generatedId = nameEn.toLowerCase().replace(/[^a-z0-9]/g, '_') || `loc_${Date.now()}`;
    
    // Check if ID already exists, append timestamp if so
    const finalId = locations.some(l => l.id === generatedId) ? `${generatedId}_${Date.now()}` : generatedId;

    const newLoc = {
      id: finalId,
      name_en: nameEn,
      name_he: nameHe,
      category,
      desc_en: descEn,
      desc_he: descHe,
      coords
    };
    locations.push(newLoc);
    showToast(currentLang === 'he' ? 'מיקום חדש נוסף בהצלחה' : 'New location added successfully', 'success');
  }

  closeLocationForm();
  saveLocations();
  renderLocationsList();
  renderMarkersOnMap();
  
  // If we added or edited coordinates, focus the map there
  if (coords) {
    const locId = id || locations[locations.length - 1].id;
    const loc = locations.find(l => l.id === locId);
    setTimeout(() => focusLocationOnMap(loc), 300);
  }
}

// Global functions exposed to window for inline HTML onclick calls in Popups
window.editLocation = function(locId) {
  map.closePopup();
  openLocationForm(locId);
};

window.deleteLocation = function(locId) {
  map.closePopup();
  const loc = locations.find(l => l.id === locId);
  const name = currentLang === 'he' ? loc.name_he : loc.name_en;
  
  if (confirm(`${t[currentLang].confirmDelete} (${name})`)) {
    locations = locations.filter(l => l.id !== locId);
    
    // Delete visual marker references
    if (markers[locId]) {
      map.removeLayer(markers[locId]);
      delete markers[locId];
    }
    
    showToast(t[currentLang].toastLocationDeleted, 'success');
    saveLocations();
    renderLocationsList();
    renderMarkersOnMap();
  }
};

// Save updated locations to Server (API) with Cloud Firestore & LocalStorage fallback
async function saveLocations() {
  // Always update LocalStorage as a local backup
  localStorage.setItem('wot_locations', JSON.stringify(locations));
  
  // If Google Firebase Cloud Firestore is initialized and active
  if (window.db) {
    try {
      const batch = db.batch();
      
      // Delete any locations from Firestore that were deleted locally
      const snapshot = await db.collection('locations').get();
      snapshot.forEach(doc => {
        const existsLocally = locations.some(l => l.id === doc.id);
        if (!existsLocally) {
          batch.delete(doc.ref);
        }
      });
      
      // Upsert all local locations into Firestore
      locations.forEach(loc => {
        const docRef = db.collection('locations').doc(loc.id);
        batch.set(docRef, loc);
      });
      
      await batch.commit();
      showToast(t[currentLang].toastSaveSuccess, 'success');
      return; // Saved successfully to Cloud database, skip local server request
    } catch (error) {
      console.error('Failed to save to Cloud Firestore. Falling back to local storage...', error);
      showToast(t[currentLang].toastSaveFallback, 'warning');
      return;
    }
  }

  // Local/Offline Fallback (Standard Node.js Server saving)
  try {
    const response = await fetch('/api/save-locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(locations)
    });
    
    if (response.ok) {
      showToast(t[currentLang].toastSaveSuccess, 'success');
    } else {
      throw new Error('Server returned non-success code');
    }
  } catch (error) {
    console.error('Failed to save to server, using LocalStorage fallback', error);
    showToast(t[currentLang].toastSaveFallback, 'warning');
  }
}

// Helper to show modern, floating Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  else if (type === 'error') iconClass = 'fa-circle-xmark';
  else if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Slide out and remove toast after 4.5 seconds
  setTimeout(() => {
    toast.style.transition = 'all 0.5s ease';
    toast.style.opacity = '0';
    toast.style.transform = currentLang === 'he' ? 'translateX(-100px)' : 'translateX(100px)';
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 500);
  }, 4500);
}

// Toggle Markers Visibility on Map Globally
function toggleMarkersVisibility() {
  showMarkers = !showMarkers;
  const btn = document.getElementById('toggle-markers-btn');
  
  if (showMarkers) {
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = `<i class="fa-solid fa-eye"></i>`;
    }
    showToast(currentLang === 'he' ? 'הסימניות מוצגות כעת במפה' : 'Markers are now visible on the map', 'success');
  } else {
    if (btn) {
      btn.classList.add('active');
      btn.innerHTML = `<i class="fa-solid fa-eye-slash"></i>`;
    }
    showToast(currentLang === 'he' ? 'הסימניות מוסתרות כעת מהמפה' : 'Markers are now hidden from the map', 'warning');
  }
  
  renderMarkersOnMap();
}

// Show Warning Banner if loaded from local file system (file://) instead of a server
function showProtocolWarning() {
  const warningDiv = document.createElement('div');
  warningDiv.className = 'protocol-warning-banner';
  
  const isHe = currentLang === 'he';
  warningDiv.innerHTML = isHe ? `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span><strong>שים לב:</strong> האתר נפתח כקובץ מקומי. שינויים שתבצע יישמרו בדפדפן בלבד. לשמירה לצמיתות בדיסק, אנא היכנס דרך השרת: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></span>
  ` : `
    <i class="fa-solid fa-triangle-exclamation"></i>
    <span><strong>Warning:</strong> Opened as local file. Changes will save to browser memory only. To persist to disk, access via server: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></span>
  `;
  
  document.body.insertBefore(warningDiv, document.body.firstChild);
}
