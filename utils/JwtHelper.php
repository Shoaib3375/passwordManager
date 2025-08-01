<?php
namespace App\utils;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtHelper {
    public static function generate(array $payload): string {
        return JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
    }

    public static function validate(string $token): \stdClass {
        return JWT::decode($token, new Key($_ENV['JWT_SECRET'], 'HS256'));
    }
}
