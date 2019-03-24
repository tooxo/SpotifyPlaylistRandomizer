function getBack(happening){
    if (happening){
    } else {
        self.location = './index.html?text=login';
    }
}

function apiCallCheck(){
    let url_string = window.location.href;
    let url = new URL(url_string);
    let access_token = url.searchParams.get('access_token');
    let cookieToken = getCookie('access_token');

    if (!cookieToken && !access_token){
        self.location = './index.html';
    }

    if (cookieToken && !access_token){
        self.location = './land.html?access_token=' + cookieToken;
    }

    if (access_token && !cookieToken){
        verifyLogin(access_token, 1);
    } else {

    }
}

$( document ).ready(function () {
    let url_string = window.location.href;
    url_string = url_string.replace("#", "?");
    let url = new URL(url_string);
    let access_token = url.searchParams.get('access_token');
    let bearer = url.searchParams.get('token_type');
    let cookieToken = getCookie('access_token');

    if (bearer){
        createCookie('access_token', access_token, 0.04097222222); //0.04097222222 = 59 Minutes;
        self.location = './land.html?access_token=' + access_token;
    }else {
        document.getElementById('crawlbutton').setAttribute('style', 'display: block');
    }

    apiCallCheck();


});
