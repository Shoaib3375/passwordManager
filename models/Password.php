<?php
namespace App\models;

use App\config\Database;
use App\utils\Crypto;

class Password {
    public static function store(int $user_id, string $site, string $username, string $password): bool {
        $db = Database::connect();
        $encPass = Crypto::encrypt($password);
        
        $stmt = $db->prepare("INSERT INTO passwords (user_id, site, username, password, created_at) VALUES (?, ?, ?, ?, NOW())");
        return $stmt->execute([$user_id, $site, $username, $encPass]);
    }

    public static function list(int $user_id): array {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT id, site, username, password, created_at FROM passwords WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
        $rows = $stmt->fetchAll();
        
        return array_map(function($row) {
            try {
                $row['password'] = Crypto::decrypt($row['password']);
            } catch (\Exception) {
                $row['password'] = '[Decryption Error]';
            }
            return $row;
        }, $rows);
    }

    public static function delete(int $id, int $user_id): bool {
        $db = Database::connect();
        $stmt = $db->prepare("DELETE FROM passwords WHERE id = ? AND user_id = ?");
        return $stmt->execute([$id, $user_id]);
    }
}
