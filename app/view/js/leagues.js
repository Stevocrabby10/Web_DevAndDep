// leagues.js — client-side behaviour for viewing league standings and entering tournaments

document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.debug('leagues.js: DOMContentLoaded start');
    // global current user for card-level review permissions
    let pageCurrentUser = null;
    try {
      const r = await fetch('/current-user', { credentials: 'same-origin' });
      if (r && r.ok) {
        const j = await r.json().catch(() => ({}));
        pageCurrentUser = j && j.username ? j.username : null;
      }
    } catch (e) {
      pageCurrentUser = null;
    }

    const modal = document.getElementById('league-modal');
    const modalTitle = document.getElementById('league-modal-title');
    const modalBody = modal && modal.querySelector('.modal-body');
    const standingsTableBody = document.querySelector('#league-standings tbody');
    const enterBtn = document.getElementById('enter-tournament');
    const closeButtons = Array.from(document.querySelectorAll('.modal-close'));

  function openModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    // trap focus could be added here
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
  }

  // Close handlers
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  modal && modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Example: mock standings data (replace with fetch to API for real data)
  const mockStandings = {
    'dublin-city': [
      [1, 'John Smith', 12, 10, 2, 20],
      [2, 'Mary O\'Connor', 12, 9, 3, 18],
      [3, 'Liam O\'Brien', 12, 8, 4, 16],
      [4, 'Aoife Byrne', 12, 6, 6, 12],
      [5, 'Conor Walsh', 12, 4, 8, 8]
    ],
    'southside-arrows': [
      [1, 'James Murphy', 12, 11, 1, 22],
      [2, 'Claire Byrne', 12, 9, 3, 18],
      [3, 'Eoin Kelly', 12, 7, 5, 14],
      [4, 'Niamh Flaherty', 12, 5, 7, 10],
      [5, 'Patrick O\'Neill', 12, 3, 9, 6]
    ],
    'northside-premier': [
      [1, 'Michael Ryan', 12, 10, 2, 20],
      [2, 'Sarah Kelly', 12, 8, 4, 16],
      [3, 'Darragh Byrne', 12, 7, 5, 14],
      [4, 'Clare O\'Sullivan', 12, 5, 7, 10],
      [5, 'Tom Gallagher', 12, 2, 10, 4]
    ],
    'galway-bay': [
      [1, 'Siobhan Daly', 12, 9, 3, 18],
      [2, 'Brendan Nolan', 12, 8, 4, 16],
      [3, 'Orlaith Moran', 12, 7, 5, 14],
      [4, 'Ciaran Hughes', 12, 5, 7, 10],
      [5, 'Eimear Walsh', 12, 3, 9, 6]
    ],
    'connemara-championship': [
      [1, 'Padraig Kelly', 12, 10, 2, 20],
      [2, 'Maeve O\'Connor', 12, 9, 3, 18],
      [3, 'Ronan McCarthy', 12, 7, 5, 14],
      [4, 'Fiona Byrne', 12, 6, 6, 12],
      [5, 'Sean O\'Rourke', 12, 4, 8, 8]
    ],
    'west-galway-arrows': [
      [1, 'Declan Fox', 12, 11, 1, 22],
      [2, 'Aoibhinn Kelly', 12, 9, 3, 18],
      [3, 'Niall Ryan', 12, 7, 5, 14],
      [4, 'Sara O\'Leary', 12, 5, 7, 10],
      [5, 'Kieran Doyle', 12, 2, 10, 4]
    ],
    'rebel-county': [
      [1, 'Eoghan Murphy', 12, 10, 2, 20],
      [2, 'Roisin O\'Brien', 12, 8, 4, 16],
      [3, 'Cormac O\'Sullivan', 12, 7, 5, 14],
      [4, 'Siun O\'Neill', 12, 5, 7, 10],
      [5, 'Dermot Walsh', 12, 3, 9, 6]
    ],
    'cork-harbour-arrows': [
      [1, 'Micheal O\'Leary', 12, 11, 1, 22],
      [2, 'Una Fitzgerald', 12, 9, 3, 18],
      [3, 'Padraig O\'Sullivan', 12, 7, 5, 14],
      [4, 'Sinead Kearney', 12, 5, 7, 10],
      [5, 'Luka Byrne', 12, 4, 8, 8]
    ],
    'east-cork-premier': [
      [1, 'Tommy O\'Connor', 12, 10, 2, 20],
      [2, 'Emma Riordan', 12, 9, 3, 18],
      [3, 'Gareth Flynn', 12, 7, 5, 14],
      [4, 'Orla Keane', 12, 6, 6, 12],
      [5, 'Conall Hayes', 12, 4, 8, 8]
    ],
    'wexford-town': [
      [1, 'Aisling Byrne', 12, 11, 1, 22],
      [2, 'Ronan Kehoe', 12, 9, 3, 18],
      [3, 'Nora Flynn', 12, 7, 5, 14],
      [4, 'Ethan McGrath', 12, 5, 7, 10],
      [5, 'Maya O\'Connor', 12, 2, 10, 4]
    ],
    'enniscorthy-championship': [
      [1, 'Dara O\'Shea', 12, 10, 2, 20],
      [2, 'Bridget Kavanagh', 12, 9, 3, 18],
      [3, 'Leo Brennan', 12, 8, 4, 16],
      [4, 'Orlaith Byrne', 12, 6, 6, 12],
      [5, 'Finbar O\'Donnell', 12, 4, 8, 8]
    ],
    'rosslare-harbour': [
      [1, 'Cillian Murphy', 12, 11, 1, 22],
      [2, 'Saoirse Nolan', 12, 9, 3, 18],
      [3, 'Jackie O\'Keeffe', 12, 7, 5, 14],
      [4, 'Marta Lopez', 12, 5, 7, 10],
      [5, 'Rory Byrne', 12, 3, 9, 6]
    ],
    'dublin-west': [
      [1, 'Fiona McDonagh', 12, 10, 2, 20],
      [2, 'Aiden Donnelly', 12, 9, 3, 18],
      [3, 'Sinead O\'Reilly', 12, 7, 5, 14],
      [4, 'Derek Farrell', 12, 5, 7, 10],
      [5, 'Emma Conroy', 12, 3, 9, 6]
    ],
    'dublin-elite': [
      [1, 'Victor O\'Brien', 12, 11, 1, 22],
      [2, 'Hannah Murphy', 12, 10, 2, 20],
      [3, 'Ronan Kennedy', 12, 8, 4, 16],
      [4, 'Aoife Ryan', 12, 6, 6, 12],
      [5, 'Seamus O\'Neil', 12, 3, 9, 6]
    ],
    'galway-east': [
      [1, 'Marcus Healy', 12, 9, 3, 18],
      [2, 'Orla Flanagan', 12, 8, 4, 16],
      [3, 'Shane Hogan', 12, 7, 5, 14],
      [4, 'Cara Lynch', 12, 5, 7, 10],
      [5, 'Paddy Walsh', 12, 4, 8, 8]
    ],
    'galway-pro': [
      [1, 'Trevor Shannon', 12, 11, 1, 22],
      [2, 'Judith O\'Malley', 12, 9, 3, 18],
      [3, 'Cian Moran', 12, 8, 4, 16],
      [4, 'Sophie Collins', 12, 6, 6, 12],
      [5, 'Brendan Kelly', 12, 3, 9, 6]
    ],
    'cork-midleton': [
      [1, 'Gearoid Fitzgerald', 12, 10, 2, 20],
      [2, 'Siobhan O\'Driscoll', 12, 9, 3, 18],
      [3, 'Danny Buckley', 12, 7, 5, 14],
      [4, 'Lisa Carew', 12, 5, 7, 10],
      [5, 'Christy Daly', 12, 2, 10, 4]
    ],
    'cork-elite': [
      [1, 'Noel O\'Callaghan', 12, 11, 1, 22],
      [2, 'Kathryn Regan', 12, 10, 2, 20],
      [3, 'Brian McCarthy', 12, 8, 4, 16],
      [4, 'Mairead Corkery', 12, 6, 6, 12],
      [5, 'Paul Egan', 12, 3, 9, 6]
    ],
    'wexford-county': [
      [1, 'Sean O\'Toole', 12, 10, 2, 20],
      [2, 'Alanna Walsh', 12, 8, 4, 16],
      [3, 'Martin Butler', 12, 7, 5, 14],
      [4, 'Niamh Nolan', 12, 5, 7, 10],
      [5, 'Barry Doolan', 12, 3, 9, 6]
    ],
    'wexford-pro': [
      [1, 'Colm Murphy', 12, 11, 1, 22],
      [2, 'Lorraine O\'Brien', 12, 9, 3, 18],
      [3, 'Gary Malone', 12, 8, 4, 16],
      [4, 'Deirdre Scanlon', 12, 6, 6, 12],
      [5, 'Liam Byrne', 12, 2, 10, 4]
    ],
    // fallback default (shouldn't show now that all leagues are defined)
    'default': [
      [1, 'Player 1', 10, 8, 2, 16],
      [2, 'Player 2', 10, 6, 4, 12],
      [3, 'Player 3', 10, 5, 5, 10],
      [4, 'Player 4', 10, 3, 7, 6],
      [5, 'Player 5', 10, 1, 9, 2]
    ]
  };

  // When user clicks a view-league button
  document.querySelectorAll('.view-league').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      console.log('view-league clicked:', btn.dataset.league);
      try {
        // defensive: ensure modal elements exist
        if (!modal || !modalTitle || !standingsTableBody || !enterBtn) throw new Error('Modal elements missing');
      } catch (err) {
        console.error('leagues.js: modal open aborted -', err);
        return;
      }
      const league = btn.dataset.league;
      const article = btn.closest('.league-card');
      const titleEl = article && article.querySelector('h3');
      const venueEl = article && article.querySelector('.league-venue');
      const title = titleEl ? titleEl.textContent.trim() : 'League Standings';
      const venue = venueEl ? venueEl.textContent.trim() : '';

      modalTitle.textContent = title;
      const venueP = document.getElementById('league-venue');
      venueP.textContent = venue;

      // try to get current username to highlight and to check membership
      // reuse the value fetched at page load to avoid repeated 401s
      let currentUser = pageCurrentUser;

      // populate standings — try API first, fallback to mock data
      let standings = [];
      try {
        const sres = await fetch('/api/league/' + encodeURIComponent(league), { credentials: 'same-origin' });
        if (sres.ok) {
          const payload = await sres.json().catch(() => null);
          if (payload && Array.isArray(payload.standings)) {
            standings = payload.standings.map((r, i) => {
              const wins = r.wins || 0;
              const losses = r.losses || 0;
              const matches = r.matches || (wins + losses) || 0;
              return [r.position || (i + 1), r.username || r.name || '', matches, wins, losses, r.points || 0];
            });
          }
        }
      } catch (err) {
        console.warn('Could not fetch standings from API, falling back to mock:', err);
      }

      if (!standings || standings.length === 0) standings = mockStandings[league] || mockStandings['default'];
      standingsTableBody.innerHTML = '';
      standings.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row[0] || ''}</td><td>${escapeHtml(row[1] || '')}</td><td>${row[2] || 0}</td><td>${row[3] || 0}</td><td>${row[4] || 0}</td><td>${row[5] || 0}</td>`;
        // highlight current user if names match
        try {
          if (currentUser && row[1] && row[1].toLowerCase().includes(currentUser.toLowerCase())) {
            tr.classList.add('you');
          }
        } catch (e) {}
        standingsTableBody.appendChild(tr);
      });

      // configure enter button — check auth and POST to join endpoint
      // show joined state only for the current league (dataset.joinedSlug)
      if (enterBtn.dataset.joinedSlug === league) {
        enterBtn.textContent = 'Already Joined';
        enterBtn.disabled = true;
        enterBtn.onclick = null;
      } else {
        enterBtn.textContent = 'Enter Tournament';
        enterBtn.disabled = false;
      }

      enterBtn.onclick = async () => {
        // prevent double-clicks if already disabled or already joined for this league
        if (enterBtn.disabled || enterBtn.dataset.joinedSlug === league) return;
        enterBtn.disabled = true;
        try {
          const res = await fetch('/user/join-league', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: league })
          });

          if (res.status === 401) {
            // not authenticated — redirect to login/profile which shows login form
            window.location.href = '/profile';
            return;
          }

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            console.error('Join failed', data);
            alert(data.msg || 'Could not join league');
            return;
          }

          // Get username if not included
          let username = data.username;
          if (!username) {
            const ures = await fetch('/current-user', { credentials: 'same-origin' }).catch(() => null);
            if (ures && ures.ok) {
              const ujson = await ures.json().catch(() => ({}));
              username = ujson.username || 'You';
            } else {
              username = 'You';
            }
          }

          // Append a placeholder row at the bottom with 0 stats
          const pos = standingsTableBody.querySelectorAll('tr').length + 1;
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${pos}</td><td>${escapeHtml(username)}</td><td>0</td><td>0</td><td>0</td><td>0</td>`;
          tr.classList.add('you');
          standingsTableBody.appendChild(tr);
          // mark this league as joined for this button
          enterBtn.textContent = data.alreadyJoined ? 'Already Joined' : 'Joined';
          enterBtn.dataset.joinedSlug = league;
          // disable future clicks for this league
          enterBtn.onclick = null;
          enterBtn.disabled = true;
        } catch (err) {
          console.error('Error joining league', err);
          alert('Error joining league');
        } finally {
          // keep disabled state if joined for this league, otherwise re-enable
          if (enterBtn.dataset.joinedSlug !== league) enterBtn.disabled = false;
        }
      };

      console.log('opening modal for', league);
      openModal();
    });
    });
    // --- Per-card reviews: fetch and render a short summary on each league card ---
    try {
      const cards = Array.from(document.querySelectorAll('.league-card'));
      await Promise.all(cards.map(async (card) => {
        try {
          const slug = card.getAttribute('data-league');
          if (!slug) return;
          const resp = await fetch('/api/league/' + encodeURIComponent(slug) + '/reviews', { credentials: 'same-origin' });
          if (!resp.ok) return;
          let reviews = await resp.json().catch(() => null);
          if (!Array.isArray(reviews)) reviews = [];
          // create or reuse container
          let container = card.querySelector('.card-reviews');
          if (!container) {
            container = document.createElement('div');
            container.className = 'card-reviews';
            container.style.marginTop = '8px';
            container.style.fontSize = '0.9em';
            const actions = card.querySelector('.card-actions') || card.querySelector('.league-meta') || card;
            actions.appendChild(container);
          } else {
            container.innerHTML = '';
          }
          // show up to 2 recent reviews (may be empty)
          const list = document.createElement('div');
          reviews.slice(0,2).forEach(r => {
            const rev = document.createElement('div');
            rev.style.borderTop = '1px solid #eee';
            rev.style.paddingTop = '6px';
            const who = document.createElement('strong');
            who.textContent = r.username || r.user || 'Anonymous';
            const text = document.createElement('div');
            text.textContent = r.text || r.comment || '';
            text.style.marginTop = '4px';
            rev.appendChild(who);
            const meta = document.createElement('span');
            meta.style.marginLeft = '8px';
            meta.style.color = '#666';
            if (r.rating != null) meta.textContent = 'Rating: ' + r.rating;
            rev.appendChild(meta);
            rev.appendChild(text);

            // owner controls (edit + delete)
            if (pageCurrentUser && (r.username === pageCurrentUser || r.user === pageCurrentUser)) {
              const ctrl = document.createElement('div');
              ctrl.style.marginTop = '6px';
              // Edit
              const edit = document.createElement('button');
              edit.textContent = 'Edit';
              edit.style.marginRight = '6px';
              edit.addEventListener('click', () => {
                // Replace text with inline editor
                const textarea = document.createElement('textarea');
                textarea.value = r.text || r.comment || '';
                textarea.rows = 3;
                textarea.style.width = '100%';
                const ratingInput = document.createElement('input');
                ratingInput.type = 'number';
                ratingInput.min = 0; ratingInput.max = 5;
                ratingInput.value = r.rating != null ? r.rating : 0;
                ratingInput.style.width = '60px';
                const save = document.createElement('button');
                save.textContent = 'Save';
                save.style.marginRight = '6px';
                const cancel = document.createElement('button');
                cancel.textContent = 'Cancel';
                // swap nodes
                rev.replaceChild(textarea, text);
                ctrl.style.display = 'none';
                const editControls = document.createElement('div');
                editControls.style.marginTop = '6px';
                editControls.appendChild(ratingInput);
                editControls.appendChild(save);
                editControls.appendChild(cancel);
                rev.appendChild(editControls);

                save.addEventListener('click', async () => {
                  try {
                    const payload = { rating: parseInt(ratingInput.value, 10) || 0, text: textarea.value };
                    const uresp = await fetch('/api/reviews/' + encodeURIComponent(r.id || r.reviewId || r.idReview), {
                      method: 'PUT',
                      credentials: 'same-origin',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload)
                    });
                    if (!uresp.ok) { alert('Could not update review'); return; }
                    // update DOM
                    r.rating = payload.rating;
                    r.text = payload.text;
                    meta.textContent = 'Rating: ' + r.rating;
                    text.textContent = r.text;
                    rev.replaceChild(text, textarea);
                    editControls.remove();
                    ctrl.style.display = '';
                  } catch (e) { console.error('Update failed', e); alert('Update failed'); }
                });

                cancel.addEventListener('click', () => {
                  rev.replaceChild(text, textarea);
                  editControls.remove();
                  ctrl.style.display = '';
                });
              });

              // Delete
              const del = document.createElement('button');
              del.textContent = 'Delete';
              del.style.marginRight = '6px';
              del.addEventListener('click', async () => {
                try {
                  const dresp = await fetch('/api/reviews/' + encodeURIComponent(r.id || r.reviewId || r.idReview), {
                    method: 'DELETE',
                    credentials: 'same-origin'
                  });
                  if (dresp.ok) {
                    rev.remove();
                  } else {
                    alert('Could not delete review');
                  }
                } catch (e) { console.error('Delete review failed', e); alert('Delete failed'); }
              });

              ctrl.appendChild(edit);
              ctrl.appendChild(del);
              rev.appendChild(ctrl);
            }

            list.appendChild(rev);
          });

          // If no reviews, show placeholder
          if (reviews.length === 0) {
            const none = document.createElement('div');
            none.style.color = '#666';
            none.style.fontStyle = 'italic';
            none.style.marginTop = '6px';
            none.textContent = 'No reviews yet.';
            list.appendChild(none);
          }

          // If logged in, allow adding a review from the card
          if (pageCurrentUser) {
            const addWrap = document.createElement('div');
            addWrap.style.marginTop = '8px';
            const addBtn = document.createElement('button');
            addBtn.textContent = 'Add review';
            addBtn.className = 'btn btn-sm';
            addWrap.appendChild(addBtn);
            addBtn.addEventListener('click', () => {
              addBtn.disabled = true;
              const form = document.createElement('div');
              const ratingInput = document.createElement('input');
              ratingInput.type = 'number'; ratingInput.min = 0; ratingInput.max = 5; ratingInput.value = 5; ratingInput.style.width = '60px';
              const ta = document.createElement('textarea'); ta.rows = 3; ta.style.width = '100%';
              const submit = document.createElement('button'); submit.textContent = 'Submit'; submit.style.marginRight = '6px';
              const cancel = document.createElement('button'); cancel.textContent = 'Cancel';
              form.appendChild(ratingInput); form.appendChild(submit); form.appendChild(cancel); form.appendChild(ta);
              addWrap.appendChild(form);

              cancel.addEventListener('click', () => { form.remove(); addBtn.disabled = false; });
              submit.addEventListener('click', async () => {
                try {
                  const payload = { rating: parseInt(ratingInput.value, 10) || 0, text: ta.value };
                  const presp = await fetch('/api/league/' + encodeURIComponent(slug) + '/reviews', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  if (!presp.ok) { alert('Could not create review'); return; }
                  const j = await presp.json().catch(() => ({}));
                  const newId = j.id || j.insertId || null;
                  const newR = { id: newId, username: pageCurrentUser, rating: payload.rating, text: payload.text };
                  // prepend to list
                  const newDiv = document.createElement('div');
                  newDiv.style.borderTop = '1px solid #eee'; newDiv.style.paddingTop = '6px';
                  const who = document.createElement('strong'); who.textContent = newR.username;
                  const meta = document.createElement('span'); meta.style.marginLeft = '8px'; meta.style.color = '#666'; meta.textContent = 'Rating: ' + newR.rating;
                  const txt = document.createElement('div'); txt.style.marginTop = '4px'; txt.textContent = newR.text;
                  newDiv.appendChild(who); newDiv.appendChild(meta); newDiv.appendChild(txt);
                  // add owner controls (delete/edit)
                  const ownerCtrl = document.createElement('div'); ownerCtrl.style.marginTop = '6px';
                  const delB = document.createElement('button'); delB.textContent = 'Delete'; delB.style.marginRight = '6px';
                  delB.addEventListener('click', async () => {
                    const dresp = await fetch('/api/reviews/' + encodeURIComponent(newR.id), { method: 'DELETE', credentials: 'same-origin' });
                    if (dresp.ok) newDiv.remove(); else alert('Could not delete');
                  });
                  ownerCtrl.appendChild(delB);
                  newDiv.appendChild(ownerCtrl);
                  list.insertBefore(newDiv, list.firstChild);
                  form.remove(); addBtn.disabled = false;
                } catch (e) { console.error('Create review failed', e); alert('Create failed'); }
              });
            });
            container.appendChild(addWrap);
          }

          container.appendChild(list);
        } catch (e) { /* ignore per-card failures */ }
      }));
    } catch (e) { console.warn('card reviews load failed', e); }
    console.debug('leagues.js: DOMContentLoaded end');
  } catch (err) {
    console.error('leagues.js top-level error:', err);
  }
  });

