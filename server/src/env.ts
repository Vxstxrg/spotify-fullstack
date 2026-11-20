import * as path from 'path';

// Загружаем server/.env до импорта модулей, читающих переменные окружения
// (декораторы @Module вычисляются в момент импорта app.module).
// process.loadEnvFile доступен начиная с Node 20.12.
try {
	process.loadEnvFile(path.resolve(process.cwd(), '.env'));
} catch {
	// .env необязателен — переменные могут быть заданы снаружи
}
