<?php
    echo 'Wait for a few seconds...';
    $json = json_decode($_COOKIE['jstophp']);
    echo $json->name;

    $filename = $json->name . '.json';
    $filemanager = fopen('../savedusers/' . $filename, 'w') or die('Error');
    fwrite($filemanager, json_encode($json)) or die('Error');
    fclose($filemanager) or die('Error');
     echo '<script type="text/javascript">self.location = "./deleteCookies.php"</script>';
?>