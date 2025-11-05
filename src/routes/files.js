const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { requireApiKey } = require('../middleware/auth');
const AdmZip = require('adm-zip');

// Базовая директория для загрузок
const UPLOADS_BASE = path.join(__dirname, '../../uploads');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        // Создаем папку для API ключа
        const apiKeyId = req.apiKey.id;
        const uploadDir = path.join(UPLOADS_BASE, `api_${apiKeyId}`);
        
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        // Сохраняем с оригинальным именем
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
    },
    fileFilter: (req, file, cb) => {
        // Разрешенные расширения
        const allowedExts = ['.zip', '.jar', '.java', '.js', '.json', '.yml', '.yaml', '.txt', '.md', '.xml', '.properties'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedExts.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${ext} not allowed`));
        }
    }
});

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Загрузить файлы
 *     tags: [Files]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               extractZip:
 *                 type: boolean
 *                 description: Автоматически распаковать ZIP архивы
 *     responses:
 *       200:
 *         description: Файлы загружены
 */
router.post('/upload', requireApiKey, upload.array('files', 10), async (req, res) => {
    try {
        const files = req.files;
        const extractZip = req.body.extractZip === 'true' || req.body.extractZip === true;
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const results = [];

        // Обработка каждого файла
        for (const file of files) {
            const result = {
                originalName: file.originalname,
                size: file.size,
                path: file.filename
            };

            // Автоматическая распаковка ZIP
            if (extractZip && path.extname(file.originalname).toLowerCase() === '.zip') {
                try {
                    const zipPath = file.path;
                    const extractDir = path.join(path.dirname(zipPath), path.basename(file.originalname, '.zip'));

                    // Распаковываем
                    const zip = new AdmZip(zipPath);
                    zip.extractAllTo(extractDir, true);

                    // Удаляем ZIP
                    await fs.unlink(zipPath);

                    result.extracted = true;
                    result.extractedTo = path.basename(extractDir);
                } catch (error) {
                    console.error('Error extracting ZIP:', error);
                    result.extractError = error.message;
                }
            }

            results.push(result);
        }

        res.json({
            success: true,
            message: `${files.length} file(s) uploaded`,
            files: results
        });

    } catch (error) {
        console.error('Error uploading files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /files:
 *   get:
 *     summary: Получить список загруженных файлов
 *     tags: [Files]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: path
 *         schema:
 *           type: string
 *         description: Путь к директории (опционально)
 *     responses:
 *       200:
 *         description: Список файлов
 */
router.get('/', requireApiKey, async (req, res) => {
    try {
        const apiKeyId = req.apiKey.id;
        const subPath = req.query.path || '';
        const userDir = path.join(UPLOADS_BASE, `api_${apiKeyId}`, subPath);

        // Проверка существования директории
        try {
            await fs.access(userDir);
        } catch {
            return res.json({
                success: true,
                files: [],
                path: subPath
            });
        }

        // Чтение содержимого
        const entries = await fs.readdir(userDir, { withFileTypes: true });
        const files = [];

        for (const entry of entries) {
            const fullPath = path.join(userDir, entry.name);
            const stats = await fs.stat(fullPath);
            
            files.push({
                name: entry.name,
                type: entry.isDirectory() ? 'directory' : 'file',
                size: entry.isFile() ? stats.size : null,
                modified: stats.mtime,
                path: path.join(subPath, entry.name).replace(/\\/g, '/')
            });
        }

        res.json({
            success: true,
            files: files,
            path: subPath,
            total: files.length
        });

    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /files/{path}:
 *   delete:
 *     summary: Удалить файл или директорию
 *     tags: [Files]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Путь к файлу или директории
 *     responses:
 *       200:
 *         description: Файл удален
 */
router.delete('/:path(*)', requireApiKey, async (req, res) => {
    try {
        const apiKeyId = req.apiKey.id;
        const filePath = req.params.path;
        const fullPath = path.join(UPLOADS_BASE, `api_${apiKeyId}`, filePath);
        
        // Проверка что путь внутри директории пользователя (защита от path traversal)
        const userDir = path.join(UPLOADS_BASE, `api_${apiKeyId}`);
        if (!fullPath.startsWith(userDir)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Проверка существования
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }

        // Удаление
        const stats = await fs.stat(fullPath);
        if (stats.isDirectory()) {
            await fs.rm(fullPath, { recursive: true, force: true });
        } else {
            await fs.unlink(fullPath);
        }

        res.json({
            success: true,
            message: 'File deleted',
            path: filePath
        });

    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @swagger
 * /files/stats:
 *   get:
 *     summary: Получить статистику по файлам
 *     tags: [Files]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Статистика файлов
 */
router.get('/stats', requireApiKey, async (req, res) => {
    try {
        const apiKeyId = req.apiKey.id;
        const userDir = path.join(UPLOADS_BASE, `api_${apiKeyId}`);

        // Проверка существования
        try {
            await fs.access(userDir);
        } catch {
            return res.json({
                success: true,
                stats: {
                    totalFiles: 0,
                    totalSize: 0,
                    directories: 0
                }
            });
        }

        // Подсчет статистики
        let totalFiles = 0;
        let totalSize = 0;
        let directories = 0;

        async function scan(dir) {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    directories++;
                    await scan(fullPath);
                } else {
                    totalFiles++;
                    const stats = await fs.stat(fullPath);
                    totalSize += stats.size;
                }
            }
        }

        await scan(userDir);

        res.json({
            success: true,
            stats: {
                totalFiles,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                directories
            }
        });

    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
