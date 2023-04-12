<?php
class Token {
    public static function create() {
        $db = new db();
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        $charactersLength = strlen($characters);
        for ( ; ; ) {
            $token = '';
            for ($i = 0; $i < 30; ++$i) {
                $token .= $characters[rand(0, $charactersLength - 1)];
            }
            $query = $db->query("SELECT COUNT(token) AS count FROM tokens WHERE token = ?", [$token])->fetchArray();
            if (!$query['count']) {
                break;
            }
        }
        $db->query("INSERT INTO tokens (created, IPv" . (false !== stripos($_SERVER['REMOTE_ADDR'], '.') ? '4' : '6') . ", token) values(" . time() . ", ?, ?)", [$_SERVER['REMOTE_ADDR'], $token]);
        $db->close();
        return $token;
    }
}
