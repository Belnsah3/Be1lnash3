const fs = require('fs').promises;
const path = require('path');
const config = require('../config/functions');

/**
 * Валидация пути - проверка на path traversal и доступность
 */
function validatePath(requestedPath) {
    // Нормализация пути
    const normalized = path.normalize(requestedPath);
    
    // Проверка на path traversal
    if (normalized.includes('..')) {
        throw new Error('Path traversal detected');
    }

    // Проверка что путь начинается с одной из разрешенных базовых папок
    const isAllowed = config.allowedBasePaths.some(basePath => {
        const resolved = path.resolve(basePath, normalized);
        return resolved.startsWith(path.resolve(basePath));
    });

    if (!isAllowed) {
        throw new Error('Access to this path is not allowed');
    }

    return normalized;
}

/**
 * Получить абсолютный путь из относительного
 */
function resolvePath(relativePath) {
    // Пробуем найти файл в одной из разрешенных папок
    for (const basePath of config.allowedBasePaths) {
        const fullPath = path.join(basePath, relativePath);
        return fullPath;
    }
    
    // Если не нашли, используем первую базовую папку
    return path.join(config.allowedBasePaths[0], relativePath);
}

/**
 * Проверка расширения файла
 */
function isAllowedExtension(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return config.allowedExtensions.includes(ext) || ext === '';
}

/**
 * Функция: read_file
 * Читает содержимое файла
 */
async function readFile(args) {
    const { path: filePath, encoding = 'utf-8' } = args;

    try {
        validatePath(filePath);
        const fullPath = resolvePath(filePath);

        // Проверка существования файла
        const stats = await fs.stat(fullPath);
        
        if (!stats.isFile()) {
            return {
                error: 'Path is not a file'
            };
        }

        // Проверка размера
        if (stats.size > config.maxFileSize) {
            return {
                error: `File too large (max ${config.maxFileSize} bytes)`
            };
        }

        // Проверка расширения
        if (!isAllowedExtension(fullPath)) {
            return {
                error: 'File type not allowed'
            };
        }

        // Чтение файла
        const content = await fs.readFile(fullPath, encoding);

        return {
            content,
            size: stats.size,
            encoding,
            path: filePath,
            modified: stats.mtime
        };

    } catch (error) {
        return {
            error: error.message
        };
    }
}

/**
 * Функция: list_directory
 * Список файлов в папке
 */
async function listDirectory(args) {
    const { 
        path: dirPath, 
        recursive = false, 
        filter = null,
        max_depth = 5
    } = args;

    try {
        validatePath(dirPath);
        const fullPath = resolvePath(dirPath);

        // Проверка существования папки
        const stats = await fs.stat(fullPath);
        
        if (!stats.isDirectory()) {
            return {
                error: 'Path is not a directory'
            };
        }

        const files = [];
        
        await scanDirectory(fullPath, '', files, recursive, filter, 0, max_depth);

        // Ограничение количества файлов
        if (files.length > config.maxFilesInList) {
            files.length = config.maxFilesInList;
        }

        return {
            files,
            total: files.length,
            path: dirPath
        };

    } catch (error) {
        return {
            error: error.message
        };
    }
}

/**
 * Рекурсивное сканирование папки
 */
async function scanDirectory(basePath, relativePath, results, recursive, filter, depth, maxDepth) {
    if (depth >= maxDepth) return;

    const currentPath = path.join(basePath, relativePath);
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
        // Пропускаем исключенные папки
        if (entry.isDirectory() && config.excludedDirectories.includes(entry.name)) {
            continue;
        }

        const entryRelativePath = path.join(relativePath, entry.name);
        const entryFullPath = path.join(currentPath, entry.name);

        if (entry.isFile()) {
            // Фильтр по паттерну
            if (filter && !matchPattern(entry.name, filter)) {
                continue;
            }

            const stats = await fs.stat(entryFullPath);
            
            results.push({
                name: entry.name,
                path: entryRelativePath,
                size: stats.size,
                modified: stats.mtime,
                extension: path.extname(entry.name)
            });

        } else if (entry.isDirectory() && recursive) {
            await scanDirectory(basePath, entryRelativePath, results, recursive, filter, depth + 1, maxDepth);
        }
    }
}

/**
 * Проверка соответствия файла паттерну
 */
function matchPattern(filename, pattern) {
    if (!pattern) return true;
    
    // Простая проверка по расширению (*.java)
    if (pattern.startsWith('*.')) {
        const ext = pattern.slice(1);
        return filename.endsWith(ext);
    }
    
    // Простая проверка по имени
    return filename.includes(pattern);
}

/**
 * Функция: search_in_files
 * Поиск текста в файлах
 */
async function searchInFiles(args) {
    const {
        path: searchPath,
        query,
        case_sensitive = false,
        file_pattern = null,
        max_results = 50
    } = args;

    try {
        validatePath(searchPath);
        const fullPath = resolvePath(searchPath);

        const files = [];
        await scanDirectory(fullPath, '', files, true, file_pattern, 0, config.maxRecursionDepth);

        const results = [];
        const searchQuery = case_sensitive ? query : query.toLowerCase();

        for (const file of files) {
            if (results.length >= max_results) break;

            const fileFullPath = path.join(fullPath, file.path);
            
            // Пропускаем большие файлы
            if (file.size > config.maxFileSize) continue;
            
            // Пропускаем файлы с неразрешенными расширениями
            if (!isAllowedExtension(file.path)) continue;

            try {
                const content = await fs.readFile(fileFullPath, 'utf-8');
                const lines = content.split('\n');

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const searchLine = case_sensitive ? line : line.toLowerCase();

                    if (searchLine.includes(searchQuery)) {
                        results.push({
                            file: file.path,
                            line: i + 1,
                            content: line.trim(),
                            context: getContext(lines, i, config.searchContextLength)
                        });

                        if (results.length >= max_results) break;
                    }
                }
            } catch (err) {
                // Пропускаем файлы которые не можем прочитать
                continue;
            }
        }

        return {
            results,
            total_matches: results.length,
            query,
            path: searchPath
        };

    } catch (error) {
        return {
            error: error.message
        };
    }
}

/**
 * Получить контекст вокруг найденной строки
 */
function getContext(lines, index, maxLength) {
    const start = Math.max(0, index - 1);
    const end = Math.min(lines.length, index + 2);
    const contextLines = lines.slice(start, end);
    
    let context = contextLines.join('\n');
    if (context.length > maxLength) {
        context = context.substring(0, maxLength) + '...';
    }
    
    return context;
}

/**
 * Функция: get_file_info
 * Получить информацию о файле
 */
async function getFileInfo(args) {
    const { path: filePath } = args;

    try {
        validatePath(filePath);
        const fullPath = resolvePath(filePath);

        const stats = await fs.stat(fullPath);

        return {
            name: path.basename(fullPath),
            path: filePath,
            size: stats.size,
            extension: path.extname(fullPath),
            created: stats.birthtime,
            modified: stats.mtime,
            is_directory: stats.isDirectory(),
            is_file: stats.isFile()
        };

    } catch (error) {
        return {
            error: error.message
        };
    }
}

module.exports = {
    readFile,
    listDirectory,
    searchInFiles,
    getFileInfo
};
