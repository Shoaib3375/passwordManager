<?php
namespace App\middleware;

use App\utils\JwtHelper;

class AuthMiddleware {
    public static function authenticate(): int {
        $headers = getallheaders() ?: [];
        
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Token required']);
            exit;
        }

        try {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $decoded = JwtHelper::validate($token);
            return (int) $decoded->user_id;
        } catch (\Exception) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
    }
}
