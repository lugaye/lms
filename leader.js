function fetchLeaderboardData() {
  // Make AJAX request to fetch leaderboard data from server
  fetch('/leaderboard')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.json();
      })
      .then(data => {
          // Display leaderboard data on the page
          displayLeaderboardData(data);
      })
      .catch(error => {
          console.error('Error fetching leaderboard data:', error);
      });
}

function displayLeaderboardData(leaderboardData) {
  // Get the leaderboard element
  const leaderboardElement = document.getElementById('leaderboard');
  // Clear previous content
  leaderboardElement.innerHTML = '';

  // Create a table to display leaderboard data
  const table = document.createElement('table');
  table.innerHTML = `
      <tr>
          <th>Rank</th>
          <th>Name</th>
          <th>Score</th>
      </tr>
  `;

  // Loop through the leaderboard data and add rows to the table
  leaderboardData.forEach((entry, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${index + 1}</td>
          <td>${entry.name}</td>
          <td>${entry.score}</td>
      `;
      table.appendChild(row);
  });

  // Append the table to the leaderboard element
  leaderboardElement.appendChild(table);
}