function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

let auth_code = get('access_token');
let cookie = getCookie('access_token');
if (cookie){
    auth_code = cookie;
}else{
    let url = new URL(window.location.href);
    auth_code = url.searchParams.get('access_token');
    if (!auth_code){
        self.location = './index.html?type=login';
    }
}
let user_id = null;
let playlist;
let total = 0;
let selected;
let obj;

console.log(auth_code);

    function requestName() {
        $.ajax({
            type: 'GET',
            url: 'https://api.spotify.com/v1/me',
            beforeSend: function(request) {
                request.setRequestHeader("Accept", "application/json");
                request.setRequestHeader("Content-Type", "application/json");
                request.setRequestHeader("Authorization", "Bearer " + auth_code)
            },
            processData: false,
            success: function (msg) {
                user_id = msg.id;
                requestPlaylistList();
            },
            error: function (msg) {
                apiCallCheck();
            }
        });
    }

    function requestPlaylistList(){
        $.ajax({
            type: 'GET',
            url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists?limit=50',
            beforeSend: function (request) {
                request.setRequestHeader("Accept", "application/json");
                request.setRequestHeader("Content-Type", "application/json");
                request.setRequestHeader("Authorization", "Bearer " + auth_code);
            },
            processData: false,
            success: function (msg) {
                total = msg.total;
                playlist = msg.items;

                if (msg.total > 50){
                    $.ajax({
                        type: 'GET',
                        url: 'https://api.spotify.com/v1/users/' + user_id + '/playlists?limit=50&=offset=50',
                        beforeSend: function (request) {
                            request.setRequestHeader("Accept", "application/json");
                            request.setRequestHeader("Content-Type", "application/json");
                            request.setRequestHeader("Authorization", "Bearer " + auth_code);
                        },
                        processData: false,
                        success: function (msg) {
                            playlist = playlist.concat.apply([], [playlist, msg.items])
                            sortAndDisplay();
                        },
                        error: function (msg) {
                            apiCallCheck();
                        }
                    });
                }
                sortAndDisplay();
            }
        });
    }

    function select(id) {
        let bar = document.getElementById('bottombar');
        bar.setAttribute('class', 'visiblebar');
        selected = id;
        if (bar){
            gatherTrackList();
        }
    }

    function gatherTrackList(){
        $.ajax({
            type: 'GET',
            url: 'https://api.spotify.com/v1/playlists/' + selected.id + '/tracks',
            beforeSend: function (request) {
                request.setRequestHeader('Accept', 'application/json');
                request.setRequestHeader('Content-Type', 'application/json');
                request.setRequestHeader('Authorization', 'Bearer ' +  auth_code);
            },
            processData: false,
            success: function (msg) {
                tracklist = msg.tracks
            }
        })
    }

    function sortAndDisplay(){
        document.getElementById("crawlbutton").setAttribute('style', 'display: none !important');
        const body = document.getElementById('div');
        body.setAttribute('style', "height: auto;");
        const table = document.createElement('table');
        let zeile = document.createElement('tr');
        let header = document.createElement('th');
        let content = document.createElement('td');

        if (document.getElementById('table')){
            document.getElementById('table').remove();
        }

        table.appendChild(zeile);
        zeile.appendChild(header).appendChild(document.createTextNode("Select a Playlist"));
        header = document.createElement('th');
        zeile.appendChild(header).appendChild(document.createTextNode(" "));
        table.setAttribute('id', 'table');
        body.appendChild(table);


        for (let i = 0; i < playlist.length; i++){
            let zeile = document.createElement('tr');
            let content = document.createElement('td');
            let a = document.createElement('a');
            table.appendChild(zeile);
            zeile.appendChild(content).appendChild(a).appendChild(document.createTextNode(playlist[i].name));
            content = document.createElement('td');
            a.setAttribute('href', playlist[i].external_urls.spotify);
            a.setAttribute('target', '_blank');
            content = document.createElement('td');
            content.setAttribute('class', 'selectcell');
            let p = document.createElement("a");
            p.setAttribute('id', 'select' + i);
            zeile.appendChild(content).appendChild(p);
            p.setAttribute('class', 'select');
            p.appendChild(document.createTextNode('[Select]'));
            p.setAttribute('href', 'javascript:void(0);');
            p.addEventListener('click', function (){
                select(i);
            });
        }
    }

    function addToSync(){
        let json = '{}';
        obj = JSON.parse(json);
        obj.name = user_id;
        obj.playlistname = playlist[selected].name;
        obj.playlist = playlist[selected].id;
        obj.url = playlist[selected].external_urls.spotify;
        obj.total = playlist[selected].tracks.total;
        createCookie('jstophp', JSON.stringify(obj), 1);
        alert(JSON.stringify(obj));
        alert(btoa(JSON.stringify(obj)));
        createCookie('user_task', btoa(JSON.stringify(obj)), 0.04097222222);
        self.location = './sync.html?' + 'access_token=' + auth_code + '&user=' + user_id + '&playlist_id=' + playlist[selected].id;
    }


document.getElementById('crawlbutton').addEventListener('click', function () {
    requestName();
});

document.getElementById('x').addEventListener('click', function () {
   document.getElementById('bottombar').setAttribute('class', 'bottombar');
});

document.getElementById('selection2').addEventListener('click', function () {
    addToSync();
});
