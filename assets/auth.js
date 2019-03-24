const app = new Vue({
    el: '#app',
    data() {
        return {
            client_id: 'c2fa136861e543df9f385991575a1534',
            scopes: 'playlist-read-private playlist-modify-public',
            redirect_uri: 'https://s.chulte.de/Spotify2Mp3/land.html',
            me: null
        }
    },
    methods: {
        login() {
            let popup = window.open(`https://accounts.spotify.com/authorize?client_id=${this.client_id}&response_type=token&redirect_uri=${this.redirect_uri}&scope=${this.scopes}&show_dialog=true`, 'Login with Spotify', 'width=800,height=600')

            window.spotifyCallback = (payload) => {
                popup.close();

                fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${payload}`
                    }
                }).then(response => {
                    return response.json()
                }).then(data => {
                    this.me = data
                })
            }
        }
    },
    mounted() {
        this.token = window.location.hash.substr(1).split('&')[0].split("=")[1];

        if (this.token) {
            window.opener.spotifyCallback(this.token)
        }
    }
});
