<?php
namespace App\controllers;

use App\models\Password;
use App\middleware\AuthMiddleware;
use App\utils\PasswordGenerator;

class PasswordController {
    public static function store($data) {
        $user_id = AuthMiddleware::authenticate();
        
        if (!isset($data['site']) || !isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Site, username, and password required']);
            return;
        }

        if (empty(trim($data['site'])) || empty(trim($data['password']))) {
            http_response_code(400);
            echo json_encode(['error' => 'Site and password cannot be empty']);
            return;
        }

        try {
            if (Password::store($user_id, trim($data['site']), trim($data['username']), $data['password'])) {
                echo json_encode(['message' => 'Password saved successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save password']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Encryption failed']);
        }
    }

    public static function list() {
        $user_id = AuthMiddleware::authenticate();
        
        try {
            $passwords = Password::list($user_id);
            echo json_encode(['passwords' => $passwords]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to retrieve passwords']);
        }
    }

    public static function delete($id) {
        $user_id = AuthMiddleware::authenticate();
        
        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid password ID']);
            return;
        }

        try {
            if (Password::delete($id, $user_id)) {
                echo json_encode(['message' => 'Password deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Password not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete password']);
        }
    }

    public static function generate($data) {
        $length = (int)($data['length'] ?? 12);
        
        if ($length < 4 || $length > 128) {
            http_response_code(400);
            echo json_encode(['error' => 'Password length must be between 4 and 128']);
            return;
        }

        try {
            $password = PasswordGenerator::generate($length);
            echo json_encode(['password' => $password]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate password']);
        }
    }

    public static function update($id, $data) {
        $user_id = AuthMiddleware::authenticate();
        
        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid password ID']);
            return;
        }

        if (!isset($data['site']) || !isset($data['username']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Site, username, and password required']);
            return;
        }

        try {
            if (Password::update($id, $user_id, trim($data['site']), trim($data['username']), $data['password'])) {
                echo json_encode(['message' => 'Password updated successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Password not found']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update password']);
        }
    }
}