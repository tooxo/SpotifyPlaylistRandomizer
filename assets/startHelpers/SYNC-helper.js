let user_task = atob(fixEnc(getCookie("user_task")));

auth_code = get("access_token");
user_task = JSON.parse(user_task);
let username = user_task.name;
let playlistname = user_task.playlistname;
let playlist = user_task.playlist;
let url = user_task.url;
let total = user_task.total;
let backupname = playlistname + "_backup";
let backupid = "";

function setText(text){
  document.getElementById("infotext").innerHTML = text;
}

async function error(){
  setText("An Error Occured. Redirecting in 3...");
  await sleep(3000);
  self.location = "./index.html";
}

function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

let rounds = roundUp(total / 100, 0) * 100;
let tracklist = [];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

async function noTracklist(offset){
  let current = 0;
  big:
  while (current < offset){
    $.ajax({
        type: 'GET',
        url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks?limit=100&offset=' + current,
        beforeSend: function (request) {
            request.setRequestHeader('Accept', 'application/json');
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestHeader('Authorization', 'Bearer ' +  auth_code);
        },
        processData: false,
        success: function (msg) {
            for (track in msg.items){
              tracklist.push(msg.items[track]);
            }
        },
        error: function (request, status, error) {
          error();
        }
    })
    current = current + 100;
    while (tracklist.length < current){
      await sleep(200);
      if (current > total){
        break big;
      }
    }
  }
  randomize();
}

async function backup(offset){
  let current = 0;
  big:
  while (current < offset){
    $.ajax({
        type: 'GET',
        url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks?limit=100&offset=' + current,
        beforeSend: function (request) {
            request.setRequestHeader('Accept', 'application/json');
            request.setRequestHeader('Content-Type', 'application/json');
            request.setRequestHeader('Authorization', 'Bearer ' +  auth_code);
        },
        processData: false,
        success: function (msg) {
            for (track in msg.items){
              tracklist.push(msg.items[track]);
            }
        },
        error: function (request, status, error) {
          error();
        }
    })
    current = current + 100;
    while (tracklist.length < current){
      await sleep(200);
      if (current > total){
        break big;
      }
    }
  }
  current = 0;
  let idlist = [];
  for (song in tracklist){
    idlist.push(tracklist[song].track.uri);
  }

  $.ajax({
    type: 'POST',
    url: 'https://api.spotify.com/v1/users/' + username + "/playlists",
    beforeSend: function(request) {
      request.setRequestHeader('Content-Type', 'application/json');
      request.setRequestHeader('Authorization', 'Bearer ' + auth_code);
    },
    data: '{"name": "' + backupname + '"}',
    success: function(msg) {
      backupid = msg.id;
    },
    error: function (request, status, error) {
      error();
    }
    });
  let splitten = [];
  await sleep(200);
  let o = 100;
  while (idlist.slice(o - 100, o) != 0){
    for (id in idlist.slice(o - 100, o)){
      splitten.push(idlist.slice(o-100, o)[id]);
    }

    $.ajax({
      type: 'POST',
      url: 'https://api.spotify.com/v1/playlists/' + backupid + '/tracks',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', 'Bearer ' + auth_code);
      },
      data: '{"uris": ["' + splitten.join('","') + '"]}',
      success: function(msg){
      },
      error: function (request, status, error) {
        error();
      }
    });
    o = o + 100;
    splitten = [];
    await sleep(200);
  }
  setText("Backup Done. Going to Randomize!");
  document.getElementById("nameinput").setAttribute("style", "display: none");
  document.getElementById("randomize").setAttribute("style", "");
}

async function randomize(){
  let idlist = [];
  for (song in tracklist){
    idlist.push(tracklist[song].track.uri);
  }
  let splitten = [];
  let o = 100;
  while (idlist.slice(o - 100, o) != 0){
    for (id in idlist.slice(o - 100, o)){
      splitten.push('{"uri": "' + idlist.slice(o-100, o)[id] + '"}');
    }
    $.ajax({
      type: 'DELETE',
      url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', 'Bearer ' + auth_code);
      },
      data: '{"tracks": [' + splitten.join(",") + ']}',
      success: function(msg){},
      error: function (request, status, error) {
        error();
      }
    });
    o = o + 100;
    splitten = [];
    await sleep(200);
  }

  idlist_shuffled = shuffle(idlist);
  splitten = [];
  o = 100;
  while (idlist_shuffled.slice(o - 100, o) != 0){
    for (id in idlist_shuffled.slice(o - 100, o)){
      splitten.push(idlist_shuffled.slice(o-100, o)[id]);
    }
    $.ajax({
      type: 'POST',
      url: 'https://api.spotify.com/v1/playlists/' + playlist + '/tracks',
      beforeSend: function(request) {
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Authorization', 'Bearer ' + auth_code);
      },
      data: '{"uris": ["' + splitten.join('","') + '"]}',
      success: function(msg){
      },
      error: function (request, status, error) {
        error();
      }
    });
    o = o + 100;
    splitten = [];
    await sleep(200);
  }
  setText("Randomizing Done! Thanks for using my service.");
}

function yes(){
  setText("Doing an Backup...");
  document.getElementById("buttons").setAttribute("hidden", "true");
  document.getElementById("nameinput").setAttribute("style", "");
  let input = document.getElementById("inputfield");
  input.setAttribute("value", backupname);
}

function confirm(){
  document.getElementById("confirm").setAttribute('hidden', 'true');
  backupname = $("#inputfield").val();
  backup(rounds);
}

function no(){
  setText("Randomizing...");
  document.getElementById("buttons").setAttribute("hidden", "true");
  noTracklist(rounds);
}

document.getElementById('yes').addEventListener('click', function(){
  yes();
});

document.getElementById('no').addEventListener('click', function(){
  no();
});

document.getElementById('confirm').addEventListener('click', function(){
  confirm();
});

document.getElementById('randomizebutton').addEventListener('click', function(){
  setText("Randomizing...")
  document.getElementById("randomizebutton").setAttribute("style", "display: none;");
  randomize();
});
