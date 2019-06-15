const express = require('express');
const cookieParser = require('cookie-parser');
const mongo = require('mongodb').MongoClient;
const axios = require('axios');
const jsdom = require("jsdom");
const {
    JSDOM
} = jsdom;
const queue = require('queue');

const mongourl = 'mongodb://mongo:27017';

let mongoclient = undefined;
let db;
let collection;
let collection_tasks;
mongo.connect(mongourl, (err, client) => {
    mongoclient = client;
    db = mongoclient.db('spotifyplaylistrandomizer');
    collection = db.collection('accounts');
    collection_tasks = db.collection('tasks')
});

const PORT = 8080;
const HOST = '0.0.0.0';
const client_id = process.env.SPOTIFY_CLIENT_ID;

const app = express();
const path = require('path');
app.use(cookieParser());

app.get('/select', (req, res) => {
    let auth = req.cookies.auth;
    collection.findOne({
        'auth': auth
    }, (err, result) => {
        let access_token;
        try {
            access_token = result.access_token;
        } catch (e) {
            res.send("<h1>Error, Redirecting to Homepage.</h1><script>setTimeout(function() {self.location = '/'}, 2500);</script>");
        }
        JSDOM.fromFile("static/land.html", {runScripts: 'dangerously'}).then(dom => {
            axios.get("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: "Bearer " + access_token,
                    Accept: "application/json"
                }
            }).then(response => {
                axios.get('https://api.spotify.com/v1/users/' + response.data.id + '/playlists?limit=50', {
                    headers: {
                        Authorization: "Bearer " + access_token,
                        Accept: "application/json"
                    }
                }).then(response => {
                    let playlist = response.data.items;
                    let document = dom.window.document;
                    let tablediv = document.getElementById('tablediv');
                    tablediv.setAttribute('style', "");
                    //document.getElementById('div').setAttribute('style', 'display: none;');

                    const table = document.createElement('table');
                    let zeile = document.createElement('tr');
                    let header = document.createElement('th');
                    let content = document.createElement('td');

                    table.appendChild(zeile);
                    zeile.appendChild(header).appendChild(document.createTextNode("Select a Playlist"));
                    header = document.createElement('th');
                    zeile.appendChild(header).appendChild(document.createTextNode(" "));
                    table.setAttribute('id', 'table');
                    tablediv.appendChild(table);


                    for (let i = 0; i < playlist.length; i++) {
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
                        zeile.setAttribute("id", "line" + i);
                        p.setAttribute('class', 'select');
                        p.appendChild(document.createTextNode('[Select]'));
                        p.setAttribute('href', 'javascript:void(1);');
                        p.setAttribute('onclick',
                            'select(' + i + ', "' + playlist[i].id + '");'
                        );
                    }

                    res.send(dom.serialize());
                });
            })
                .catch((error) => {
                    res.send("<h1>Failing Auth, Redirecting to HomePage. Please log into Spotify again.</h1><script>setTimeout(function() {self.location = '/'}, 2500);</script>");
                });
        });
    });
});

app.get('/randomize', (req, res) => {
    let auth = req.cookies.auth;
    collection.findOne({
        'auth': auth
    }, function (err, document) {
        if (!document) {
            return;
        }
        let tk = document.access_token;
        let spotify_id = req.query.spotify;
        axios.get("https://api.spotify.com/v1/playlists/" + spotify_id, {
            headers: {
                Authorization: 'Bearer ' + tk
            }
        }).then(response => {
            let total = response.data.tracks.total;
            JSDOM.fromFile("static/sync.html", {}).then(dom => {
                let document = dom.window.document;
                let element = document.createElement("info");
                element.setAttribute("id", "infoelement");
                element.setAttribute("spotify", spotify_id);
                element.setAttribute("total", total);
                document.body.appendChild(element);
                res.send(dom.serialize());
            });
        }).catch(error => {
            console.log(error);
        });
    });
});