// If loaded with ?league=slug open that league's modal automatically
try {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('league');
  if (slug) {
    // wait briefly for DOM and scripts to initialize
    window.addEventListener('load', () => {
      try {
        const btn = document.querySelector(`.view-league[data-league="${slug}"]`);
        if (btn) {
          // Simulate click to open modal
          btn.click();
        }
      } catch (e) {
        console.warn('leagues.js: could not auto-open league modal for', slug, e);
      }
    });
  }
} catch (e) { console.error('leagues.js auto-open error', e); }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }


// --- Search & filter for league cards ---
document.addEventListener('DOMContentLoaded', function () {
  try {
  const searchInput = document.getElementById('leagueSearch');
  const locationSelect = document.getElementById('locationFilter') || document.getElementById('areaFilter');
  console.debug('leagues.js: searchInput=', !!searchInput, 'locationSelect=', !!locationSelect);

  function matchesQuery(card, q) {
    const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    const qstr = normalize(q);
    if (!qstr) return true;
    const name = normalize(card.querySelector('h3') && card.querySelector('h3').textContent);
    const venue = normalize(card.querySelector('.league-venue') && card.querySelector('.league-venue').textContent);
    const data = normalize(card.getAttribute('data-league'));
    const infoText = normalize(Array.from(card.querySelectorAll('.info-item')).map(n => n.textContent).join(' '));

    // Match normalized tokens — also allow matches when dashes/spaces differ
    return name.includes(qstr) || venue.includes(qstr) || data.includes(qstr) || infoText.includes(qstr);
  }

  function matchesLocation(section, card, loc) {
    if (!loc) return true;
    const locLower = loc.toLowerCase();
    // Check section id first, then card info text
    const secId = (section.id || '').toLowerCase();
    if (secId.includes(locLower)) return true;
    const infoText = Array.from(card.querySelectorAll('.info-item')).map(n => n.textContent.toLowerCase()).join(' ');
    if (infoText.includes(locLower)) return true;
    return false;
  }

  function filter() {
    const q = searchInput ? searchInput.value : '';
    console.debug('leagues.js filter run; query="' + q + '" loc="' + (locationSelect ? locationSelect.value : '') + '"');
    const loc = locationSelect ? locationSelect.value : '';
    const sections = document.querySelectorAll('section.leagues-by-area');
    let anyVisibleOverall = false;

    // First: show/hide cards based on query+location
    sections.forEach(section => {
      const cards = Array.from(section.querySelectorAll('.league-card'));
      cards.forEach(card => {
        const show = matchesQuery(card, q) && matchesLocation(section, card, loc);
        card.style.display = show ? '' : 'none';
      });
    });

    // (deduplication removed to avoid hiding matches unexpectedly)

    // Deduplicate visible cards across all sections (keep first occurrence)
    const visibleCards = Array.from(document.querySelectorAll('.league-card')).filter(c => c.style.display !== 'none');
    const normalizeKey = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const seen = new Set();
    visibleCards.forEach(card => {
      const key = normalizeKey(card.getAttribute('data-league') || (card.querySelector('h3') && card.querySelector('h3').textContent) || '');
      if (!key) return;
      if (seen.has(key)) {
        // hide duplicates, keep first occurrence
        card.style.display = 'none';
      } else {
        seen.add(key);
      }
    });

    // Now recompute per-section visibility and hide navs for empty sections
    sections.forEach(section => {
      const cards = Array.from(section.querySelectorAll('.league-card'));
      const visible = cards.filter(c => c.style.display !== 'none');
      const anyVisibleInSection = visible.length > 0;
      section.style.display = anyVisibleInSection ? '' : 'none';
      const nav = section.querySelector('.carousel-nav');
      if (nav) nav.style.display = anyVisibleInSection ? '' : 'none';
      if (anyVisibleInSection) anyVisibleOverall = true;
    });

    // no-results message
    let noEl = document.getElementById('leaguesNoResults');
    if (!noEl) {
      noEl = document.createElement('p');
      noEl.id = 'leaguesNoResults';
      noEl.style.margin = '16px';
      noEl.style.color = '#666';
      const main = document.querySelector('main');
      main.insertBefore(noEl, main.querySelector('section'));
    }
    noEl.textContent = anyVisibleOverall ? '' : 'No leagues match your search/filter.';
  }

  if (searchInput) searchInput.addEventListener('input', filter);
  if (locationSelect) locationSelect.addEventListener('change', filter);
  setTimeout(filter, 100);
  } catch (err) {
    console.error('leagues.js search/filter setup error:', err);
  }
});
