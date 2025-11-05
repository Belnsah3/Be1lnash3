# 📱 Промт для создания Android приложения LumeAI

## 🎯 Задача
Создать Android приложение в стиле Qwen App для работы с LumeAI API - платформой для доступа к 69+ AI моделям (GPT, Claude, Gemini, DeepSeek и др.)

---

## 📋 Основные требования

### **1. Технологический стек**
- **Язык**: Kotlin (современный Android)
- **UI Framework**: Jetpack Compose (современный UI)
- **Архитектура**: MVVM + Clean Architecture
- **Сеть**: Retrofit2 + OkHttp3
- **Async**: Kotlin Coroutines + Flow
- **DI**: Hilt (Dependency Injection)
- **Локальное хранилище**: Room Database + DataStore
- **Навигация**: Jetpack Navigation Compose

### **2. Минимальная версия Android**
- **minSdk**: 24 (Android 7.0)
- **targetSdk**: 34 (Android 14)
- **compileSdk**: 34

---

## 🎨 Дизайн и UI

### **Цветовая схема**
```kotlin
// Темная тема (основная)
val Purple = Color(0xFF667EEA)
val DarkPurple = Color(0xFF764BA2)
val BackgroundDark = Color(0xFF1A1A1A)
val SurfaceDark = Color(0xFF2A2A2A)
val BorderDark = Color(0xFF3A3A3A)

// Градиенты
val PrimaryGradient = Brush.horizontalGradient(
    colors = listOf(Purple, DarkPurple)
)
```

### **Стиль**
- Материал Design 3 (Material You)
- Темная тема по умолчанию
- Закругленные углы (16dp)
- Плавные анимации
- Градиентные кнопки
- Современный минималистичный дизайн

---

## 📱 Экраны приложения

### **1. Splash Screen** (Заставка)
- Логотип LumeAI с анимацией
- Градиентный фон
- Проверка авторизации
- Переход на Login или Main

### **2. Login Screen** (Вход/Регистрация)
```
┌─────────────────────┐
│   🌟 LumeAI        │
│                     │
│  [Email]           │
│  [Password]        │
│                     │
│  [Войти]           │
│  [Регистрация]     │
│  [Забыли пароль?]  │
└─────────────────────┘
```

### **3. Main Screen** (Главный - Чат)
```
┌─────────────────────┐
│ ☰ LumeAI    [⚙️][👤]│
├─────────────────────┤
│                     │
│  💬 Чат с AI       │
│                     │
│  [Выбор модели ▼]  │
│  📊 gpt-5-chat     │
│                     │
│  [История чатов]   │
│                     │
│  Сообщения:        │
│  ┌─────────────┐   │
│  │ User: ...   │   │
│  └─────────────┘   │
│  ┌─────────────┐   │
│  │ AI: ...     │   │
│  └─────────────┘   │
│                     │
├─────────────────────┤
│ [Текст]      [📎🎤]│
└─────────────────────┘
```

### **4. Models Screen** (Выбор модели)
```
┌─────────────────────┐
│   🤖 Модели        │
├─────────────────────┤
│  [🔍 Поиск]        │
│                     │
│  Фильтры:          │
│  [Все][Text][Image]│
│  [Tools✓][Free]    │
│                     │
│  📌 Популярные:    │
│  ┌───────────────┐ │
│  │ GPT-5 Chat    │ │
│  │ 🔧 Tools      │ │
│  └───────────────┘ │
│  ┌───────────────┐ │
│  │ Claude 4.5    │ │
│  │ 🔧 Tools      │ │
│  └───────────────┘ │
│                     │
│  Все модели:       │
│  [Список всех...]  │
└─────────────────────┘
```

### **5. Settings Screen** (Настройки)
```
┌─────────────────────┐
│   ⚙️ Настройки     │
├─────────────────────┤
│  🔑 API Ключи      │
│  ┌───────────────┐ │
│  │ sk-xxx...     │ │
│  │ [Добавить +]  │ │
│  └───────────────┘ │
│                     │
│  🎨 Тема           │
│  ○ Светлая         │
│  ● Темная          │
│                     │
│  💬 Модель по умолч│
│  [gpt-5-chat ▼]   │
│                     │
│  🌐 API Endpoint   │
│  [https://...]     │
│                     │
│  📊 Статистика     │
│  📚 О приложении   │
│  🚪 Выход          │
└─────────────────────┘
```

