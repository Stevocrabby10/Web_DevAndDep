// leagues.js — client-side behaviour for viewing league standings and entering tournaments

document.addEventListener('DOMContentLoaded', () => {
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
    btn.addEventListener('click', (e) => {
      console.log('view-league clicked:', btn.dataset.league);
      try {
        // defensive: ensure modal elements exist
        if (!modal || !modalTitle || !standingsTableBody) throw new Error('Modal elements missing');
      } catch (err) {
        console.error(err);
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

      // populate standings
      const standings = mockStandings[league] || mockStandings['default'];
      standingsTableBody.innerHTML = '';
      standings.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${row[0]}</td><td>${escapeHtml(row[1])}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td>`;
        standingsTableBody.appendChild(tr);
      });

      // configure enter button — for now navigate to a placeholder URL
      enterBtn.onclick = () => {
        // in a real app this would POST to an API or navigate to an authenticated flow
        window.location.href = `/tournament/enter?league=${encodeURIComponent(league)}`;
      };

      console.log('opening modal for', league);
      openModal();
    });
  });

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

});
