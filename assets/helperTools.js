function openWindow(page) {
    let newWindow = window.open(page);
    newWindow.blur();
    window.focus();
}

function get(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

function fixEnc(malformedString){
    if (malformedString.includes('%3D')){
      malformedString = malformedString.replace("%3D", "=")
    }
    if (malformedString.includes('%3D')){
      malformedString = malformedString.replace("%3D", "=")
    }
    if (malformedString.includes('%3D')){
      malformedString = malformedString.replace("%3D", "=")
    }
    if (malformedString.includes('%3D')){
      malformedString = malformedString.replace("%3D", "=")
    }
    return malformedString;
}

function createCookie(name, value, days) {
    let expires;
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}

function getCookie(name) {
    let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
}

/*function takeOver(json) {
    createCookie('jstophp', json, 1);
}*/

function verifyLogin(auth_code, use_code) {
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
            if (use_code === 1){
                getBack(true);
            }
            return true;
        },
        error: function (msg) {
            if (use_code === 1){
                getBack(false);
            }
            return false;
        }
    });
}
