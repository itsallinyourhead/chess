<?php
include '../chess/models/db.php';

$db = new db();
header('Content-Type:application/json;charset=utf-8');
!isset($_GET['token']) && die();
$query = $db->query("UPDATE tokens SET IPv" . (false !== stripos($_SERVER['REMOTE_ADDR'], '.') ? '4' : '6') . " = ? WHERE token = ?", [$_SERVER['REMOTE_ADDR'], $_GET['token']]);
$db->close();
echo json_encode(['status' => $query ? 'ok' : 'error']);
