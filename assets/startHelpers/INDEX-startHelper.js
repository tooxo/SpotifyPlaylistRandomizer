window.onload = function (e) {
    let url_string = window.location.href;
    let url = new URL(url_string);
    let text = url.searchParams.get('text');

    if (text === 'login'){
        document.getElementById('text').innerHTML = 'You need to login again.'
    }else {
        document.getElementById('text').innerHTML = 'Hello!'
    }
};