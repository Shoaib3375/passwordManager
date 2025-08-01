<?php
namespace App\utils;

class Crypto {
    public static function encrypt($data) {
        if (empty($data)) return null;
        
        $key = $_ENV['ENCRYPTION_KEY'];
        $iv = random_bytes(16);
        $cipher = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);
        
        if ($cipher === false) {
            throw new \Exception('Encryption failed');
        }
        
        return base64_encode($iv . $cipher);
    }

    public static function decrypt($data) {
        if (empty($data)) return null;
        
        $key = $_ENV['ENCRYPTION_KEY'];
        $decoded = base64_decode($data);
        
        if ($decoded === false || strlen($decoded) < 16) {
            throw new \Exception('Invalid encrypted data');
        }
        
        $iv = substr($decoded, 0, 16);
        $ciphertext = substr($decoded, 16);
        $result = openssl_decrypt($ciphertext, 'AES-256-CBC', $key, 0, $iv);
        
        if ($result === false) {
            throw new \Exception('Decryption failed');
        }
        
        return $result;
    }
}