### **6. Chat History Screen** (История чатов)
```
┌─────────────────────┐
│   📝 История       │
├─────────────────────┤
│  [🔍 Поиск]        │
│                     │
│  Сегодня:          │
│  ┌───────────────┐ │
│  │ 💬 Чат 1      │ │
│  │ gpt-5-chat    │ │
│  │ 10 сообщений  │ │
│  └───────────────┘ │
│                     │
│  Вчера:            │
│  ┌───────────────┐ │
│  │ 💬 Чат 2      │ │
│  │ claude-4.5    │ │
│  │ 5 сообщений   │ │
│  └───────────────┘ │
└─────────────────────┘
```

### **7. Profile Screen** (Профиль)
```
┌─────────────────────┐
│   👤 Профиль       │
├─────────────────────┤
│  [Аватар]          │
│  Имя Пользователя  │
│  email@example.com │
│                     │
│  📊 Статистика:    │
│  💬 25 чатов       │
│  📝 150 сообщений  │
│  🤖 5 моделей      │
│                     │
│  [Редактировать]   │
│  [Настройки]       │
└─────────────────────┘
```

---

## 🔧 API Интеграция

### **Base URL**
```kotlin
const val BASE_URL = "https://lumeai.ru/api/v1/"
```

### **Endpoints**

#### **1. Authentication**
```kotlin
// POST /auth/register
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String
)

// POST /auth/login
data class LoginRequest(
    val email: String,
    val password: String
)

// Response
data class AuthResponse(
    val success: Boolean,
    val token: String?,
    val user: User?
)
```

#### **2. Chat Completions**
```kotlin
// POST /ai/chat/completions
data class ChatRequest(
    val model: String = "gpt-5-chat",
    val messages: List<Message>,
    val stream: Boolean = false,
    val temperature: Float = 0.7f,
    val max_tokens: Int? = null
)

data class Message(
    val role: String, // "user", "assistant", "system"
    val content: String
)

data class ChatResponse(
    val id: String,
    val choices: List<Choice>,
    val usage: Usage
)

data class Choice(
    val message: Message,
    val finish_reason: String
)
```

#### **3. Models**
```kotlin
// GET /ai/models
data class ModelsResponse(
    val models: List<AIModel>
)

data class AIModel(
    val name: String,
    val category: String,
    val type: String,
    val supportsTools: Boolean = false
)
```

#### **4. API Keys**
```kotlin
// GET /keys
data class ApiKeysResponse(
    val success: Boolean,
    val keys: List<ApiKey>
)

// POST /keys
data class CreateKeyRequest(
    val name: String,
    val limit: Int? = null
)
```

#### **5. Chats History**
```kotlin
// GET /chats
data class ChatsResponse(
    val success: Boolean,
    val chats: List<Chat>
)

data class Chat(
    val id: String,
    val model: String,
    val title: String,
    val messageCount: Int,
    val createdAt: String
)

// GET /chats/:id
data class ChatDetailsResponse(
    val success: Boolean,
    val chat: Chat,
    val messages: List<Message>
)
```

---

## 🏗️ Архитектура приложения

### **Структура пакетов**
```
com.lumeai.app
├── data
│   ├── remote
│   │   ├── api
│   │   │   ├── AuthApi.kt
│   │   │   ├── ChatApi.kt
│   │   │   ├── ModelsApi.kt
│   │   │   └── KeysApi.kt
│   │   ├── dto
│   │   │   ├── ChatRequest.kt
│   │   │   ├── ChatResponse.kt
│   │   │   └── ...
│   │   └── interceptor
│   │       └── AuthInterceptor.kt
│   ├── local
│   │   ├── dao
│   │   │   ├── ChatDao.kt
│   │   │   └── MessageDao.kt
│   │   ├── entity
│   │   │   ├── ChatEntity.kt
│   │   │   └── MessageEntity.kt
│   │   └── database
│   │       └── AppDatabase.kt
│   ├── datastore
│   │   └── PreferencesManager.kt
│   └── repository
│       ├── AuthRepository.kt
│       ├── ChatRepository.kt
│       ├── ModelsRepository.kt
│       └── KeysRepository.kt
├── domain
│   ├── model
│   │   ├── User.kt
│   │   ├── Chat.kt
│   │   ├── Message.kt
│   │   ├── AIModel.kt
│   │   └── ApiKey.kt
│   ├── usecase
│   │   ├── auth
│   │   │   ├── LoginUseCase.kt
│   │   │   ├── RegisterUseCase.kt
│   │   │   └── LogoutUseCase.kt
│   │   ├── chat
│   │   │   ├── SendMessageUseCase.kt
│   │   │   ├── GetChatHistoryUseCase.kt
│   │   │   └── DeleteChatUseCase.kt
│   │   └── models
│   │       ├── GetModelsUseCase.kt
│   │       └── SearchModelsUseCase.kt
│   └── repository (interfaces)
├── presentation
│   ├── theme
│   │   ├── Color.kt
│   │   ├── Theme.kt
│   │   └── Type.kt
│   ├── navigation
│   │   ├── NavGraph.kt
│   │   └── Screen.kt
│   ├── components
│   │   ├── MessageBubble.kt
│   │   ├── ModelCard.kt
│   │   ├── GradientButton.kt
│   │   └── LoadingIndicator.kt
│   └── screens
│       ├── splash
│       │   ├── SplashScreen.kt
│       │   └── SplashViewModel.kt
│       ├── auth
│       │   ├── login
│       │   │   ├── LoginScreen.kt
│       │   │   └── LoginViewModel.kt
│       │   └── register
│       │       ├── RegisterScreen.kt
│       │       └── RegisterViewModel.kt
│       ├── main
│       │   ├── MainScreen.kt
│       │   └── MainViewModel.kt
│       ├── chat
│       │   ├── ChatScreen.kt
│       │   └── ChatViewModel.kt
│       ├── models
│       │   ├── ModelsScreen.kt
│       │   └── ModelsViewModel.kt
│       ├── settings
│       │   ├── SettingsScreen.kt
│       │   └── SettingsViewModel.kt
│       └── profile
│           ├── ProfileScreen.kt
│           └── ProfileViewModel.kt
└── di
    ├── AppModule.kt
    ├── NetworkModule.kt
    ├── DatabaseModule.kt
    └── RepositoryModule.kt
```

