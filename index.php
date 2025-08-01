<?php
require 'vendor/autoload.php';

use App\controllers\AuthController;
use App\controllers\PasswordController;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

$body = json_decode(file_get_contents("php://input"), true);
if (json_last_error() !== JSON_ERROR_NONE && $method !== 'GET') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

try {
    if ($uri === '/register' && $method === 'POST') {
        AuthController::register($body);
    } elseif ($uri === '/login' && $method === 'POST') {
        AuthController::login($body);
    } elseif ($uri === '/passwords' && $method === 'POST') {
        PasswordController::store($body);
    } elseif ($uri === '/passwords' && $method === 'GET') {
        PasswordController::list();
    } elseif (preg_match('/\/passwords\/(\d+)/', $uri, $matches) && $method === 'DELETE') {
        PasswordController::delete($matches[1]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
