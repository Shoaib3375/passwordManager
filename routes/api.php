<?php

use App\controllers\AuthController;
use App\controllers\PasswordController;

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/PasswordController.php';

$path = $_GET['path'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

if ($path === 'register' && $method === 'POST') {
    AuthController::register($pdo);
} elseif ($path === 'login' && $method === 'POST') {
    AuthController::login($pdo);
} elseif ($path === 'passwords' && $method === 'POST') {
    PasswordController::store($pdo);
} elseif ($path === 'passwords' && $method === 'GET') {
    PasswordController::index($pdo);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}
