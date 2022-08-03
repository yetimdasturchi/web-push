<?php
require __DIR__ . '/webpush/vendor/autoload.php';
use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

$subscription = Subscription::create(json_decode(file_get_contents('subscribed.log'), true));
//For key generations https://www.stephane-quantin.com/en/tools/generators/vapid-keys
$auth = array(
    'VAPID' => array(
        'subject' => 'https://manu.uno',
        'publicKey' => '',
        'privateKey' => ''
    ),
);

$webPush = new WebPush($auth);

$report = $webPush->sendOneNotification(
    $subscription,
    json_encode([
        'title' => 'salom dunyo',
        'data' => [
            'body' => 'Somethind body',
            'data' => [
                'url' => 'http://manu.uno'
            ]
        ]
    ])
);

$endpoint = $report->getRequest()->getUri()->__toString();

if ($report->isSuccess()) {
    echo "[v] {$endpoint}";
} else {
    echo "[x] {$endpoint}: {$report->getReason()}";
}
