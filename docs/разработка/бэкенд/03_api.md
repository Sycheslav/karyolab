# API

REST поверх HTTP/JSON. Базовый префикс `/api/v1`. Все ответы содержат поле `data` или ошибку с типизированным `code`.

## Общие Правила

### Формат Ответа

```json
{ "data": { ... } }
```

Ошибка:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Понятное русское сообщение",
    "details": { ... }
  }
}
```

Коды ошибок: `validation_error`, `not_found`, `conflict`, `forbidden`, `internal_error`.

### Пагинация

Через query: `?cursor=<opaque>&limit=50`. Ответ:

```json
{
  "data": [ ... ],
  "pageInfo": { "nextCursor": "...", "hasMore": true }
}
```

### Идемпотентность

Тяжёлые операции (импорт PSD, экспорт) принимают заголовок `Idempotency-Key`. Сервер сохраняет `(idempotency_key, response)` на 24 часа.

## Журнал

### Образцы

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/journal/samples` | Список с фильтрами `?status=`, `?species=`, `?q=` |
| `GET` | `/journal/samples/:id` | Карточка образца (включает плитки кариотипов и сравнений) |
| `POST` | `/journal/samples` | Создать |
| `PATCH` | `/journal/samples/:id` | Обновить мета-поля |
| `DELETE` | `/journal/samples/:id` | Soft-delete |

Карточка возвращает:

```json
{
  "data": {
    "sample": { ... },
    "plants": [ ... ],
    "preparations": [ ... ],
    "stainedPreparations": [ ... ],
    "metaphaseKaryotypes": [ ... ],
    "sampleKaryotypes": [
      { "id": "...", "previewUri": "...", "status": "утверждён" }
    ],
    "savedComparisons": [
      { "id": "...", "previewUri": "...", "comment": "..." }
    ],
    "events": [ ... ],
    "notes": [ ... ]
  }
}
```

### Растения / Препараты / Окрашенные Препараты

| Путь | Метод | Описание |
|---|---|---|
| `/journal/plants` | POST | создать растение или смесь (всегда привязано к sample_id) |
| `/journal/preparations` | POST | создать препарат |
| `/journal/preparations/:id/decision` | POST | решить судьбу после фото: `kept` / `rewashed` / `discarded` |

### Ивенты

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/journal/events` | Все ивенты, фильтры `?from=&to=&type=` |
| `GET` | `/journal/calendar` | Агрегированный календарь со стаками |
| `GET` | `/journal/day/:date` | Все ивенты дня (для отдельной страницы) |
| `POST` | `/journal/events` | Создать ивент |
| `PATCH` | `/journal/events/:id` | Редактировать |

Параметры создания зависят от `type`:

```json
// hybridization
{
  "type": "hybridization",
  "date": "2026-05-06",
  "preparationIds": [...],
  "probeIds": ["probe-pAs1", "probe-GAA"]
}

// wash
{
  "type": "wash",
  "date": "2026-05-06",
  "title": "WP-2026-05-06",
  "preparationIds": [...]
}

// photography
{
  "type": "photography",
  "date": "2026-05-06",
  "stainedPreparationDecisions": [
    { "stainedPreparationId": "...", "decision": "kept" | "rewashed" | "discarded" | "deferred" }
  ]
}
```

`deferred` означает "решу позже" — препарат остаётся в статусе `сфотографирован, судьба не решена`.
В гибридизации канал не передаётся отдельным полем: сервер получает его через справочник `probe -> fluorochrome -> channel`. DAPI автоматически относится к синему каналу и не требует ручного выбора канала в payload.

### Прогресс

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/journal/progress` | Пять колонок |

Ответ:

```json
{
  "data": {
    "matured": { "items": [...], "total": 12 },
    "awaitingWash": { "items": [...], "total": 8 },
    "washed": { "items": [...], "total": 5 },
    "hybridized": { "items": [...], "total": 4 },
    "withResult": { "items": [...], "total": 152, "nextCursor": "..." }
  }
}
```

### Заметки И Тильт

| Метод | Путь | Описание |
|---|---|---|
| `GET/POST/PATCH/DELETE` | `/journal/notes` | заметки |
| `GET/POST` | `/journal/tilts` | тильты |
| `GET` | `/journal/tilt-stats?year=2026` | годовая статистика `тильт / результат` |

## Кариотип

### Импорт PSD

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/karyotype/imports` | Загрузить PSD (multipart). Возвращает `import_id` и список найденных слоёв. |
| `POST` | `/karyotype/imports/:id/commit` | Подтвердить импорт. Принимает `excludedLayers`, `stainedPreparationId`. |

Ответ commit'а:

```json
{
  "data": {
    "metaphase": { "id": "1730.25.1.1.1.m1", ... },
    "chromosomes": [
      { "id": "1730.25.1.1.1.m1.c01", "filename": "untitled-1", "previewUri": "..." }
    ]
  }
}
```

### Хромосомы И Идеограммы

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/karyotype/chromosomes/:id` | хромосома |
| `PATCH` | `/karyotype/chromosomes/:id` | сменить filename, class_code (канонический id не меняется) |
| `PUT` | `/karyotype/chromosomes/:id/ideogram` | сохранить идеограмму |
| `GET` | `/karyotype/metaphases/:id/chromosomes` | список хромосом метафазы |

