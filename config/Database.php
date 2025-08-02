<?php
namespace App\config;

use Dotenv\Dotenv;
use PDO;

class Database {
    public static function connect(): PDO {
        $dsn = "mysql:host={$_ENV['DB_HOST']};dbname={$_ENV['DB_NAME']};charset=utf8mb4";
        return new PDO(
            dsn: $dsn,
            username: $_ENV['DB_USER'],
            password: $_ENV['DB_PASS'],
            options: [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
    }
}
