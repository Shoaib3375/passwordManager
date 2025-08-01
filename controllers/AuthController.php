<?php
namespace App\controllers;

use App\models\User;
use App\utils\JwtHelper;

class AuthController {
    public static function register($data) {
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid email format']);
            return;
        }

        if (strlen($data['password']) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters']);
            return;
        }

        try {
            if (User::create($data['email'], $data['password'])) {
                echo json_encode(['message' => 'User registered successfully']);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Email already exists']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Registration failed']);
        }
    }

    public static function login($data) {
        if (!isset($data['email']) || !isset($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }

        try {
            $user = User::find($data['email']);
            if ($user && password_verify($data['password'], $user['password'])) {
                $token = JwtHelper::generate([
                    'user_id' => $user['id'],
                    'exp' => time() + (24 * 60 * 60)
                ]);
                echo json_encode(['token' => $token]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Invalid credentials']);
            }
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Login failed']);
        }
    }
}
