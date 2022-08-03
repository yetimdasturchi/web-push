<?php

$result = [];
if (strtolower($_SERVER['REQUEST_METHOD']) == 'post') {
    if (isset($_SERVER['CONTENT_TYPE']) && trim(strtolower($_SERVER['CONTENT_TYPE']) == 'application/json')) {
        if (($strJSON = trim(file_get_contents('php://input'))) === false) {
            $result['msg'] = 'invalid JSON data!';
        } else {
            file_put_contents('subscribed.log', $strJSON);
            $result['msg'] = 'subscription saved on server!';
        }
    } else {
        $result['msg'] = 'invalid content type!';
    }
} else {
    $result['msg'] = 'no post request!';
}
echo json_encode($result);