---

## 💡 Ключевые функции

### **1. Streaming Chat** ⚡
```kotlin
// Поддержка потокового ответа от API
fun streamChat(request: ChatRequest): Flow<String> = flow {
    val response = chatApi.streamChatCompletion(request)
    response.body()?.byteStream()?.bufferedReader()?.use { reader ->
        reader.lineSequence().forEach { line ->
            if (line.startsWith("data: ")) {
                val data = line.substring(6)
                if (data != "[DONE]") {
                    emit(data)
                }
            }
        }
    }
}
```

### **2. Кэширование** 💾
```kotlin
// Сохранение чатов локально
@Entity(tableName = "chats")
data class ChatEntity(
    @PrimaryKey val id: String,
    val model: String,
    val title: String,
    val createdAt: Long
)

// Room DAO
@Dao
interface ChatDao {
    @Query("SELECT * FROM chats ORDER BY createdAt DESC")
    fun getAllChats(): Flow<List<ChatEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertChat(chat: ChatEntity)
}
```

### **3. Голосовой ввод** 🎤
```kotlin
// Использование Android Speech Recognition
fun startVoiceInput() {
    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                 RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ru-RU")
    }
    launcher.launch(intent)
}
```

### **4. Загрузка файлов** 📎
```kotlin
// Поддержка отправки изображений для multimodal моделей
fun uploadFile(uri: Uri): RequestBody {
    val file = File(uri.path)
    return file.asRequestBody("image/*".toMediaTypeOrNull())
}
```

### **5. Markdown рендеринг** 📝
```kotlin
// Использование библиотеки для отображения markdown
dependencies {
    implementation("com.github.jeziellago:compose-markdown:0.3.6")
}

@Composable
fun MarkdownText(text: String) {
    MarkdownText(
        markdown = text,
        color = MaterialTheme.colorScheme.onSurface
    )
}
```

---

## 🔐 Безопасность

### **1. Хранение токенов**
```kotlin
// Encrypted DataStore
class SecurePreferencesManager @Inject constructor(
    private val context: Context
) {
    private val dataStore = context.createDataStore(
        name = "secure_prefs",
        serializer = EncryptedSerializer
    )
    
    suspend fun saveToken(token: String) {
        dataStore.edit { prefs ->
            prefs[TOKEN_KEY] = token
        }
    }
}
```

### **2. SSL Pinning**
```kotlin
val certificatePinner = CertificatePinner.Builder()
    .add("lumeai.ru", "sha256/...")
    .build()

val client = OkHttpClient.Builder()
    .certificatePinner(certificatePinner)
    .build()
```

---

