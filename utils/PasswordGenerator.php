<?php
namespace App\utils;

class PasswordGenerator {
    public static function generate(int $length = 12): string {
        $length = max(4, min(128, $length)); // Min 4, Max 128
        
        $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $chars[random_int(0, strlen($chars) - 1)];
        }
        
        return $password;
    }
}