<?php
namespace App\middleware;

use App\utils\JwtHelper;

class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        if (!isset($headers['Authorization'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Token required']);
            exit;
        }

        try {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $decoded = JwtHelper::validate($token);
            return $decoded->user_id;
        } catch (\Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token']);
            exit;
        }
    }
}
