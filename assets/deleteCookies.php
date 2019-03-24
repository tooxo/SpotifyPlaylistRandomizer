<?php
    setcookie('jstophp', '', time() - 3600, '/');
    echo '<script>self.close();</script>'
?>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script>
    window.addEventListener('onclose', function (event) {
        $.getScript("request.js", function(){
            console.log('Giving back!');
            deleteCookiesCallback();
        });
    })
</script>