Тело идеограммы:

```json
{
  "scale": { "topY": 0.05, "bottomY": 0.95, "centromereY": 0.42 },
  "signals": [
    { "channel": "red", "type": "dot", "position": 0.3, "probeId": null }
  ],
  "anomalies": [
    { "typeId": "...", "position": 0.5, "comment": "..." }
  ]
}
```

### Кариотипы

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/karyotype/metaphase-karyotypes` | сохранить кариотип метафазы |
| `POST` | `/karyotype/sample-karyotypes` | сохранить кариотип образца — **копирует файлы хромосом** |
| `PATCH` | `/karyotype/sample-karyotypes/:id` | обновить layout, статус, эталонные пометки |
| `PATCH` | `/karyotype/sample-karyotypes/:id/chromosomes` | заменить хромосому без отзыва утверждения |
| `POST` | `/karyotype/sample-karyotypes/:id/approve` | утвердить (статус → `утверждён`) |
| `POST` | `/karyotype/sample-karyotypes/:id/archive` | архивировать |

Сохранение кариотипа образца:

```json
{
  "sampleId": "1730.25",
  "hybridizationEventId": "evt-123",
  "layout": { ... },
  "selectedChromosomeIds": ["1730.25.1.1.1.m1.c01", ...],
  "genomeAnomalies": [
    { "typeId": "...", "involvedClasses": ["5D"], "comment": "..." }
  ]
}
```

### Экспорт

| Метод | Путь | Описание |
|---|---|---|
| `POST` | `/karyotype/exports` | поставить задачу экспорта в очередь |
| `GET` | `/karyotype/exports/:id` | статус и ссылка на файл |

Тело запроса:

```json
{
  "sourceType": "sample_karyotype",
  "sourceId": "1730.25.kar.1",
  "templateId": "...",
  "format": "tiff",
  "params": {
    "displayMode": "chromosome_with_ideogram",
    "alignByCentromere": true,
    "includeProbeLabels": true,
    "includeAnomalyLabels": true
  }
}
```

Ответ создания — `202 Accepted` с `exportId` и ссылкой `pollUrl`. Когда задача готова, GET возвращает `status: "ready"` и `fileUri`.

## Атлас

### Сравнения

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/atlas/matrix` | данные для матрицы класс × субгеном × образец |
| `POST` | `/atlas/comparisons` | сохранить сравнение как объект `SavedComparison` |
| `GET` | `/atlas/comparisons` | список сохранённых сравнений |
| `GET` | `/atlas/comparisons/:id` | развернуть сравнение |
| `DELETE` | `/atlas/comparisons/:id` | удалить |

### Справочники

CRUD по каждой таблице:

| Базовый путь |
|---|
| `/atlas/dictionaries/species` |
| `/atlas/dictionaries/subgenome-templates` |
| `/atlas/dictionaries/probes` |
| `/atlas/dictionaries/fluorochromes` |
| `/atlas/dictionaries/chromosome-anomalies` |
| `/atlas/dictionaries/genome-anomalies` |
| `/atlas/dictionaries/theoretical-records` |

При попытке удалить тип аномалии, который где-то используется, сервер возвращает 409 со списком ссылок:

```json
{
  "error": {
    "code": "conflict",
    "message": "Тип используется в идеограммах",
    "details": {
      "usedIn": [
        { "type": "ideogram_anomaly", "id": "...", "chromosomeId": "..." }
      ]
    }
  }
}
```

## Поиск

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/search?q=...&types=sample,event,chromosome` | глобальный |

Ответ группируется по типу:

```json
{
  "data": {
    "samples": [...],
    "events": [...],
    "chromosomes": [...],
    "anomalies": [...]
  }
}
```

## Файлы

| Метод | Путь | Описание |
|---|---|---|
| `GET` | `/files/:fileId` | стрим файла (PSD, фото, TIFF, копия хромосомы) — с авторизацией |

См. [04_хранение_файлов.md](04_хранение_файлов.md) для деталей хранения.

## Связанные Документы

- [README.md](README.md)
- [01_архитектура.md](01_архитектура.md)
- [02_модель_данных.md](02_модель_данных.md)
- [05_статусы_и_события.md](05_статусы_и_события.md)
- [09_импорт_psd.md](09_импорт_psd.md)
- [10_экспорт_изображений.md](10_экспорт_изображений.md)
- [../фронтенд/03_контракты_с_бэкендом.md](../фронтенд/03_контракты_с_бэкендом.md)
