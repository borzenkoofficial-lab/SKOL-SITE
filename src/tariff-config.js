const CONFIG_FORMAT = "SKOL_TARIFF_CONFIG";
const PRODUCT = "SKOL_CRM";
const MAX_PLANS = 30;
const MAX_DEVICES = 50;
const MAX_PRICE = 100000000;

function boundedString(value, field, maxLength, { optional = false } = {}) {
  if (optional && (value === undefined || value === null || value === "")) return "";
  if (typeof value !== "string") {
    throw new Error("Поле " + field + " должно быть текстом.");
  }
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new Error("Поле " + field + " должно содержать от 1 до " + maxLength + " символов.");
  }
  return normalized;
}

function normalizeFeatures(value, knownIds) {
  if (value === undefined || value === null) value = [];
  if (!Array.isArray(value)) throw new Error("Состав тарифа должен быть массивом модулей.");
  if (value.length > knownIds.size) throw new Error("В тарифе слишком много модулей.");
  const ids = value.map((item) => {
    if (typeof item !== "string") throw new Error("ID модуля должен быть строкой.");
    const id = item.trim();
    if (!knownIds.has(id)) throw new Error("В тарифе найден неизвестный модуль: " + id + ".");
    return id;
  });
  if (new Set(ids).size !== ids.length) throw new Error("Состав тарифа содержит повторяющиеся модули.");
  return ids.sort();
}

function normalizePlan(input, index, knownIds, featureNames) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Некорректная запись тарифа.");
  }

  const allowedKeys = new Set([
    "id", "name", "description", "price", "maxDevices",
    "features", "enabled", "displayOrder"
  ]);
  if (Object.keys(input).some((key) => !allowedKeys.has(key))) {
    throw new Error("Тариф содержит неизвестные поля.");
  }

  const id = boundedString(input.id, "id", 48).toUpperCase();
  if (!/^[A-Z][A-Z0-9_-]{1,47}$/.test(id) || id === "CUSTOM") {
    throw new Error("ID тарифа указан некорректно или зарезервирован.");
  }
  const name = boundedString(input.name, "name", 80);
  const description = boundedString(input.description ?? "", "description", 300, { optional: true });
  const features = normalizeFeatures(input.features, knownIds);

  const rawPrice = input.price;
  const price = rawPrice === null || rawPrice === undefined || rawPrice === ""
    ? null
    : Number(rawPrice);
  if (price !== null && (!Number.isSafeInteger(price) || price < 0 || price > MAX_PRICE)) {
    throw new Error("Стоимость тарифа должна быть целым числом от 0 до 100 000 000 рублей или оставаться пустой.");
  }

  const maxDevices = Number(input.maxDevices ?? MAX_DEVICES);
  if (!Number.isSafeInteger(maxDevices) || maxDevices < 1 || maxDevices > MAX_DEVICES) {
    throw new Error("Лимит компьютеров должен быть от 1 до " + MAX_DEVICES + ".");
  }

  const enabled = input.enabled === undefined ? true : input.enabled;
  if (typeof enabled !== "boolean") throw new Error("Поле enabled должно быть логическим значением.");

  const displayOrder = Number(input.displayOrder ?? index + 1);
  if (!Number.isSafeInteger(displayOrder) || displayOrder < 1 || displayOrder > 999) {
    throw new Error("Порядок отображения тарифа указан некорректно.");
  }

  const base = id === "START"
    ? ["Клиенты и заявки", "Объекты и задачи", "Рабочее пространство", "Локальная база данных"]
    : ["Всё из START"];
  const featureNames = features.map((featureId) => featureNamesById(featureId, featureNames));
  const color = id === "START" ? "light" : id === "BUSINESS" ? "dark" : "red";
  const title = id === "START" ? "Рабочая база"
    : id === "PRO" ? "Контроль экономики"
      : id === "BUSINESS" ? "Полный контур" : name;
  const note = maxDevices < MAX_DEVICES
    ? "До " + maxDevices + " компьютеров · " + (description || "условия согласуются с менеджером")
    : description || "Стоимость и условия согласуются с менеджером";

  return {
    id, name, featureIds: features, title, desc: description,
    features: base.concat(featureNames), note, color, price,
    maxDevices, displayOrder, enabled
  };
}

function featureNamesById(id, featureNames) {
  const name = featureNames.get(id);
  if (!name) throw new Error("Для модуля " + id + " отсутствует название.");
  return name;
}

export function normalizePublicTariffConfig(config, featureCatalog) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    throw new Error("Файл конфигурации тарифов не является объектом JSON.");
  }

  const allowedConfigKeys = new Set([
    "format", "schemaVersion", "catalogVersion", "product",
    "currency", "featureIds", "plans"
  ]);
  if (Object.keys(config).some((key) => !allowedConfigKeys.has(key))) {
    throw new Error("Конфигурация содержит неизвестные поля.");
  }
  if (config.format !== CONFIG_FORMAT || config.schemaVersion !== 1 ||
      config.catalogVersion !== 1 || config.product !== PRODUCT) {
    throw new Error("Формат или версия конфигурации СКОЛ не поддерживается.");
  }
  if (config.currency !== "RUB") throw new Error("Для текущей версии поддерживаются только цены в RUB.");
  if (!Array.isArray(config.plans) || config.plans.length < 1 || config.plans.length > MAX_PLANS) {
    throw new Error("Конфигурация должна содержать от 1 до " + MAX_PLANS + " тарифов.");
  }
  if (!Array.isArray(featureCatalog) || !featureCatalog.length) {
    throw new Error("Каталог модулей СКОЛ не загружен.");
  }

  const featureNames = new Map();
  for (const item of featureCatalog) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" ||
        featureNames.has(item.id)) {
      throw new Error("Каталог модулей содержит некорректную запись.");
    }
    featureNames.set(item.id, item.name);
  }
  const knownIds = new Set(featureNames.keys());
  if (!Array.isArray(config.featureIds) ||
      config.featureIds.some((id) => typeof id !== "string") ||
      new Set(config.featureIds).size !== config.featureIds.length ||
      [...config.featureIds].sort().join("|") !== [...knownIds].sort().join("|")) {
    throw new Error("Каталог модулей в конфигурации не соответствует этой версии CRM.");
  }

  const mappedPlans = config.plans.map((plan, index) =>
    normalizePlan(plan, index, knownIds, featureNames)
  );
  const allIds = mappedPlans.map((plan) => plan.id);
  if (new Set(allIds).size !== allIds.length) throw new Error("ID тарифов должны быть уникальными.");

  const enabledPlans = mappedPlans
    .filter((plan) => plan.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, "ru"));
  if (!enabledPlans.length) throw new Error("В публичной конфигурации нет включённых тарифов.");

  return enabledPlans;
}
