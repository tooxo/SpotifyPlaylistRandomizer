
document.getElementById('loginbutton').addEventListener("click", function(){
  let scopes = 'playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative';
  let client_id = '*';
  redirect_uri = 'https://s.chulte.de/SpotifyPlaylistRandomizer/land.html?'
  url = 'https://accounts.spotify.com/authorize?response_type=token&client_id=' + client_id + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(redirect_uri);

  self.location = url;
});
