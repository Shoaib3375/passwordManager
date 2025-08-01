<?php
namespace App\models;

use App\config\Database;
use App\utils\Crypto;
use PDO;

class Password {
    public static function store($user_id, $site, $username, $password) {
        $db = Database::connect();
        $encPass = Crypto::encrypt($password);
        
        $stmt = $db->prepare("INSERT INTO passwords (user_id, site, username, password, created_at) VALUES (?, ?, ?, ?, NOW())");
        return $stmt->execute([$user_id, $site, $username, $encPass]);
    }

    public static function list($user_id) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT id, site, username, password, created_at FROM passwords WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($rows as &$row) {
            try {
                $row['password'] = Crypto::decrypt($row['password']);
            } catch (\Exception $e) {
                $row['password'] = '[Decryption Error]';
            }
        }
        
        return $rows;
    }

    public static function delete($id, $user_id) {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM passwords WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $user_id]);
    }
}
