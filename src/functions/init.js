const registry = require('./registry');
const fileTools = require('./file-tools');

/**
 * Регистрация всех доступных функций
 */
function initializeFunctions() {
    // Функция: read_file
    registry.register(
        'read_file',
        {
            name: 'read_file',
            description: 'Читает содержимое файла из разрешенных директорий',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'Относительный путь к файлу (например: MyPlugin/src/Main.java)'
                    },
                    encoding: {
                        type: 'string',
                        description: 'Кодировка файла (по умолчанию utf-8)',
                        enum: ['utf-8', 'ascii', 'latin1']
                    }
                },
                required: ['path']
            }
        },
        fileTools.readFile
    );

    // Функция: list_directory
    registry.register(
        'list_directory',
        {
            name: 'list_directory',
            description: 'Получить список файлов в директории',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'Относительный путь к директории'
                    },
                    recursive: {
                        type: 'boolean',
                        description: 'Рекурсивный обход поддиректорий'
                    },
                    filter: {
                        type: 'string',
                        description: 'Фильтр файлов (например: *.java для только Java файлов)'
                    },
                    max_depth: {
                        type: 'number',
                        description: 'Максимальная глубина рекурсии (по умолчанию 5)'
                    }
                },
                required: ['path']
            }
        },
        fileTools.listDirectory
    );

    // Функция: search_in_files
    registry.register(
        'search_in_files',
        {
            name: 'search_in_files',
            description: 'Поиск текста в файлах директории',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'Относительный путь к директории для поиска'
                    },
                    query: {
                        type: 'string',
                        description: 'Поисковый запрос'
                    },
                    case_sensitive: {
                        type: 'boolean',
                        description: 'Учитывать регистр при поиске'
                    },
                    file_pattern: {
                        type: 'string',
                        description: 'Паттерн файлов для поиска (например: *.java)'
                    },
                    max_results: {
                        type: 'number',
                        description: 'Максимальное количество результатов'
                    }
                },
                required: ['path', 'query']
            }
        },
        fileTools.searchInFiles
    );

    // Функция: get_file_info
    registry.register(
        'get_file_info',
        {
            name: 'get_file_info',
            description: 'Получить информацию о файле или директории',
            parameters: {
                type: 'object',
                properties: {
                    path: {
                        type: 'string',
                        description: 'Относительный путь к файлу или директории'
                    }
                },
                required: ['path']
            }
        },
        fileTools.getFileInfo
    );

    console.log('✅ Function calling initialized');
    console.log(`📋 Registered ${registry.getStats().totalFunctions} functions`);
}

module.exports = { initializeFunctions };
