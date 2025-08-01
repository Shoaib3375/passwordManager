<?php
namespace App\models;

use App\config\Database;
use PDO;

class User {
    public static function create($email, $password) {
        $db = Database::connect();
        
        // Check if user already exists
        if (self::find($email)) {
            return false;
        }
        
        $stmt = $db->prepare("INSERT INTO users (email, password, created_at) VALUES (?, ?, NOW())");
        return $stmt->execute([$email, password_hash($password, PASSWORD_ARGON2ID)]);
    }

    public static function find($email) {
        $db = Database::connect();
        $stmt = $db->prepare("SELECT id, email, password FROM users WHERE email = ?");
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
