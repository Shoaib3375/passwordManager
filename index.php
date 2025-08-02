<?php
require 'vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

use App\controllers\AuthController;
use App\controllers\PasswordController;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
    } elseif (preg_match('/\/passwords\/(\d+)/', $uri, $matches) && $method === 'PUT') {
        PasswordController::update($matches[1], $body);
    } elseif ($uri === '/generate-password' && $method === 'POST') {
        PasswordController::generate($body);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (\Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
