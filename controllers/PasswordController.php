<?php
namespace App\controllers;

use App\models\Password;
use App\middleware\AuthMiddleware;

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
}