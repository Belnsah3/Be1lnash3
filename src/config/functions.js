const path = require('path');

/**
 * Конфигурация для Function Calling
 */
module.exports = {
    // Разрешенные базовые папки для доступа
    allowedBasePaths: [
        path.join(__dirname, '../../plugins'),
        path.join(__dirname, '../../docs'),
        // Можно добавить путь к реальной папке с плагинами
        // '/путь/к/вашим/плагинам'
    ],

    // Максимальный размер файла для чтения (1MB)
    maxFileSize: 1024 * 1024,

    // Максимальное количество файлов в листинге
    maxFilesInList: 100,

    // Максимальная глубина рекурсии для list_directory
    maxRecursionDepth: 5,

    // Таймаут выполнения функции (5 секунд)
    executionTimeout: 5000,

    // Разрешенные расширения файлов для чтения
    allowedExtensions: [
        '.java', '.js', '.ts', '.json', '.yml', '.yaml',
        '.txt', '.md', '.properties', '.xml', '.html',
        '.css', '.sql', '.sh', '.bat', '.ps1',
        '.py', '.php', '.rb', '.go', '.rs'
    ],

    // Исключаемые папки (не будут индексироваться)
    excludedDirectories: [
        'node_modules',
        '.git',
        'build',
        'dist',
        'target',
        '.idea',
        '.vscode'
    ],

    // Максимальный размер результата поиска
    maxSearchResults: 50,

    // Максимальная длина контекста вокруг найденного текста
    searchContextLength: 100,

    // Кэширование
    cacheEnabled: true,
    cacheTTL: 300000, // 5 минут
};