function makeid(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function addTokenToMongo(token) {
    collection.insertOne({
        'auth': token
    }, (err, result) => {
        if (err) throw err;
        console.log("1 Document Added.");
    });
}

function addTaskToMongo(task_id, max) {
    collection_tasks.insertOne({
        'task_id': task_id,
        'max': max
    }, (err, result) => {
        if (err) throw  err;
        console.log("1 Task Added.");
    });
}

function modifyTaskToMongo(task_id, items_done, error) {
    return new Promise(function (resolve, reject) {
        collection_tasks.findOneAndUpdate({
            'task_id': task_id
        }, {
            $set: {
                'items_done': items_done
            }
        }, (err, result) => {
            console.log("1 Task Updated.");
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

function addAccessTokenToMongo(auth, access_token) {
    console.log(access_token);
    collection.findOneAndUpdate({
        'auth': auth
    }, {
        $set: {
            'access_token': access_token
        }
    }, (err, result) => {
        if (err) throw err;
        console.log("1 Document Updated.");
    });
}

app.get("/api/taskinfo", (req, res) => {
    let task_id;
    try {
        task_id = req.query.task;
    } catch (e) {
        res.status(400);
        res.send("Bad Request");
    }
    collection_tasks.findOne({
        'task_id': task_id
    }, function (err, document) {
        if (err) {
            return;
        }
        if (err) {
            res.status(400);
            res.send("Bad TaskID");
        } else {
            res.status(200);
            res.send(document.items_done.toString());
        }
    })
});

app.get('/', (req, res) => {
    console.log(req.cookies);
    if (!req.cookies['auth']) {
        let datefarinthefuture = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 365 * 100));
        let options = {
            httpOnly: true,
            expires: datefarinthefuture
        };
        let id = makeid(256);
        res.cookie('auth', id, options);
        addTokenToMongo(id);
    }
    res.sendFile(path.join(__dirname + '/static/index.html'));
});

app.get('/jquery', (req, res) => {
    res.redirect("https://code.jquery.com/jquery-3.4.1.min.js")
});

app.get('/table.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/static/table.css'));
});

app.get('/api/callback', (req, res) => {
    let token = req.query.access_token;
    let auth = req.cookies.auth;
    addAccessTokenToMongo(auth, token);
    res.redirect('../../select')
});

function randomizeTask(playlist_id, pos, new_pos, auth_token) {
    return new Promise(function (resolve, reject) {
        axios.put("https://api.spotify.com/v1/playlists/" + playlist_id + "/tracks", {
            'range_start': pos,
            'range_length': 1,
            'insert_before': new_pos
        }, {
            headers: {
                Authorization: "Bearer " + auth_token,
                'Content-Type': 'application/json'
            }

        }).then(response => {
            resolve();
        }).catch(error => {
            reject(error);
        });
    });
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

app.get('/api/random', (req, res) => {
    let playlist_id;
    let auth_token;
    let total_songs;
    try {
        playlist_id = req.query.spotify;
        auth_token = req.cookies.auth;
        total_songs = req.query.total;
        total_songs = parseInt(total_songs);
    } catch (e) {
        res.status(400);
        res.send("Bad Request.");
    }

    collection.findOne({
        'auth': auth_token
    }, (err, result) => {
        if (err) {
            return
        }
        let spotify_token = result.access_token;
        let q = queue();
        q.concurrency = 1;
        q.on('error', function (error) {
            console.log(error);
        });
        let taskid = makeid(255);
        addTaskToMongo(taskid, total_songs);
        for (let j = 0; j < total_songs; j++) {
            let randomInt = getRandomInt(total_songs);
            q.push(function () {
                return randomizeTask(playlist_id, j, randomInt, spotify_token)
            });
            q.push(function () {
                return modifyTaskToMongo(taskid, j, false)
            });
        }
        q.push(function () {
            return modifyTaskToMongo(taskid, "Done", false);
        });
        q.start();

        res.status(201);
        res.send(taskid);
    });
});

app.get('/api/auth', (req, res) => {
    let scopes = 'playlist-read-private playlist-modify-public playlist-modify-private playlist-read-collaborative';
    let redirect_uri = process.env.SPOTIFY_REDIRECT;
    url = 'https://accounts.spotify.com/authorize?response_type=token&client_id=' + client_id + (scopes ? '&scope=' + encodeURIComponent(scopes) : '') + '&redirect_uri=' + encodeURIComponent(redirect_uri);
    res.redirect(url);
});

app.use(cookieParser());
app.listen(PORT, HOST);
