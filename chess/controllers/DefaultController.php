<?php
include '../models/db.php';
include '../models/Token.php';

$db = new db();
$pathOnly = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if ('/' === $pathOnly) {
    $hideChooseOuter = false;
    if (isset($_GET['token'])
    && ('b' === $_GET['token'][0] || 'w' === $_GET['token'][0])) {
        $gameId = intval(substr($_GET['token'], 1));
        if (!is_numeric($gameId)) {
            header("Location: /");
            die();
        }
        $query = $db->query("SELECT COUNT(1) AS count FROM games WHERE id = ? AND token" . ('b' === $_GET['token'][0] ? 'Black' : 'White') . " = ?", [$gameId, substr($_GET['token'], 1 + strlen($gameId))])->fetchArray();
        if (!$query['count']) {
            header("Location: /");
            die();
        }
        $hideChooseOuter = true;
        $token = Token::create();
        $IPURL = 'https://ipv' . (false !== stripos($_SERVER['REMOTE_ADDR'], '.') ? '6' : '4') . '.neverwasinparis.com/chess';
    }
    include '../views/index.php';
} else if ('/start' === $pathOnly) {
    header('Content-Type:application/json;charset=utf-8');
    $token = Token::create();
    echo json_encode([
        'IPURL' => 'https://ipv' . (false !== stripos($_SERVER['REMOTE_ADDR'], '.') ? '6' : '4') . '.neverwasinparis.com/chess',
        'token' => $token,
    ]);
}
$db->close();