## 📦 Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.activity:activity-compose:1.8.2")
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // Lifecycle & ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // Hilt (DI)
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Retrofit & OkHttp
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")
    
    // Coil (Image Loading)
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Markdown
    implementation("com.github.jeziellago:compose-markdown:0.3.6")
    
    // Accompanist (System UI, Permissions)
    implementation("com.google.accompanist:accompanist-systemuicontroller:0.32.0")
    implementation("com.google.accompanist:accompanist-permissions:0.32.0")
}
```

---

## 🎯 Пошаговая реализация

### **Шаг 1: Базовая настройка**
1. Создать новый Android проект
2. Настроить Hilt DI
3. Создать тему Material 3
4. Настроить навигацию

### **Шаг 2: Сеть и API**
1. Создать API интерфейсы
2. Настроить Retrofit
3. Добавить перехватчики (AuthInterceptor, LoggingInterceptor)
4. Создать DTO классы

### **Шаг 3: База данных**
1. Создать Room Database
2. Создать DAO интерфейсы
3. Создать Entity классы

### **Шаг 4: Repository слой**
1. Создать репозитории
2. Реализовать кэширование
3. Обработка ошибок

### **Шаг 5: Domain слой**
1. Создать модели домена
2. Создать Use Cases
3. Бизнес-логика

### **Шаг 6: UI экраны**
1. Splash Screen
2. Login/Register
3. Main Chat Screen
4. Models Screen
5. Settings Screen
6. Profile Screen

### **Шаг 7: Дополнительные функции**
1. Голосовой ввод
2. Загрузка файлов
3. Markdown рендеринг
4. Push уведомления

### **Шаг 8: Тестирование и полировка**
1. Unit тесты
2. UI тесты
3. Оптимизация производительности
4. Обработка edge cases

---

## 📝 Пример кода

### **ChatScreen.kt**
```kotlin
@Composable
fun ChatScreen(
    viewModel: ChatViewModel = hiltViewModel(),
    onNavigateToModels: () -> Unit
) {
    val state by viewModel.state.collectAsState()
    
    Scaffold(
        topBar = {
            ChatTopBar(
                model = state.selectedModel,
                onModelClick = onNavigateToModels
            )
        },
        bottomBar = {
            ChatInput(
                message = state.currentMessage,
                onMessageChange = viewModel::onMessageChange,
                onSend = viewModel::sendMessage,
                isLoading = state.isLoading
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            reverseLayout = true
        ) {
            items(state.messages) { message ->
                MessageBubble(message = message)
            }
        }
    }
}
```

### **ChatViewModel.kt**
```kotlin
@HiltViewModel
class ChatViewModel @Inject constructor(
    private val sendMessageUseCase: SendMessageUseCase,
    private val getChatHistoryUseCase: GetChatHistoryUseCase
) : ViewModel() {
    
    private val _state = MutableStateFlow(ChatState())
    val state = _state.asStateFlow()
    
    fun sendMessage() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            
            val request = ChatRequest(
                model = _state.value.selectedModel,
                messages = _state.value.messages
            )
            
            sendMessageUseCase(request)
                .onSuccess { response ->
                    _state.update { state ->
                        state.copy(
                            messages = state.messages + response.message,
                            isLoading = false
                        )
                    }
                }
                .onFailure { error ->
                    _state.update { it.copy(
                        error = error.message,
                        isLoading = false
                    )}
                }
        }
    }
}
```

---

## 🚀 Дополнительные возможности

### **1. Виджеты**
- Виджет для быстрого доступа к чату
- Виджет статистики

### **2. Wear OS поддержка**
- Упрощенная версия для часов
- Голосовой ввод

### **3. Shortcuts**
- Быстрые действия с главного экрана
- Открыть новый чат с определенной моделью

### **4. Темы**
- Светлая/Темная тема
- Material You динамические цвета
- Кастомные темы

---

## 📱 Публикация

### **Google Play Store**
1. Создать подписанный APK/AAB
2. Подготовить скриншоты
3. Написать описание
4. Заполнить metadata
5. Опубликовать

### **Прямая установка (APK)**
1. Собрать release APK
2. Разместить на GitHub Releases
3. Создать QR код для скачивания

---

## 🎨 Иконка приложения

Создать адаптивную иконку с:
- Градиентный фон (фиолетовый)
- Символ звезды 🌟
- Название "LumeAI"

---

## ✅ Чек-лист готовности

- [ ] Аутентификация работает
- [ ] Чат отправляет и получает сообщения
- [ ] Поддержка streaming
- [ ] Выбор моделей
- [ ] История чатов сохраняется
- [ ] Работа оффлайн (кэш)
- [ ] Голосовой ввод
- [ ] Markdown рендеринг
- [ ] Настройки сохраняются
- [ ] Красивый UI/UX
- [ ] Плавные анимации
- [ ] Обработка ошибок
- [ ] Оптимизация батареи
- [ ] Поддержка разных размеров экранов
- [ ] Локализация (RU/EN)

---

## 📚 Полезные ссылки

- **API Документация**: https://lumeai.ru/api-docs
- **Function Calling**: https://lumeai.ru/function-calling
- **Endpoints**: https://lumeai.ru/api-endpoints

---

**Готово! Этот промт содержит все необходимое для создания полноценного Android приложения для работы с LumeAI API! 🚀**
