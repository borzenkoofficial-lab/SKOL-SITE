import "./styles.css";\nimport "./skol-home.css";
import "./visual-stability.css";
import "./motion-system.css";
import { initMotionSystem } from "./motion-system.js";
import { normalizePublicTariffConfig } from "./tariff-config.js";
const VERSION = "1.25.0";
const RELEASES = "https://github.com/borzenkoofficial-lab/struktura-crm-source/releases";
/* Access IDs mirror FEATURE_CATALOG in struktura-crm-source/src/license-catalog.cjs; legacy-only IDs are intentionally excluded. */
const tariffFeatures = [
  {id:"engineering",name:"Инженерный расчёт",description:"Расчёт стоимости, состава и трудоёмкости работ."},
  {id:"engineering_plans",name:"Инженерные планы",description:"Работа с инженерными планами и ведомостями."},
  {id:"finance",name:"Финансы и платежи",description:"Поступления, расходы и финансовые показатели."},
  {id:"order_radar",name:"Радар заказов",description:"Поиск и обработка потенциальных заказов."},
  {id:"production",name:"Производство и ПИ",description:"Планирование и контроль производства."},
  {id:"reports",name:"Отчёты",description:"Отчётные представления и сводки."},
  {id:"web_browser",name:"Встроенный браузер",description:"Встроенный браузер для работы с веб-источниками."}
];
let tariffConfig = null;
let plans = [
  {id:"START",name:"START",featureIds:[],title:"Рабочая база",desc:"Клиенты, заявки, объекты и задачи — базовое пространство для ежедневной работы.",features:["Клиенты и заявки","Объекты и задачи","Рабочее пространство","Локальная база данных"],note:"Для самостоятельной работы и небольших команд",color:"light",price:null,maxDevices:50},
  {id:"PRO",name:"PRO",featureIds:["engineering","finance","production","reports"],title:"Контроль экономики",desc:"Расширенный контур для расчётов, производства и контроля финансов.",features:["Всё из START","Финансы и платежи","Производство и ПИ","Инженерный расчёт","Отчёты"],note:"Для подрядчиков и руководителей проектов",color:"red",price:null,maxDevices:50},
  {id:"BUSINESS",name:"BUSINESS",featureIds:["engineering","engineering_plans","finance","order_radar","production","reports","web_browser"],title:"Полный контур",desc:"Инструменты поиска заказов и полный набор доступных модулей СКОЛ CRM.",features:["Всё из START","Финансы и платежи","Производство и ПИ","Инженерный расчёт","Отчёты","Радар заказов","Инженерные планы","Встроенный браузер"],note:"Для компаний с несколькими направлениями",color:"dark",price:null,maxDevices:50}
];
function applyTariffConfig(config){
  const nextPlans=normalizePublicTariffConfig(config,tariffFeatures);
  tariffConfig=config;
  plans=nextPlans;
  return true;
}
async function loadTariffConfig(){
  const controller=typeof AbortController==="function"?new AbortController():null;
  const timeout=controller?window.setTimeout(()=>controller.abort(),5000):null;
  try{
    const options={cache:"no-store"};
    if(controller)options.signal=controller.signal;
    const response=await fetch("/skol-tariff-config.json",options);
    if(!response.ok)throw new Error("Файл тарифной конфигурации недоступен.");
    const config=await response.json();
    applyTariffConfig(config);
  }catch(error){
    const reason=error?.name==="AbortError"?"Истекло время ожидания файла тарифов.":error?.message||"Неизвестная ошибка.";
    console.warn("SKOL tariff config fallback:",reason);
  }finally{
    if(timeout!==null)window.clearTimeout(timeout);
  }
}
function escapeHtml(value){
  const entities={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
  return String(value??"").replace(/[&<>"']/g,char=>entities[char]);
}
function currentTariffFeatures(){
  return [...document.querySelectorAll("[data-feature-toggle]:checked")].map(input=>input.dataset.featureToggle).sort();
}
function createTariffLicenseRequest(form){
  const data=form?new FormData(form):new FormData();
  const planId=document.querySelector("#plan-select")?.value||"CUSTOM";
  const plan=plans.find(item=>item.id===planId);
  const features=currentTariffFeatures();
  return {
    format:"SKOL_LICENSE_REQUEST",
    schemaVersion:1,
    catalogVersion:1,
    product:"SKOL_CRM",
    planId:plan?plan.id:"CUSTOM",
    planName:plan?(plan.name||plan.title):"Индивидуальная конфигурация",
    features,
    seatCount:Number(data.get("seats")||1),
    customer:{name:String(data.get("name")||"").trim(),contact:String(data.get("contact")||"").trim()},
    message:""
  };
}
function downloadTariffLicenseRequest(){
  const form=document.querySelector("#tariff-form");
  const seatsField=form?.elements?.namedItem("seats");
  if(seatsField&&!seatsField.checkValidity()){
    seatsField.reportValidity();
    toast("Для выбранного тарифа доступно от 1 до "+(seatsField.max||50)+" компьютеров.");
    return;
  }
  const request=createTariffLicenseRequest(form);
  const blob=new Blob([JSON.stringify(request,null,2)],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download="skol-license-request.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("JSON-заявка подготовлена для импорта в СКОЛ License Manager.");
}
function tariffBuilder(){
  const groups=[
    {id:"engineering",number:"01",title:"Расчёт и проектирование",subtitle:"Сметная логика и работа с планами",features:["engineering","engineering_plans"]},
    {id:"management",number:"02",title:"Финансы и аналитика",subtitle:"Деньги, показатели и отчётность",features:["finance","reports"]},
    {id:"production",number:"03",title:"Производство",subtitle:"Планирование и исполнение работ",features:["production"]},
    {id:"sources",number:"04",title:"Поиск и источники",subtitle:"Поиск заказов и веб-инструменты",features:["order_radar","web_browser"]}
  ];
  const featureCards=group=>group.features.map(id=>{
    const feature=tariffFeatures.find(item=>item.id===id);
    if(!feature)return "";
    return '<label class="builder-module" data-builder-module><input type="checkbox" data-feature-toggle="'+feature.id+'" id="builder-'+feature.id+'" aria-describedby="builder-description-'+feature.id+'"><span class="builder-module-check" aria-hidden="true"><i>✓</i></span><span class="builder-module-copy"><span class="builder-module-code">'+feature.id.replace(/_/g," ").toUpperCase()+'</span><b>'+feature.name+'</b><small id="builder-description-'+feature.id+'">'+feature.description+'</small></span><span class="builder-module-action" aria-hidden="true">+</span></label>';
  }).join("");
  return '<section class="tariff-builder section-pad" id="tariff-builder"><div class="tariff-builder-backdrop" aria-hidden="true"><i></i><i></i><i></i></div><div class="section-kicker"><span>02 / КОНСТРУКТОР ЛИЦЕНЗИИ</span><span>BUILD YOUR WORKSPACE / SKOL CRM</span></div><div class="tariff-builder-heading"><div><p class="eyebrow">СОБЕРИТЕ СВОЮ КОНФИГУРАЦИЮ</p><h2>Только нужные<br><em>инструменты.</em></h2><p>Выберите разделы и возможности, которыми действительно будет пользоваться ваша команда. Состав обновляется сразу, а готовая конфигурация попадёт в заявку и файл для СКОЛ CRM.</p></div><div class="builder-counter"><div class="builder-progress-ring" id="builder-progress-ring" style="--progress:0%"><span><b id="builder-count">0 / '+tariffFeatures.length+'</b><small>МОДУЛЕЙ</small></span></div><div class="builder-counter-copy"><b id="builder-counter-caption">Базовый контур</b><span>ДОПОЛНИТЕЛЬНЫХ ВОЗМОЖНОСТЕЙ</span></div></div></div><div class="builder-presets"><div class="builder-presets-label"><span>БЫСТРЫЙ СТАРТ</span><small>Можно начать с готового набора и изменить его под себя</small></div><div class="builder-preset-list">'+plans.map((plan,index)=>'<button type="button" class="builder-preset" data-builder-preset="'+escapeHtml(plan.id)+'" aria-pressed="false"><span class="builder-preset-index">0'+(index+1)+'</span><span class="builder-preset-copy"><b>'+escapeHtml(plan.name)+'</b><small>'+escapeHtml(plan.title||plan.desc||"Готовая конфигурация")+'</small></span><i aria-hidden="true">↗</i></button>').join("")+'<button type="button" class="builder-preset builder-preset-reset" data-builder-reset><span class="builder-preset-index">↺</span><span class="builder-preset-copy"><b>Сбросить</b><small>Только базовые разделы</small></span></button></div></div><div class="builder-included"><div class="builder-included-mark"><i>✓</i></div><div class="builder-included-copy"><b>Уже входит в любую конфигурацию</b><span>Клиенты · Заявки · Объекты · Задачи · Рабочее пространство · Локальная база данных</span></div><span class="builder-included-tag">БАЗОВЫЙ УРОВЕНЬ</span></div><div class="tariff-builder-grid"><div class="builder-controls"><div class="builder-controls-top"><div><span class="builder-step">01 — ВЫБОР МОДУЛЕЙ</span><h3>Что нужно вашей команде?</h3></div><span class="builder-controls-hint">Нажмите на карточку, чтобы подключить модуль</span></div><div class="builder-module-groups">'+groups.map(group=>'<section class="builder-module-group" data-builder-group="'+group.id+'"><div class="builder-group-heading"><span class="builder-group-number">'+group.number+'</span><div><b>'+group.title+'</b><small>'+group.subtitle+'</small></div><span class="builder-group-count" data-group-count="'+group.id+'">0 / '+group.features.length+'</span></div><div class="builder-module-list">'+featureCards(group)+'</div></section>').join("")+'</div><div class="builder-controls-bottom"><span><i></i> Выбор можно изменить в любой момент</span><button type="button" data-builder-reset-inline>Сбросить выбор ↺</button></div></div><aside class="builder-summary" aria-label="Итог выбранной конфигурации"><div class="builder-summary-grid" aria-hidden="true"></div><div class="builder-summary-top"><span class="builder-summary-live"><i></i> LIVE CONFIGURATION</span><span class="builder-summary-code">SKOL / CRM</span></div><span class="builder-summary-label">ВАША КОНФИГУРАЦИЯ</span><div class="builder-summary-name-row"><h3 id="builder-plan-name">START</h3><span class="builder-summary-type" id="builder-plan-type">ГОТОВЫЙ НАБОР</span></div><p id="builder-plan-description">Базовое рабочее пространство СКОЛ CRM.</p><div class="builder-summary-progress"><div><span>СОБРАНО МОДУЛЕЙ</span><b id="builder-module-count">0 / '+tariffFeatures.length+'</b></div><span class="builder-summary-track"><i id="builder-progress-fill"></i></span></div><div class="builder-summary-list-head"><span>ПОДКЛЮЧЁННЫЕ ВОЗМОЖНОСТИ</span><b id="builder-selected-count">0</b></div><ul id="builder-feature-summary" aria-live="polite"><li class="builder-summary-empty">Базовые разделы уже включены</li></ul><div class="builder-seat-control"><div><span>РАБОЧИЕ КОМПЬЮТЕРЫ</span><small>Количество устройств для лицензии</small></div><div class="builder-seat-stepper"><button type="button" data-seat-step="-1" aria-label="Уменьшить количество компьютеров">−</button><input type="number" id="builder-seats" min="1" max="50" value="1" inputmode="numeric" aria-label="Количество компьютеров"><button type="button" data-seat-step="1" aria-label="Увеличить количество компьютеров">+</button></div></div><div class="builder-price"><small>СТОИМОСТЬ КОНФИГУРАЦИИ</small><b id="builder-price">По запросу</b></div><p class="builder-price-note" id="builder-price-note">Стоимость подтверждается менеджером. Состав модулей и количество компьютеров будут сохранены в заявке.</p><button class="button button-red builder-download" id="downloadTariffRequest" type="button">Скачать конфигурацию <span>↗</span></button><a class="builder-text-link" href="#tariff-request">Перейти к заявке и контактам ↓</a><span class="builder-summary-foot">LOCAL LICENSE / SIGNED BY SKOL</span></aside></div></section>';
}


const path = location.pathname.replace(/\/+$/, "") || "/";
const route = path === "/catalog" ? "catalog" : path === "/products/skol-crm" ? "product" : path === "/download" ? "download" : path === "/tariffs" ? "tariffs" : path === "/activation" ? "activation" : "home";
const nav = [["Программа","/#product"],["Возможности","/#features"],["Тарифы","/tariffs"],["Скачать","/download"]];
function logo(){return '<a class="brand" href="/" aria-label="СКОЛ — платформа программных продуктов"><span class="brand-word">СКОЛ<span class="brand-dot">.</span></span><span class="brand-caption">SOFTWARE</span></a>'}
function header(){const items=[['Продукты','/catalog'],['Платформа','/#about'],['Тарифы','/tariffs'],['Поддержка','/#contact']];const links=items.map(n=>{const active=n[1]==="/catalog"?(route==="catalog"||route==="product"):n[1]==="/tariffs"?route==="tariffs":n[1]==="/#about"?location.hash==="#about":n[1]==="/#contact"?location.hash==="#contact":false;return '<a href="'+n[1]+'" data-nav-item'+(active?' class="active" aria-current="page"':'')+'><span>'+n[0]+'</span><i aria-hidden="true"></i></a>'}).join("");return '<header class="site-header"><div class="header-inner">'+logo()+'<nav class="desktop-nav" aria-label="Основная навигация">'+links+'</nav><div class="header-actions"><a class="header-link" href="/activation">Активация</a><button class="theme-toggle" type="button" aria-label="Включить тёмную тему" aria-pressed="false"><span class="theme-toggle-icon" aria-hidden="true">◐</span><span class="theme-toggle-label">Светлая тема</span></button><a class="button button-small button-dark" href="/catalog">Каталог <span>↗</span></a><button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false" aria-controls="mobile-menu"><i></i><i></i></button></div></div><div class="mobile-menu" id="mobile-menu">'+[['Продукты','/catalog'],['Платформа','/#about'],['Тарифы','/tariffs'],['Загрузки','/download'],['Активация','/activation'],['Поддержка','/#contact']].map(n=>'<a href="'+n[1]+'">'+n[0]+' <span>↗</span></a>').join("")+'</div></header>'}
function footer(){return '<footer class="footer"><div class="footer-top"><div class="footer-brand">'+logo()+'<p>Программные продукты для повседневных задач бизнеса.<br>Одна платформа. Разные инструменты.</p></div><div class="footer-links"><span>ПЛАТФОРМА</span><a href="/#products">Каталог продуктов</a><a href="/#about">О платформе</a><a href="/tariffs">Лицензии СКОЛ CRM</a></div><div class="footer-links"><span>ПОЛЬЗОВАТЕЛЯМ</span><a href="/download">Загрузки и обновления</a><a href="/activation">Активация</a><a href="/#contact">Связаться с нами</a></div><div class="footer-note"><i class="status-dot"></i> Новые продукты будут появляться в каталоге.</div></div><div class="footer-bottom"><span>© '+new Date().getFullYear()+' СКОЛ</span><span>SOFTWARE PLATFORM</span><a href="https://github.com/borzenkoofficial-lab" target="_blank" rel="noreferrer">GitHub ↗</a></div></footer>'}
function contact(){return '<section class="contact-section section-pad" id="contact"><div class="section-kicker"><span>06 / СВЯЗЬ</span><span>ОБРАТНАЯ СВЯЗЬ</span></div><div class="contact-grid"><div><p class="eyebrow">ЕСТЬ ВОПРОС ПО СКОЛ?</p><h2>Давайте обсудим<br><em>вашу задачу.</em></h2><p class="muted">Оставьте тему обращения. Сайт подготовит текст сообщения для отправки по согласованному каналу связи.</p></div><form class="contact-form" id="contact-form"><label>Как к вам обращаться<input name="name" placeholder="Ваше имя" required maxlength="80"></label><label>Контакт для ответа<input name="contact" placeholder="Телефон, Telegram или email" required maxlength="120"></label><label>Тема обращения<select name="topic"><option>Хочу купить СКОЛ</option><option>Консультация по тарифам</option><option>Установка и активация</option><option>Сотрудничество</option><option>Техническая поддержка</option></select></label><label>Сообщение<textarea name="message" placeholder="Опишите задачу или вопрос" rows="3" maxlength="1200"></textarea></label><button class="button button-red" type="submit">Скопировать обращение ↗</button><p class="form-hint">Форма пока не отправляет данные на сервер — она подготовит текст обращения для копирования.</p></form></div></section>'}
function mock(){return '<div class="product-stage" id="product-demo"><div class="stage-meta"><span><i class="live-dot"></i> ИНТЕРФЕЙС СКОЛ</span><span>01 — 04 / ПРЕВЬЮ</span></div><div class="app-window"><div class="app-topbar"><div class="window-dots"><i></i><i></i><i></i></div><span class="app-title">СКОЛ <b>/</b> Рабочее пространство</span><span class="app-top-right">ЛОКАЛЬНЫЙ РЕЖИМ <i></i></span></div><div class="app-layout"><aside class="app-sidebar"><div class="app-mini-logo">С</div><div class="app-side-group"><span>РАБОТА</span><b class="side-active">▦ <small>Обзор</small></b><b>◫ <small>Заявки</small></b><b>⌂ <small>Объекты</small></b><b>◷ <small>Задачи</small></b></div><div class="app-side-group"><span>УПРАВЛЕНИЕ</span><b>▤ <small>Сметы</small></b><b>⌁ <small>Производство</small></b><b>◈ <small>Финансы</small></b></div><div class="sidebar-bottom">СКОЛ <small>DESKTOP '+VERSION+'</small></div></aside><div class="app-main"><div class="app-heading"><div><small>РАБОЧЕЕ ПРОСТРАНСТВО</small><h3 id="demo-title">Общая картина работы</h3></div><span class="app-avatar">С</span></div><div class="demo-tabs"><button class="demo-tab active" data-demo="overview" aria-pressed="true" aria-controls="demo-content">Обзор</button><button class="demo-tab" data-demo="objects" aria-pressed="false" aria-controls="demo-content">Объекты</button><button class="demo-tab" data-demo="estimates" aria-pressed="false" aria-controls="demo-content">Сметы</button><button class="demo-tab" data-demo="finance" aria-pressed="false" aria-controls="demo-content">Финансы</button></div><div id="demo-content"><div class="metric-row"><div class="metric-card"><span>АКТИВНЫЕ ЗАЯВКИ</span><strong>18</strong><small>В работе</small></div><div class="metric-card"><span>ОБЪЕКТЫ</span><strong>07</strong><small>Текущие проекты</small></div><div class="metric-card"><span>ЗАДАЧИ НА НЕДЕЛЮ</span><strong>24</strong><small>Планирование</small></div></div><div class="demo-lower"><div class="demo-panel"><div class="panel-title">Последние заявки <span>Все заявки ↗</span></div><div class="demo-line"><i>01</i><div><b>Демонтаж помещения</b><small>Москва · Коммерческий объект</small></div><em>В РАБОТЕ</em></div><div class="demo-line"><i>02</i><div><b>Подготовка объекта</b><small>Московская область</small></div><em>НОВАЯ</em></div><div class="demo-line"><i>03</i><div><b>Комплексная отделка</b><small>Москва · Частный заказ</small></div><em>РАСЧЁТ</em></div></div><div class="demo-panel demo-chart"><div class="panel-title">Динамика работы <span>30 дней</span></div><div class="chart-bars">'+[35,52,43,70,58,84,66,100,77,91].map(x=>'<i style="--h:'+x+'%"></i>').join("")+'</div><div class="chart-labels"><span>01</span><span>10</span><span>20</span><span>30</span></div></div></div></div></div></div><div class="stage-caption"><span>01 — ИНТЕРФЕЙС</span><span>Демонстрационный макет · данные условные</span><span>СКОЛ / DESKTOP</span></div><div class="floating-chip chip-a"><b>⌘</b><span>Всё в одной системе<small>От заявки до результата</small></span></div><div class="floating-chip chip-b"><b>◉</b><span>Без обязательного облака<small>Локальная база данных</small></span></div></div>'}
function home(){return `<main class="page-home skol-home">
<section class="skol-hero section-pad" aria-labelledby="skol-home-title">
  <div class="skol-hero-meta"><span><i></i> SKOL SOFTWARE / DIGITAL SYSTEMS</span><span>01 — PRODUCT PLATFORM / 2026</span></div>
  <div class="skol-hero-grid">
    <div class="skol-hero-copy">
      <p class="skol-kicker">ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ ДЛЯ РЕАЛЬНОЙ РАБОТЫ</p>
      <h1 id="skol-home-title">Сложные<br>процессы.<br><em>Под контролем.</em></h1>
      <p class="skol-hero-lead">Создаём инструменты, которые помогают организовать рабочие процессы, данные и решения — без лишней сложности.</p>
      <div class="skol-hero-actions"><a class="skol-button skol-button-dark" href="/catalog"><span>Исследовать продукты</span><b>↗</b></a><a class="skol-text-link" href="/#about">Принципы платформы <span>↓</span></a></div>
      <div class="skol-hero-index"><span>PLATFORM / 001</span><span>WINDOWS SOFTWARE</span><span>LOCAL-FIRST PRODUCT</span></div>
    </div>
    <div class="skol-system-visual" role="img" aria-label="Схема связей между информацией, процессами, управлением и экономикой">
      <div class="skol-visual-top"><span>OPERATION MAP</span><span>FIG. 001 / SYSTEM LOGIC</span></div>
      <svg viewBox="0 0 620 470" aria-hidden="true" focusable="false">
        <defs><pattern id="skol-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" stroke-opacity=".09" stroke-width="1"/></pattern></defs>
        <rect width="620" height="470" fill="url(#skol-grid)"/>
        <g class="skol-wires"><path d="M105 238 L250 126 L420 185 L520 325 M105 238 L250 355 L420 185 M250 126 L250 355 M420 185 L520 325"/><path d="M105 238H42 M520 325h55"/></g>
        <g class="skol-node skol-node-main"><circle cx="105" cy="238" r="38"/><text x="105" y="244" text-anchor="middle">SKOL</text><text class="skol-node-label" x="105" y="294" text-anchor="middle">SYSTEM</text></g>
        <g class="skol-node"><circle cx="250" cy="126" r="29"/><text x="250" y="132" text-anchor="middle">01</text><text class="skol-node-label" x="250" y="82" text-anchor="middle">INFORMATION</text></g>
        <g class="skol-node"><circle cx="250" cy="355" r="29"/><text x="250" y="361" text-anchor="middle">02</text><text class="skol-node-label" x="250" y="405" text-anchor="middle">PROCESS</text></g>
        <g class="skol-node skol-node-active"><circle cx="420" cy="185" r="34"/><text x="420" y="191" text-anchor="middle">03</text><text class="skol-node-label" x="420" y="235" text-anchor="middle">CONTROL</text></g>
        <g class="skol-node"><circle cx="520" cy="325" r="25"/><text x="520" y="331" text-anchor="middle">04</text><text class="skol-node-label" x="520" y="367" text-anchor="middle">ECONOMY</text></g>
      </svg>
      <div class="skol-visual-bottom"><span>CONNECTED WORKFLOWS</span><span><i></i> STRUCTURE / NOT TO SCALE</span></div>
      <span class="skol-visual-index">001</span>
    </div>
  </div>
  <div class="skol-hero-bottom"><span>01 / SOFTWARE PRODUCTS</span><span>02 / PRODUCT THINKING</span><span>03 / ENGINEERING</span><a href="#products">SCROLL TO EXPLORE ↓</a></div>
</section>

<section class="skol-section skol-products section-pad" id="products">
  <div class="skol-section-top"><span>02 / PRODUCT SYSTEM</span><span>ДОСТУПНЫЕ ПРОДУКТЫ</span></div>
  <div class="skol-section-heading"><div><p class="skol-kicker">ИНСТРУМЕНТЫ ДЛЯ КОНКРЕТНЫХ ЗАДАЧ</p><h2>Не набор функций.<br><em>Рабочая система.</em></h2></div><p>Каждый продукт СКОЛ создаётся вокруг реального сценария. В каталоге публикуются программы, которые можно изучить, установить и использовать.</p></div>
  <article class="skol-product-card" data-home-folder>
    <div class="skol-product-main">
      <div class="skol-product-label"><span>PRODUCT 001 / BUSINESS MANAGEMENT</span><span class="skol-available"><i></i> ДОСТУПЕН</span></div>
      <div class="skol-product-title"><span class="skol-product-number">01</span><h3>СКОЛ <em>CRM</em></h3></div>
      <p class="skol-product-description">Настольная система для управления клиентами, заявками, объектами и рабочими процессами строительной компании.</p>
      <div class="skol-product-tags"><span>WINDOWS 10 / 11</span><span>LOCAL SQLITE</span><span>DESKTOP APP</span></div>
      <div class="skol-product-links"><a class="skol-button skol-button-lime" href="/products/skol-crm"><span>Изучить продукт</span><b>↗</b></a><button class="skol-expand-button home-folder-trigger" type="button" aria-expanded="false" aria-controls="skol-crm-details">Состав продукта <span>＋</span></button></div>
    </div>
    <div class="skol-product-graphic" aria-label="Схема продуктовых модулей СКОЛ CRM">
      <div class="skol-product-graphic-head"><span>SKOL CRM / MODULE MAP</span><span>LOCAL DESKTOP</span></div>
      <div class="skol-module-core"><b>СКОЛ</b><span>CRM / CORE</span></div>
      <div class="skol-module module-a"><b>01</b><span>Клиенты</span></div><div class="skol-module module-b"><b>02</b><span>Объекты</span></div><div class="skol-module module-c"><b>03</b><span>Задачи</span></div><div class="skol-module module-d"><b>04</b><span>Расчёты*</span></div>
      <div class="skol-module-lines" aria-hidden="true"></div>
      <div class="skol-product-graphic-foot"><span>* СОСТАВ ДОСТУПА ЗАВИСИТ ОТ ЛИЦЕНЗИИ</span><span>FIG. 002</span></div>
    </div>
    <div class="skol-product-details" id="skol-crm-details"><div><span>01 / BASE WORKSPACE</span><p>Клиенты, заявки, объекты и задачи.</p></div><div><span>02 / PROJECT WORK</span><p>Сметы, коммерческие предложения и производственные процессы.</p></div><div><span>03 / ECONOMICS</span><p>Финансовые инструменты и отчётность в соответствии с выбранной редакцией.</p></div><div><span>04 / DATA MODEL</span><p>Основная база приложения хранится локально на компьютере.</p></div></div>
  </article>
  <div class="skol-product-foot"><span>PRODUCT PIPELINE / 002—∞</span><p>Следующие продукты появятся здесь после готовности и проверки. Не публикуем концепты как готовые программы.</p><a href="/catalog">Весь каталог ↗</a></div>
</section>

<section class="skol-section skol-method section-pad" id="about">
  <div class="skol-section-top"><span>03 / DESIGN PRINCIPLES</span><span>СИСТЕМА КООРДИНАЦИИ ОПЕРАЦИЙ И ЛОГИКИ</span></div>
  <div class="skol-method-heading"><p class="skol-kicker">ПОДХОД СКОЛ</p><h2>Сначала понять связи.<br><em>Затем строить систему.</em></h2><p>В реальной работе задачи, люди, сроки и данные влияют друг на друга. Программный инструмент должен делать эти связи понятными, а не добавлять ещё один слой сложности.</p></div>
  <div class="skol-principles">
    <article><span>01 / STRUCTURE</span><b>Система</b><p>Связываем информацию и рабочие сценарии в понятную структуру.</p><i>С</i></article>
    <article><span>02 / COORDINATION</span><b>Координация</b><p>Помогаем видеть связи между людьми, этапами и действиями.</p><i>К</i></article>
    <article><span>03 / OPERATIONS</span><b>Операции</b><p>Учитываем реальные ежедневные процессы, а не абстрактные сценарии.</p><i>О</i></article>
    <article><span>04 / LOGIC</span><b>Логика</b><p>Делаем правила и состояния продукта предсказуемыми.</p><i>Л</i></article>
  </div>
</section>

<section class="skol-section skol-platform section-pad">
  <div class="skol-section-top"><span>04 / PRODUCT ENGINEERING</span><span>ПРИНЦИПЫ РАЗРАБОТКИ</span></div>
  <div class="skol-platform-grid"><div><p class="skol-kicker">ТЕХНОЛОГИИ БЕЗ ЛИШНИХ ОБЕЩАНИЙ</p><h2>Понятная технология.<br><em>Проверяемый результат.</em></h2></div><div class="skol-engineering-list"><div><span>01</span><b>Реальные возможности</b><p>Описываем только то, что подтверждено в актуальной версии продукта.</p></div><div><span>02</span><b>Прозрачная модель данных</b><p>Объясняем, где хранятся данные и какие функции требуют интернета.</p></div><div><span>03</span><b>Проверка перед выпуском</b><p>Сборка, сценарии, обновления и документация проходят отдельную проверку.</p></div></div></div>
</section>

<section class="skol-final section-pad">
  <div class="skol-final-grid"><div><p class="skol-kicker">SKOL SOFTWARE / NEXT STEP</p><h2>Найдём инструмент<br><em>для вашей задачи.</em></h2><p>Изучите доступные продукты или расскажите, какой рабочий процесс хотите организовать.</p><div class="skol-hero-actions"><a class="skol-button skol-button-lime" href="/catalog"><span>Открыть каталог</span><b>↗</b></a><a class="skol-text-link" href="/#contact">Связаться с нами <span>↗</span></a></div></div><div class="skol-final-mark" aria-hidden="true"><span>SKOL</span><b>S</b><i>SOFTWARE<br>PLATFORM<br>2026</i><small>EST. / DIGITAL SYSTEMS</small></div></div>
</section>
${contact()}</main>`}
function catalog(){return '<main class="inner-page catalog-page"><section class="inner-hero section-pad"><div class="section-kicker"><span>СКОЛ / PRODUCT CATALOG</span><span>01 — SOFTWARE</span></div><p class="eyebrow">КАТАЛОГ ПРОГРАММ</p><h1>Программы для<br><em>конкретных задач.</em></h1><div class="inner-hero-bottom"><p>Самостоятельные программные продукты СКОЛ. У каждой программы — назначение, возможности, версия, условия доступа и документация. В каталоге публикуются только реально существующие продукты.</p><span class="catalog-count"><b>01</b><small>ПРОДУКТ<br>ДОСТУПЕН</small></span></div></section><section class="catalog-list section-pad"><div class="catalog-list-head"><div><span class="eyebrow">ДОСТУПНО СЕЙЧАС</span><h2>Продукты <em>СКОЛ.</em></h2></div><span>01 / 01 · WINDOWS SOFTWARE</span></div><article class="catalog-folder" data-catalog-folder><span class="folder-tab"><span>PRODUCT 001</span><span class="folder-tab-state"><i></i> ДОСТУПЕН</span></span><button class="folder-trigger" type="button" aria-expanded="false" aria-controls="catalog-product-details" aria-label="Открыть папку продукта СКОЛ CRM"><span class="folder-cover"><span class="folder-cover-copy"><span class="eyebrow">BUSINESS MANAGEMENT · WINDOWS DESKTOP</span><strong class="folder-product-name">СКОЛ <em>CRM</em></strong><span class="folder-cover-description">Рабочая система для клиентов, заявок, объектов, смет и управления компанией — в одном приложении.</span><span class="folder-cover-tags"><i>WINDOWS 10 / 11</i><i>LOCAL DATA</i><i>OFFLINE LICENSE</i></span><span class="folder-open-hint"><span class="folder-open-icon">↗</span><span><b>Открыть папку продукта</b><small>Наведите курсор или нажмите</small></span></span></span><span class="folder-cover-art"><span class="folder-orange-panel"><b>SKOL</b><i>PRODUCT<br>001</i><small>SOFTWARE<br>THAT WORKS</small></span><span class="folder-screen"><span class="folder-screen-top"><i><b></b><b></b><b></b></i><strong>СКОЛ / WORKSPACE</strong><small>LOCAL</small></span><span class="folder-screen-body"><span class="folder-screen-sidebar"><b>S</b><i></i><i></i><i></i><i></i></span><span class="folder-screen-content"><small>РАБОЧЕЕ ПРОСТРАНСТВО / ОБЗОР</small><strong>Работа<br>под контролем.</strong><span class="folder-screen-stats"><i><b>18</b><small>ЗАЯВКИ</small></i><i><b>07</b><small>ОБЪЕКТЫ</small></i><i><b>24</b><small>ЗАДАЧИ</small></i></span><span class="folder-screen-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="folder-screen-lines"><i></i><i></i><i></i></span></span></span></span><span class="folder-art-caption">DESKTOP SOFTWARE / PRODUCT 001</span><span class="folder-cover-flap" aria-hidden="true"></span></span></button><div class="folder-reveal" id="catalog-product-details"><div class="folder-reveal-inner"><div class="folder-detail-copy"><span class="eyebrow">ВНУТРИ ПАПКИ / СКОЛ CRM</span><p>От первого обращения до контроля объекта. CRM связывает клиентов, заявки, сметы, производство и финансы в едином локальном рабочем пространстве.</p></div><div class="folder-detail-features"><span><i>01</i><b>Клиенты и объекты</b></span><span><i>02</i><b>Сметы и экономика</b></span><span><i>03</i><b>Производство и ПИ</b></span><span><i>04</i><b>Локальные данные</b></span></div><div class="folder-detail-actions"><a class="button button-orange" href="/products/skol-crm">Изучить программу <span>↗</span></a><a class="text-link" href="/download">Версии и загрузки →</a></div></div></div></article><div class="catalog-coming"><div><span>PRODUCT PIPELINE / 002 → ∞</span><h3>Следующие продукты<br><em>будут добавлены сюда.</em></h3></div><p>Каталог расширяется по мере готовности новых программ. Пока продукт не прошёл проверку и не имеет подтверждённой сборки, он не отображается как доступный.</p><span class="coming-symbol">S<span>+</span></span></div></section><section class="catalog-help section-pad"><div><span class="eyebrow">НЕ НАШЛИ НУЖНУЮ ПРОГРАММУ?</span><h2>Расскажите,<br><em>какую задачу решить.</em></h2><p>Можно обсудить существующий продукт или предложить направление для будущей разработки.</p></div><a class="button button-orange" href="/#contact">Связаться со СКОЛ ↗</a></section></main>'}
function product(){const groups=[["01","Клиенты и заявки","Единая база обращений и контактов: история общения и следующий шаг не теряются.","Создание заявок и этапы обработки","Карточки клиентов и контакты","Источники обращений и статусы воронки","Связь заявки с клиентом и объектом"],["02","Объекты и задачи","Рабочая структура проекта с ответственными, сроками и связями между сущностями.","Создание объектов и статусы выполнения","Привязка клиента и исходной заявки","Планирование задач и сроков","Напоминания по задачам и активным объектам"],["03","Сметы и коммерческие предложения","Расчёт стоимости работ и затрат с формированием экономики КП.","Строки работ: объём, цена и себестоимость","Учёт скидки, прямых и накладных затрат","Налоговый резерв и итоговая экономика","Расчёт выручки, затрат, прибыли и маржи"],["04","Производство и ПИ","Контроль исполнения на объекте: планы, смены и сравнение плановых и фактических показателей.","Производственные планы по объектам","Фиксация смен, бригады и выполненных объёмов","Учёт простоев и отклонений от норм","Прогноз остатка работ при достаточных данных","Предупреждения о просрочках и повторяющихся отклонениях"],["05","Инженерный расчёт","Инженерный расчёт и работа с ведомостями в отдельном тарифном контуре.","Инженерный расчёт объекта","Импорт Excel-ведомостей","Ручная проверка сопоставления позиций","Проверка единиц измерения перед заменой данных"],["06","Финансы и экономика","Денежные операции и финансовые показатели на основании сохранённых данных.","Учёт поступлений и расходов","Категории расходов и статусы оплаты","Экономика объектов: договор, поступления и затраты","Финансовые сводки и предупреждения о качестве данных"],["07","Поиск заказов","Ручной поиск потенциальных заказов в открытых источниках с сохранением первоисточников.","Поисковые сценарии Web, Telegram, Avito и тендеры","Импорт списков CSV/TXT","Нормализация ссылок и удаление дублей","Предварительная оценка релевантности","Передача выбранного заказа в воронку CRM"],["08","Браузер, отчёты и настройки","Инструменты для работы с данными и приложением в едином интерфейсе.","Встроенный браузер для веб-источников","Отчёты по данным CRM","Быстрый переход по разделам","Локальные настройки и PIN-защита"],["09","Локальные данные и резервные копии","Приложение рассчитано на локальную работу под Windows.","Локальная база SQLite","Без обязательного облачного аккаунта","Создание и восстановление резервной копии","Локальная проверка лицензии без интернет-запроса","Device ID и цифровая подпись Ed25519"]];return '<main class="inner-page product-detail-page"><section class="product-detail-hero section-pad"><div class="section-kicker"><span>СКОЛ / PRODUCT 001</span><span>WINDOWS DESKTOP SOFTWARE</span></div><div class="product-detail-grid"><div><p class="eyebrow">BUSINESS MANAGEMENT SYSTEM</p><h1>СКОЛ <em>CRM.</em></h1><p class="product-detail-lead">Система управления строительным бизнесом — клиенты, заявки, объекты, сметы, производство, финансы и поиск заказов в одном локальном приложении.</p><div class="product-detail-actions"><a class="button button-red" href="/tariffs">Тарифы и условия <span>↗</span></a><a class="button button-outline" href="/download">Скачать / обновления <span>↓</span></a></div><div class="product-detail-facts"><span><b>WINDOWS 10 / 11</b><small>Платформа</small></span><span><b>LOCAL SQLITE</b><small>Хранение данных</small></span><span><b>OFFLINE</b><small>Проверка лицензии</small></span></div></div><div class="product-detail-visual" role="img" aria-label="Иллюстративный макет интерфейса СКОЛ CRM"><div class="detail-glow"></div><div class="detail-app-window"><div class="detail-app-top"><span>● ● ●</span><b>СКОЛ / РАБОЧЕЕ ПРОСТРАНСТВО</b><small>LOCAL</small></div><div class="detail-app-body"><aside><b>S</b><i></i><i></i><i></i><i></i><i></i></aside><div class="detail-app-content"><small>ОБЗОР БИЗНЕСА</small><strong>Бизнес начинается<br>с ясной картины.</strong><div class="detail-metrics"><i></i><i></i><i></i></div><div class="detail-rows"><i></i><i></i><i></i><i></i></div></div></div></div><span class="detail-visual-caption">PRODUCT INTERFACE / ILLUSTRATIVE MOCKUP</span></div></div></section><section class="product-summary section-pad"><div><span class="eyebrow">ЧТО ЭТО ЗА ПРОГРАММА</span><h2>От обращения<br>до <em>выполненного объекта.</em></h2></div><div><p>СКОЛ CRM объединяет ключевые процессы подрядной компании в одном настольном приложении. Вместо разрозненных таблиц пользователь ведёт клиентов, заявки, объекты, задачи и производственные данные в связанной системе.</p><p>Программа рассчитана на локальную работу под Windows. Основная база SQLite находится на компьютере; для ежедневной работы и проверки лицензии постоянное подключение к интернету не требуется. Веб-поиск и встроенный браузер, разумеется, требуют сети.</p></div></section><section class="product-capabilities section-pad"><div class="section-kicker"><span>01 / CAPABILITIES</span><span>ВОЗМОЖНОСТИ ПРОГРАММЫ</span></div><div class="capabilities-heading"><h2>Рабочие инструменты.<br><em>В одном пространстве.</em></h2><p>Состав доступных модулей зависит от тарифа. Ниже описаны разделы и функции исходной CRM.</p></div><div class="capability-grid">'+groups.map(g=>'<article class="capability-card"><div class="capability-card-top"><span>'+g[0]+' / MODULE</span><b>↗</b></div><h3>'+g[1]+'</h3><p>'+g[2]+'</p><ul>'+g.slice(3).map(x=>'<li><i>✓</i>'+x+'</li>').join("")+'</ul></article>').join("")+'</div></section><section class="product-workflow section-pad"><div><span class="eyebrow">CONNECTED WORKFLOW</span><h2>Данные не должны<br><em>теряться между этапами.</em></h2><p>Заявка может стать объектом, объект использует расчёт и производственный план, а фактические операции и затраты помогают оценивать результат. Пользователь сохраняет контроль над переходами и подтверждает важные действия.</p></div><div class="workflow-steps"><div><span>01</span><b>Обращение</b><small>Клиент и заявка</small></div><div><span>02</span><b>Подготовка</b><small>Объект, смета и КП</small></div><div><span>03</span><b>Исполнение</b><small>План, смены и факт</small></div><div><span>04</span><b>Контроль</b><small>Финансы и отчёты</small></div></div></section><section class="product-tariff-summary section-pad"><div><span class="eyebrow">ACCESS / EDITIONS</span><h2>Три уровня<br><em>возможностей.</em></h2><p>Разделы PRO и BUSINESS открываются по подписанному лицензионному ключу. Точные разрешения сверяются с матрицей лицензирования CRM.</p></div><div class="edition-summary"><article><b>START</b><span>База работы</span><p>Клиенты, заявки, объекты, задачи и рабочее пространство.</p></article><article><b>PRO</b><span>Управление исполнением</span><p>START + инженерный расчёт, финансы, производство и отчёты.</p></article><article><b>BUSINESS</b><span>Расширенный контур</span><p>PRO + инженерные планы, радар заказов и встроенный браузер.</p></article><a class="text-link" href="/tariffs">Сравнить тарифы и запросить условия ↗</a></div></section><section class="product-technical section-pad"><div class="section-kicker"><span>02 / TECHNICAL DETAILS</span><span>ТРЕБОВАНИЯ И ОГРАНИЧЕНИЯ</span></div><div class="technical-grid"><article><span>ПЛАТФОРМА</span><h3>Windows 10 / 11</h3><p>Настольное приложение Electron x64. Установщик публикуется отдельно в релизах CRM.</p></article><article><span>ХРАНЕНИЕ</span><h3>Локальная SQLite</h3><p>Рабочая база хранится на компьютере. Перед обновлением рекомендуется сделать резервную копию.</p></article><article><span>ЛИЦЕНЗИЯ</span><h3>Ed25519 / Device ID</h3><p>Подписанный ключ привязан к идентификатору устройства. Проверка подписи и тарифа выполняется локально.</p></article><article><span>СЕТЬ</span><h3>Не обязательна для базовой работы</h3><p>Локальные сценарии и активация работают без сети. Веб-поиск и встроенный браузер требуют интернет-соединения.</p></article></div><div class="product-limitations"><h3>Что важно учитывать</h3><ul><li>Офлайн-лицензию нельзя удалённо отозвать; при замене компьютера менеджер выпускает новый ключ для нового Device ID.</li><li>Срок updatesUntil отображается в лицензии, но в текущей реализации не блокирует обновления программы.</li><li>Офлайн-приложение не может централизованно контролировать количество активных устройств по одной покупке.</li><li>Поиск заказов выполняется вручную; полнота выдачи зависит от источников. Это не гарантия автоматического получения заказов.</li></ul></div></section><section class="product-final-cta section-pad"><div><span class="eyebrow">SKOL CRM / PRODUCT 001</span><h2>Посмотрите тарифы<br><em>и обсудите подключение.</em></h2><p>Подключение оформляется через менеджера. Онлайн-оплата и автоматическая выдача ключа не подключены.</p></div><div><a class="button button-red" href="/tariffs">Запросить условия ↗</a><a class="text-link" href="/activation">Как активировать программу →</a></div></section></main>'}

function keyField(){return '<section class="key-field section-pad"><div class="key-field-content"><span class="eyebrow">SKOL / LICENSE ENGINE</span><h2>Ваш доступ.<br><em>Ваш ключ.</em></h2><p>Каждая лицензия подписывается цифровой подписью и привязывается к устройству. Программа проверяет её локально — без обращения к серверу.</p><div class="key-token-demo"><span>SKOL1.</span><i>eyJwcm9kdWN0IjoiU0tPTF9DUk0i...</i><b>✓ SIGNED</b></div></div><div class="key-visual" aria-hidden="true"><div class="key-visual-shadow"></div><div class="key-visual-plate"><span>SKOL / LICENSE</span><strong>01</strong><div class="key-visual-chip">ED25519</div><small>DEVICE BOUND · LOCAL CHECK</small></div><div class="key-visual-orbit key-orbit-a"></div><div class="key-visual-orbit key-orbit-b"></div></div></section>'}
function download(){return '<main class="inner-page download-page"><section class="inner-hero section-pad"><div class="section-kicker"><span>СКОЛ / DOWNLOAD CENTER</span><span>WINDOWS DESKTOP</span></div><p class="eyebrow">УСТАНОВКА И ОБНОВЛЕНИЯ</p><h1>Ваша система.<br><em>На вашем компьютере.</em></h1><div class="inner-hero-bottom"><p>Скачайте установщик СКОЛ CRM для Windows, ознакомьтесь с последними изменениями и подготовьте резервную копию перед обновлением.</p><span class="version-orbit"><small>ВЕРСИЯ В ИСХОДНОМ КОДЕ</small><b>'+VERSION+'</b><i>RELEASE TRACK</i></span></div></section><section class="download-main section-pad"><div class="download-panel"><div class="download-panel-top"><span><i class="live-dot"></i> RELEASE INFORMATION</span><span>WINDOWS / X64</span></div><div class="download-version"><div><small>ТЕКУЩАЯ ВЕРСИЯ В ИСХОДНОМ КОДЕ</small><strong>'+VERSION+'</strong><span class="version-status">● RELEASE TRACK</span></div><div class="download-symbol">↓</div></div><p class="download-description">СКОЛ CRM — настольная система управления клиентами, заявками, объектами, расчётами и рабочими процессами строительной компании. Установщик распространяется через GitHub Releases.</p><div class="download-facts"><div><span>ОПЕРАЦИОННАЯ СИСТЕМА</span><b>Windows 10 / 11</b></div><div><span>АРХИТЕКТУРА</span><b>x64</b></div><div><span>РЕЖИМ РАБОТЫ</span><b>Локальный / офлайн</b></div></div><a class="button button-red button-download" href="'+RELEASES+'" target="_blank" rel="noreferrer">Открыть релизы и скачать ↗</a><p class="download-warning">Ссылка ведёт на страницу опубликованных релизов CRM. Если установщик версии '+VERSION+' ещё не опубликован, последняя доступная сборка может отличаться от версии исходного кода.</p></div><div class="download-side"><div class="side-card"><span>01 / ПЕРЕД УСТАНОВКОЙ</span><h3>Сохраните<br>резервную копию.</h3><p>Перед обновлением сохраните копию локальной базы данных и убедитесь, что можете восстановить её.</p></div><div class="side-card"><span>02 / ЛИЦЕНЗИЯ</span><h3>Активируйте<br>без интернета.</h3><p>Получите ключ, привязанный к Device ID компьютера, и введите его в окне активации программы.</p><a href="/activation">Инструкция по активации ↗</a></div></div></section><section class="release-notes section-pad"><div class="section-kicker"><span>01 / CHANGELOG</span><span>ПОСЛЕДНИЕ ИЗМЕНЕНИЯ</span></div><div class="release-heading"><h2>Что нового<br><em>в версии 1.24.0.</em></h2><span>ПО CHANGELOG CRM</span></div><article class="release-card"><div class="release-card-head"><span>1.24.0</span><span>ОТДЕЛЬНЫЙ ПОИСКОВЫЙ АДАПТЕР ЕИС</span><b>LATEST NOTES</b></div><ul><li>В радар добавлен отдельный источник «ЕИС · госзакупки 44-ФЗ и 223-ФЗ».</li><li>Формируются три профильных поисковых запроса по демонтажу, отделке и фальшполам с привязкой к региону.</li><li>Ручной поиск ограничивается официальным доменом zakupki.gov.ru и не требует ключа поискового API.</li><li>Результаты проходят общий нормализатор ссылок и сигналов; исходную публикацию можно проверить вручную.</li></ul><p>Это адаптер поисковой выдачи, а не прямое API-подключение к ЕИС. Автоматический обход сайта и авторизация не заявляются.</p></article><article class="release-card release-card-previous"><div class="release-card-head"><span>1.23.0</span><span>РУЧНОЕ СОПОСТАВЛЕНИЕ ВЕДОМОСТЕЙ</span></div><ul><li>Проверка каждой позиции ведомости перед заменой инженерного плана.</li><li>Возможность изменить автоматическую подсказку и подтвердить сопоставление.</li><li>Проверка совместимости единиц измерения и безопасная отмена импорта.</li></ul></article><article class="release-card release-card-previous"><div class="release-card-head"><span>1.22.0</span><span>ВЕДОМОСТИ В ИНЖЕНЕРНЫЙ ПЛАН</span></div><ul><li>Передача позиций из распознанной Excel-ведомости в инженерный план.</li><li>Сопоставление с локальным каталогом и подтверждение замены текущего списка.</li><li>Цены и нормы берутся из прайса СКОЛ, а не из тендерной ведомости.</li></ul></article></section><section class="install-steps section-pad"><div class="section-kicker"><span>02 / УСТАНОВКА</span><span>4 ШАГА</span></div><h2>Начните работу<br><em>по порядку.</em></h2><div class="steps-grid">'+[['01','Скачайте установщик','Откройте опубликованный релиз и скачайте SKOL-Setup.exe.'],['02','Установите программу','Запустите файл и следуйте инструкциям мастера установки.'],['03','Получите ключ','Передайте менеджеру Device ID, который покажет окно активации.'],['04','Активируйте СКОЛ','Вставьте полученный ключ в программе. Проверка выполняется локально.']].map(s=>'<article><span>'+s[0]+'</span><h3>'+s[1]+'</h3><p>'+s[2]+'</p></article>').join("")+'</div></section>'+contact()+'</main>'}
function activation(){return '<main class="inner-page activation-page"><section class="inner-hero section-pad"><div class="section-kicker"><span>СКОЛ / АКТИВАЦИЯ</span><span>OFFLINE LICENSE</span></div><p class="eyebrow">ЛИЦЕНЗИЯ БЕЗ ОБЯЗАТЕЛЬНОГО ИНТЕРНЕТА</p><h1>Ключ подтверждает<br><em>ваш доступ.</em></h1><div class="inner-hero-bottom"><p>СКОЛ проверяет лицензию локально: цифровая подпись, тариф и идентификатор устройства. Интернет не нужен ни для активации, ни для ежедневной работы.</p><span class="activation-seal">ED25519<br><b>✓</b><small>VERIFIED LOCALLY</small></span></div></section><section class="activation-flow section-pad"><div class="section-kicker"><span>01 / ПРОЦЕСС</span><span>ОТ DEVICE ID ДО ДОСТУПА</span></div><h2>Четыре шага.<br><em>Без онлайн-проверки.</em></h2><div class="activation-steps">'+[['01','Установите СКОЛ','После установки программа покажет уникальный Device ID этого компьютера.'],['02','Передайте Device ID','Отправьте идентификатор продавцу после согласования тарифа.'],['03','Получите персональный ключ','Менеджер выпускает подписанный ключ для выбранного тарифа и вашего устройства через License Manager.'],['04','Введите ключ в CRM','Вставьте ключ в окне активации СКОЛ. Программа проверит подпись и откроет купленные модули.']].map((s,i)=>'<article class="activation-step"><span class="step-index">'+s[0]+'</span><div class="step-graphic">'+['▣','⇧','⌘','✓'][i]+'</div><h3>'+s[1]+'</h3><p>'+s[2]+'</p></article>').join("")+'</div></section><section class="activation-details section-pad"><div class="activation-details-copy"><span class="eyebrow">TECHNICAL MODEL</span><h2>Лицензия —<br><em>не просто пароль.</em></h2><p>Ключ имеет формат SKOL1 и содержит подписанные сведения о тарифе, разрешениях, сроке действия и Device ID. СКОЛ проверяет цифровую подпись открытым ключом, встроенным в приложение.</p><ul><li>Ed25519 — цифровая подпись лицензии.</li><li>Device ID — привязка к конкретному компьютеру.</li><li>START / PRO / BUSINESS — матрица доступных модулей.</li><li>Локальная проверка — без обращения к серверу.</li></ul></div><div class="license-card"><span>SKOL / LICENSE TOKEN</span><div class="license-card-key">SKOL1.<br><em>eyJwcm9kdWN0IjoiU0tPTF9DUk0i...</em><br>••••••••••••••••</div><div class="license-card-foot"><span>ED25519 SIGNATURE</span><b>✓ VALID FORMAT</b></div><div class="license-card-device">DEVICE BOUND / LOCAL VERIFICATION</div></div></section><section class="activation-caveats section-pad"><div class="section-kicker"><span>02 / ВАЖНО ЗНАТЬ</span><span>ОГРАНИЧЕНИЯ ОФЛАЙН-МОДЕЛИ</span></div><div class="caveat-grid"><article><b>01</b><h3>Новый компьютер</h3><p>При замене компьютера потребуется новый ключ для нового Device ID.</p></article><article><b>02</b><h3>Отзыв лицензии</h3><p>Офлайн-ключ нельзя удалённо отозвать или проверить через сервер.</p></article><article><b>03</b><h3>Несколько устройств</h3><p>Для нескольких компьютеров выпускается отдельный ключ на каждый Device ID в рамках одной покупки.</p></article></div></section><section class="activation-cta section-pad"><div><span class="eyebrow">READY TO START?</span><h2>Выберите тариф<br><em>для своей команды.</em></h2></div><a class="button button-red" href="/tariffs">Посмотреть тарифы ↗</a></section>'+contact()+'</main>'}
function tariffs(){
  const comparisonRows=[
    {label:"Клиенты, заявки, объекты и задачи",base:true},
    {label:"Рабочее пространство",base:true},
    ...tariffFeatures.map(feature=>({label:feature.name,id:feature.id}))
  ];
  const priceLabel=plan=>plan.price===null||plan.price===undefined?"Стоимость по запросу":new Intl.NumberFormat("ru-RU").format(plan.price)+" ₽";
  return '<main class="inner-page tariffs-page"><section class="inner-hero tariff-hero section-pad"><div class="section-kicker"><span>СКОЛ / ЛИЦЕНЗИИ</span><span>PRESETS + CUSTOM / ACCESS SYSTEM</span></div><div class="tariff-hero-grid"><div class="tariff-hero-copy"><p class="eyebrow">КОНФИГУРАЦИЯ РАБОЧЕЙ СИСТЕМЫ</p><h1>Выберите свой<br><em>уровень управления.</em></h1><p class="tariff-hero-lead">Выберите готовый тариф или соберите собственный набор модулей. Состав лицензии фиксируется в подписанном ключе и проверяется CRM локально.</p><div class="tariff-hero-actions"><a class="button button-red" href="#tariff-builder">Собрать свой тариф <span>↘</span></a><a class="tariff-builder-link" href="#tariff-cards">Сравнить готовые варианты ↓</a></div><div class="tariff-hero-meta"><span><i class="live-dot"></i> ЛОКАЛЬНАЯ ЛИЦЕНЗИЯ</span><span>WINDOWS / DESKTOP</span><span>PRESETS + CUSTOM</span></div></div><div class="tariff-hero-scene" role="img" aria-label="Объёмная визуализация лицензий СКОЛ"><div class="tariff-scene-grid"></div><div class="tariff-scene-orbit orbit-one"></div><div class="tariff-scene-orbit orbit-two"></div><div class="tariff-scene-core"><span>SKOL</span><strong>CRM</strong><i>LICENSE / V2</i></div><div class="tariff-scene-chip chip-start"><small>01 / BASE</small><b>START</b></div><div class="tariff-scene-chip chip-pro"><small>02 / ADVANCED</small><b>PRO</b></div><div class="tariff-scene-chip chip-business"><small>03 / FULL</small><b>BUSINESS</b></div><div class="tariff-scene-coordinates">55°45′N<br>37°37′E</div></div></div></section>'+keyField()+'<section class="tariff-cards section-pad" id="tariff-cards"><div class="section-kicker"><span>01 / ГОТОВЫЕ ТАРИФЫ</span><span>ВЫБЕРИТЕ СТАРТОВУЮ КОНФИГУРАЦИЮ</span></div><div class="tariff-intro-row"><h2>Готовые планы.<br><em>Без лишних функций.</em></h2><p>Каждый тариф состоит из базового рабочего пространства и конкретных модулей. Состав и цены управляются через локальный License Manager.</p></div><div class="tariff-grid">'+plans.map((p,i)=>'<article class="tariff-card tariff-card-3d '+p.color+'" id="'+p.id.toLowerCase()+'" data-tariff-card style="--card-index:'+i+'"><div class="tariff-card-top"><span>0'+(i+1)+' / '+p.id+' EDITION</span><b>'+(i===0?'◌':i===1?'◈':'✳')+'</b></div><div class="tariff-card-orb tariff-orb-'+p.id.toLowerCase()+'"><i></i><i></i><i></i><span>'+String(i+1).padStart(2,"0")+'</span></div><div class="tariff-card-heading"><h2>'+p.id+'</h2><span>'+escapeHtml(String(p.title||p.name||"CUSTOM PLAN").toUpperCase())+'</span></div><h3>'+escapeHtml(p.title)+'</h3><div class="tariff-price">'+priceLabel(p)+'</div><p>'+escapeHtml(p.desc)+'</p><div class="tariff-divider"></div><span class="list-label">СОСТАВ ЛИЦЕНЗИИ</span><ul>'+p.features.map(feature=>'<li><i>↗</i>'+escapeHtml(feature)+'</li>').join("")+'</ul><div class="tariff-card-bottom"><span>'+escapeHtml(p.note)+'</span><a class="button '+(p.color==="red"?"button-red":p.color==="dark"?"button-light":"button-outline")+'" href="#tariff-builder" data-plan="'+p.id+'">Выбрать '+p.id+' <b>↗</b></a></div><div class="tariff-card-index">SKOL / 0'+(i+1)+'</div></article>').join("")+'</div></section>'+tariffBuilder()+'<section class="comparison-section section-pad"><div class="section-kicker"><span>03 / МАТРИЦА ДОСТУПА</span><span>СОСТАВ ТАРИФОВ</span></div><h2>Модули<br><em>по уровням доступа.</em></h2><div class="comparison-table" id="tariff-comparison" aria-label="Сравнение возможностей тарифов" style="--plan-count:'+plans.length+';--comparison-min-width:'+Math.max(420,260+plans.length*82)+'px;--comparison-min-width-mobile:'+Math.max(300,150+plans.length*45)+'px"><div class="comparison-row comparison-head"><span>ВОЗМОЖНОСТЬ</span>'+plans.map(plan=>'<b>'+plan.id+'</b>').join("")+'</div>'+comparisonRows.map(row=>'<div class="comparison-row" data-comparison-row><span>'+row.label+'</span>'+plans.map(plan=>{const enabled=row.base||plan.featureIds.includes(row.id);return '<b data-plan-col="'+plan.id+'" class="'+(enabled?"yes":"no")+'">'+(enabled?"✓":"—")+'</b>'}).join("")+'</div>').join("")+'</div><p class="comparison-note">Сравнение строится по реальному каталогу модулей СКОЛ CRM. Функции без отдельной проверки в приложении не предлагаются как самостоятельные платные опции.</p></section><section class="tariff-request section-pad" id="tariff-request"><div class="section-kicker"><span>04 / ПОДКЛЮЧЕНИЕ</span><span>ЗАПРОС ЛИЦЕНЗИИ</span></div><div class="tariff-request-grid"><div><span class="eyebrow">NEXT STEP / ACTIVATION</span><h2>Определились<br><em>с конфигурацией?</em></h2><p>Оставьте контакт и выбранный состав. Заявку можно передать менеджеру как JSON и импортировать в License Manager. Ключ подписывается локально закрытым ключом владельца продукта.</p><a class="text-link" href="/activation">Посмотреть процесс офлайн-активации ↗</a></div><form class="contact-form tariff-form" id="tariff-form"><div class="tariff-form-top"><span>LICENSE REQUEST</span><b><i class="live-dot"></i> READY</b></div><p class="tariff-selected-status" id="tariff-selected-status" aria-live="polite">Выберите готовый тариф или соберите свою конфигурацию</p><label>Выбранный тариф<select name="plan" id="plan-select">'+plans.map(plan=>'<option value="'+escapeHtml(plan.id)+'">'+escapeHtml(plan.name)+'</option>').join("")+'<option value="CUSTOM">Индивидуальная конфигурация</option></select></label><label>Имя<input name="name" placeholder="Ваше имя" required maxlength="80"></label><label>Контакт для связи<input name="contact" placeholder="Телефон, Telegram или email" required maxlength="120"></label><label>Количество компьютеров<input name="seats" type="number" min="1" max="50" value="1" required></label><button class="button button-red" type="submit">Подготовить заявку менеджеру ↗</button><p class="form-hint">Форма не отправляет данные на сервер. Она готовит текст и JSON-заявку для передачи менеджеру.</p></form></div></section>'+contact()+'</main>';
}
function toast(text){let el=document.querySelector(".site-toast");if(!el){el=document.createElement("div");el.className="site-toast";el.setAttribute("role","status");el.setAttribute("aria-live","polite");el.setAttribute("aria-atomic","true");document.body.appendChild(el)}el.textContent=text;el.classList.add("show");clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.remove("show"),3000)}
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("Текст обращения скопирован.");
    return true;
  }catch{
    let copied=false;
    const area=document.createElement("textarea");
    area.value=text;
    area.setAttribute("readonly","");
    area.style.position="fixed";
    area.style.opacity="0";
    area.style.pointerEvents="none";
    try{
      document.body.appendChild(area);
      area.select();
      copied=typeof document.execCommand==="function"&&document.execCommand("copy");
    }catch{
      copied=false;
    }finally{
      area.remove();
    }
    toast(copied?"Текст обращения скопирован.":"Не удалось скопировать текст.");
    return copied;
  }
}
function setupForms(){
  document.querySelectorAll("#contact-form,#tariff-form").forEach(form=>form.addEventListener("submit",async event=>{
    event.preventDefault();
    const data=new FormData(form);
    let message=["Обращение по программе СКОЛ",...Array.from(data.entries()).map(([key,value])=>key+": "+String(value).trim())].join("\n");
    if(form.id==="tariff-form"){
      const request=createTariffLicenseRequest(form);
      message+="\n\nJSON-КОНФИГУРАЦИЯ ДЛЯ LICENSE MANAGER\n"+JSON.stringify(request,null,2);
    }
    const copied=await copyText(message);
    const hint=form.querySelector(".form-hint");
    if(hint)hint.textContent=copied?(form.id==="tariff-form"?"Текст обращения и структура выбранной лицензии скопированы. Для импорта также можно скачать JSON выше.":"Текст скопирован. Передайте его менеджеру по согласованному каналу связи."):"Не удалось скопировать текст автоматически. Проверьте разрешение на буфер обмена и повторите попытку.";
  }));
}
function setupHomeInteractions(){document.querySelectorAll("[data-home-folder]").forEach(card=>{const trigger=card.querySelector(".home-folder-trigger,.home-pillar-trigger");if(!trigger)return;trigger.addEventListener("click",()=>{const open=card.classList.toggle("is-open");trigger.setAttribute("aria-expanded",String(open));if(trigger.classList.contains("home-folder-trigger"))trigger.setAttribute("aria-label",open?"Закрыть папку продукта СКОЛ CRM":"Открыть папку продукта СКОЛ CRM")})})}
function setupCatalogFolders(){document.querySelectorAll("[data-catalog-folder]").forEach(card=>{const trigger=card.querySelector(".folder-trigger");if(!trigger)return;trigger.addEventListener("click",()=>{const open=card.classList.toggle("is-open");trigger.setAttribute("aria-expanded",String(open));trigger.setAttribute("aria-label",open?"Закрыть папку продукта СКОЛ CRM":"Открыть папку продукта СКОЛ CRM")})})}
function setupDemo(){const el=document.querySelector("#demo-content");if(!el)return;const data={overview:["Общая картина работы",[["АКТИВНЫЕ ЗАЯВКИ","18","В работе"],["ОБЪЕКТЫ","07","Текущие проекты"],["ЗАДАЧИ НА НЕДЕЛЮ","24","Планирование"]],[["Демонтаж помещения","Москва · Коммерческий объект","В РАБОТЕ"],["Подготовка объекта","Московская область","НОВАЯ"],["Комплексная отделка","Москва · Частный заказ","РАСЧЁТ"]]],objects:["Объекты и исполнение",[["АКТИВНЫЕ ОБЪЕКТЫ","07","В работе"],["ЭТАПЫ РАБОТ","16","На контроле"],["ЗАДАЧИ","24","В плане"]],[["Демонтаж офиса","420 м² · Москва","В РАБОТЕ"],["Подготовка помещения","260 м² · МО","ПЛАН"],["Отделка объекта","Новый объект","ОЦЕНКА"]]],estimates:["Сметы и коммерческие предложения",[["СОХРАНЁННЫЕ СМЕТЫ","32","История расчётов"],["КП В РАБОТЕ","08","Подготовка"],["ОБЪЕКТЫ С РАСЧЁТОМ","12","Связанные данные"]],[["Демонтаж и вывоз","Смета · Объект 024","СОХРАНЕНА"],["Подготовка стен","КП · Объект 019","ОТПРАВЛЕНО"],["Комплексная отделка","Расчёт · Объект 031","ЧЕРНОВИК"]]],finance:["Финансовый контур",[["ПОСТУПЛЕНИЯ","—","Финансовый модуль"],["РАСХОДЫ","—","Финансовый модуль"],["ЭКОНОМИКА ОБЪЕКТА","—","Расширенный доступ"]],[["Платежи по объектам","Поступления и оплаты","PRO"],["Расходы и затраты","Учёт по категориям","PRO"],["Аналитика","Отчёты и показатели","PRO"]]]};document.querySelectorAll(".demo-tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".demo-tab").forEach(x=>{const active=x===b;x.classList.toggle("active",active);x.setAttribute("aria-pressed",String(active))});const d=data[b.dataset.demo];document.querySelector("#demo-title").textContent=d[0];el.innerHTML='<div class="metric-row">'+d[1].map(m=>'<div class="metric-card"><span>'+m[0]+'</span><strong>'+m[1]+'</strong><small>'+m[2]+'</small></div>').join("")+'</div><div class="demo-lower"><div class="demo-panel"><div class="panel-title">Последние записи <span>Открыть раздел ↗</span></div>'+d[2].map((r,i)=>'<div class="demo-line"><i>0'+(i+1)+'</i><div><b>'+r[0]+'</b><small>'+r[1]+'</small></div><em>'+r[2]+'</em></div>').join("")+'</div><div class="demo-panel demo-chart"><div class="panel-title">Динамика работы <span>30 дней</span></div><div class="chart-bars">'+[35,52,43,70,58,84,66,100,77,91].map(x=>'<i style="--h:'+x+'%"></i>').join("")+'</div><div class="chart-labels"><span>01</span><span>10</span><span>20</span><span>30</span></div></div></div>'}))}
function setupTheme(){const root=document.documentElement,button=document.querySelector(".theme-toggle"),label=button?.querySelector(".theme-toggle-label"),icon=button?.querySelector(".theme-toggle-icon");let saved="light";try{saved=localStorage.getItem("skol-theme")==="dark"?"dark":"light"}catch{}function apply(theme){const dark=theme==="dark";root.dataset.theme=dark?"dark":"light";if(button){button.setAttribute("aria-pressed",String(dark));button.setAttribute("aria-label",dark?"Включить светлую тему":"Включить тёмную тему")}if(label)label.textContent=dark?"Тёмная тема":"Светлая тема";if(icon)icon.textContent=dark?"☼":"◐";const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=dark?"#20201e":"#f5f2ed";try{localStorage.setItem("skol-theme",dark?"dark":"light")}catch{}}apply(saved);button?.addEventListener("click",()=>apply(root.dataset.theme==="dark"?"light":"dark"))}
function setupMotion(){
  const curtain=document.querySelector(".page-transition");
  const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll('a[href^="/"]').forEach(a=>a.addEventListener("click",event=>{
    const href=a.getAttribute("href");
    if(!href||href.startsWith("/#")||href.includes("#")||a.target==="_blank"||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const next=new URL(href,location.origin);
    if(next.pathname===location.pathname)return;
    event.preventDefault();
    if(curtain&&!reducedMotion){
      curtain.classList.remove("enter");
      curtain.classList.add("leave");
      setTimeout(()=>location.assign(next.href),420);
    }else location.assign(next.href);
  }));
  const items=document.querySelectorAll(".reveal,.bento-card,.section-kicker,.release-card,.activation-step,.side-card,.home-reveal");
  if("IntersectionObserver"in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }),{threshold:.12,rootMargin:"0px 0px -35px 0px"});
    items.forEach(item=>observer.observe(item));
  }else items.forEach(item=>item.classList.add("is-visible"));
  const menu=document.querySelector(".menu-toggle");
  const mobile=document.querySelector(".mobile-menu");
  if(menu&&mobile){
    function setMenuOpen(open){
      menu.setAttribute("aria-expanded",String(open));
      menu.setAttribute("aria-label",open?"Закрыть меню":"Открыть меню");
      mobile.classList.toggle("open",open);
      document.body.classList.toggle("menu-open",open);
    }
    menu.addEventListener("click",()=>setMenuOpen(menu.getAttribute("aria-expanded")!=="true"));
    mobile.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setMenuOpen(false)));
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&menu.getAttribute("aria-expanded")==="true"){
        setMenuOpen(false);
        menu.focus();
      }
    });
    document.addEventListener("click",event=>{
      if(menu.getAttribute("aria-expanded")!=="true")return;
      if(menu.contains(event.target)||mobile.contains(event.target))return;
      setMenuOpen(false);
    });
    const desktopBreakpoint=window.matchMedia("(min-width:851px)");
    desktopBreakpoint.addEventListener?.("change",event=>{
      if(event.matches)setMenuOpen(false);
    });
  }
  const progress=document.querySelector(".scroll-progress");
  let scrollFrame=0;
  window.addEventListener("scroll",()=>{
    if(scrollFrame)return;
    scrollFrame=requestAnimationFrame(()=>{
      const max=document.documentElement.scrollHeight-window.innerHeight;
      if(progress)progress.style.transform="scaleX("+(max>0?window.scrollY/max:0)+")";
      scrollFrame=0;
    });
  },{passive:true});
}
function setupParticles(){const scene=document.querySelector(".hero-visual");if(!scene||document.querySelector(".skol-home"))return;const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const monitor=scene.querySelector(".hero-monitor");if(!reduced){const layer=document.createElement("div");layer.className="hero-particle-field";layer.setAttribute("aria-hidden","true");for(let i=0;i<22;i++){const p=document.createElement("i");p.className="hero-particle";p.style.setProperty("--x",(6+(i*37)%88)+"%");p.style.setProperty("--y",(5+(i*53)%88)+"%");p.style.setProperty("--delay",-(i%9)*.7+"s");p.style.setProperty("--duration",7+(i%6)*1.3+"s");layer.appendChild(p)}scene.appendChild(layer);let frame=0;scene.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{scene.style.setProperty("--tilt-x",(-y*5).toFixed(2)+"deg");scene.style.setProperty("--tilt-y",(x*7).toFixed(2)+"deg");scene.style.setProperty("--pointer-x",(x*22).toFixed(1)+"px");scene.style.setProperty("--pointer-y",(y*18).toFixed(1)+"px")})});scene.addEventListener("pointerleave",()=>{if(frame)cancelAnimationFrame(frame);frame=0;scene.style.setProperty("--tilt-x","0deg");scene.style.setProperty("--tilt-y","0deg");scene.style.setProperty("--pointer-x","0px");scene.style.setProperty("--pointer-y","0px")});let ticking=false;window.addEventListener("scroll",()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const r=scene.getBoundingClientRect(),progress=Math.max(-1,Math.min(1,(window.innerHeight*.5-(r.top+r.height*.5))/window.innerHeight));scene.style.setProperty("--scroll-depth",(progress*18).toFixed(1)+"px");ticking=false})},{passive:true})}if(monitor)monitor.setAttribute("aria-label","Объёмная демонстрация интерфейса СКОЛ CRM");}
function setupTariffMotion(){const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;const scene=document.querySelector(".tariff-hero-scene");const cards=[...document.querySelectorAll("[data-tariff-card]")];if(!reduced&&scene){const field=document.createElement("div");field.className="tariff-particle-field";field.setAttribute("aria-hidden","true");for(let i=0;i<24;i++){const dot=document.createElement("i");dot.style.setProperty("--x",(4+(i*41)%92)+"%");dot.style.setProperty("--y",(5+(i*29)%88)+"%");dot.style.setProperty("--delay",-(i%11)*.8+"s");dot.style.setProperty("--duration",(7+(i%7)*1.2)+"s");field.appendChild(dot)}scene.appendChild(field);let frame=0;scene.addEventListener("pointermove",e=>{if(e.pointerType==="touch")return;const r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{scene.style.setProperty("--scene-x",(-y*7).toFixed(2)+"deg");scene.style.setProperty("--scene-y",(x*9).toFixed(2)+"deg")})});scene.addEventListener("pointerleave",()=>{if(frame)cancelAnimationFrame(frame);frame=0;scene.style.setProperty("--scene-x","0deg");scene.style.setProperty("--scene-y","0deg")})}if(!reduced&&cards.length){cards.forEach(card=>{let frame=0;card.addEventListener("pointermove",e=>{if(e.pointerType==="touch"||window.innerWidth<760)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{card.style.transform="perspective(1100px) rotateX("+(-y*5).toFixed(2)+"deg) rotateY("+(x*6).toFixed(2)+"deg) translateY(-5px)";card.style.setProperty("--glow-x",(x+0.5)*100+"%");card.style.setProperty("--glow-y",(y+0.5)*100+"%")})});card.addEventListener("pointerleave",()=>{if(frame)cancelAnimationFrame(frame);frame=0;card.style.transform="";card.style.setProperty("--glow-x","50%");card.style.setProperty("--glow-y","0%")})});if("IntersectionObserver"in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-in-view");io.unobserve(entry.target)}}),{threshold:.18});cards.forEach(card=>io.observe(card))}else cards.forEach(card=>card.classList.add("is-in-view"))}} 
function setupTariffSelection(){
  const cards=[...document.querySelectorAll("[data-tariff-card]")];
  const select=document.querySelector("#plan-select");
  const status=document.querySelector("#tariff-selected-status");
  const seatsField=document.querySelector('#tariff-form [name="seats"]');
  const builderSeats=document.querySelector("#builder-seats");
  const cols=[...document.querySelectorAll("[data-plan-col]")];
  const toggles=[...document.querySelectorAll("[data-feature-toggle]")];
  const summary=document.querySelector("#builder-feature-summary");
  const download=document.querySelector("#downloadTariffRequest");
  const presetButtons=[...document.querySelectorAll("[data-builder-preset]")];
  const resetButtons=[...document.querySelectorAll("[data-builder-reset],[data-builder-reset-inline]")];
  const progressRing=document.querySelector("#builder-progress-ring");
  const progressFill=document.querySelector("#builder-progress-fill");
  const countNode=$("#builder-count");
  const moduleCount=$("#builder-module-count");
  const selectedCount=$("#builder-selected-count");
  const counterCaption=$("#builder-counter-caption");
  const planType=$("#builder-plan-type");
  const priceNote=$("#builder-price-note");
  let activePlanId=plans.some(plan=>plan.id==="START")?"START":plans[0]?.id||"CUSTOM";

  function featureIds(){return toggles.filter(input=>input.checked).map(input=>input.dataset.featureToggle).sort()}
  function sameFeatures(a,b){return a.length===b.length&&a.every((id,index)=>id===b[index])}
  function syncSeats(value,source){
    const normalized=String(value??"");
    if(builderSeats&&source!==builderSeats)builderSeats.value=normalized;
    if(seatsField&&source!==seatsField)seatsField.value=normalized;
  }
  function updateSeatLimit(maxDevices){
    [builderSeats,seatsField].forEach(field=>{
      if(!field)return;
      field.max=String(maxDevices);
      const value=Number(field.value);
      if(field.value!==""&&Number.isFinite(value)&&value>maxDevices)field.value=String(maxDevices);
    });
    if(builderSeats&&seatsField)syncSeats(builderSeats.value,builderSeats);
  }
  function render(){
    const selected=featureIds();
    let plan=plans.find(item=>item.id===activePlanId);
    if(activePlanId!=="CUSTOM"&&(!plan||!sameFeatures([...plan.featureIds].sort(),selected))){
      activePlanId="CUSTOM";
      plan=null;
    }
    if(activePlanId==="CUSTOM"){
      const match=plans.find(item=>sameFeatures([...item.featureIds].sort(),selected));
      if(match){activePlanId=match.id;plan=match}
    }
    document.documentElement.dataset.tariffPlan=activePlanId;
    const description=plan?plan.desc:"Вы собрали собственную конфигурацию. Выбранные модули будут зафиксированы в заявке и лицензии.";
    const price=plan&&plan.price!==null?new Intl.NumberFormat("ru-RU").format(plan.price)+" ₽":"По запросу";
    const maxDevices=plan?.maxDevices??50;
    updateSeatLimit(maxDevices);
    const seatCount=builderSeats?.value||seatsField?.value||"1";
    const progress=tariffFeatures.length?Math.round(selected.length/tariffFeatures.length*100):0;
    const label=$("#builder-plan-name"),desc=$("#builder-plan-description"),priceNode=$("#builder-price");
    if(label)label.textContent=plan?plan.name:"CUSTOM";
    if(desc)desc.textContent=description;
    if(priceNode)priceNode.textContent=price;
    if(countNode)countNode.textContent=selected.length+" / "+tariffFeatures.length;
    if(moduleCount)moduleCount.textContent=selected.length+" / "+tariffFeatures.length;
    if(selectedCount)selectedCount.textContent=String(selected.length);
    if(progressRing)progressRing.style.setProperty("--progress",progress+"%");
    if(progressFill)progressFill.style.width=progress+"%";
    if(counterCaption)counterCaption.textContent=selected.length===0?"Базовый контур":selected.length===tariffFeatures.length?"Полный набор модулей":"Конфигурация собирается";
    if(planType)planType.textContent=plan?"ГОТОВЫЙ НАБОР":"ИНДИВИДУАЛЬНО";
    if(priceNote)priceNote.textContent=plan&&plan.price!==null
      ?"Стоимость готового тарифа указана выше. Дополнительные условия и изменения подтвердит менеджер."
      :"Автоматическая цена не рассчитывается. Менеджер подтвердит стоимость с учётом модулей и количества компьютеров.";
    if(summary){
      summary.replaceChildren();
      if(!selected.length){
        const li=document.createElement("li");
        li.className="builder-summary-empty";
        li.textContent="Дополнительные модули не выбраны — используются базовые разделы";
        summary.append(li);
      }else{
        selected.forEach(id=>{
          const feature=tariffFeatures.find(item=>item.id===id);
          if(!feature)return;
          const li=document.createElement("li");
          li.className="builder-summary-item";
          li.textContent=feature.name;
          summary.append(li);
        });
      }
    }
    document.querySelectorAll("[data-group-count]").forEach(node=>{
      const group=document.querySelector('[data-builder-group="'+node.dataset.groupCount+'"]');
      const groupToggles=[...(group?.querySelectorAll("[data-feature-toggle]")||[])];
      node.textContent=groupToggles.filter(input=>input.checked).length+" / "+groupToggles.length;
    });
    if(select)select.value=activePlanId;
    if(status)status.textContent=(plan?"Выбрана конфигурация: "+plan.id:"Индивидуальная конфигурация")+" · "+selected.length+" модулей · "+seatCount+" компьютеров из "+maxDevices;
    cards.forEach(card=>{
      const active=card.id===String(activePlanId).toLowerCase();
      card.classList.toggle("is-selected",active);
      const link=card.querySelector("[data-plan]");
      if(link)link.setAttribute("aria-current",active?"true":"false");
    });
    cols.forEach(col=>col.classList.toggle("is-plan-active",col.dataset.planCol===activePlanId));
    presetButtons.forEach(button=>{
      const active=button.dataset.builderPreset===activePlanId;
      button.classList.toggle("is-active",active);
      button.setAttribute("aria-pressed",String(active));
    });
  }
  function selectPlan(id){
    if(id==="CUSTOM"){activePlanId="CUSTOM";render();return}
    const plan=plans.find(item=>item.id===id);
    if(!plan)return;
    activePlanId=plan.id;
    const selected=new Set(plan.featureIds);
    toggles.forEach(input=>{input.checked=selected.has(input.dataset.featureToggle)});
    render();
  }
  document.querySelectorAll("[data-plan]").forEach(link=>link.addEventListener("click",()=>selectPlan(link.dataset.plan)));
  select?.addEventListener("change",()=>selectPlan(select.value));
  presetButtons.forEach(button=>button.addEventListener("click",()=>selectPlan(button.dataset.builderPreset)));
  resetButtons.forEach(button=>button.addEventListener("click",()=>selectPlan(plans.some(plan=>plan.id==="START")?"START":"CUSTOM")));
  toggles.forEach(input=>input.addEventListener("change",()=>{activePlanId="CUSTOM";render()}));
  builderSeats?.addEventListener("input",()=>{syncSeats(builderSeats.value,builderSeats);render()});
  seatsField?.addEventListener("input",()=>{syncSeats(seatsField.value,seatsField);render()});
  document.querySelectorAll("[data-seat-step]").forEach(button=>button.addEventListener("click",()=>{
    const current=Number(builderSeats?.value||seatsField?.value||1);
    const max=Number(builderSeats?.max||seatsField?.max||50);
    const next=Math.max(1,Math.min(max,current+Number(button.dataset.seatStep||0)));
    syncSeats(next,builderSeats||seatsField);
    render();
  }));
  download?.addEventListener("click",downloadTariffLicenseRequest);
  const sections=[...document.querySelectorAll(".tariff-cards,.tariff-builder,.comparison-section,.tariff-request,[data-comparison-row]")];
  sections.filter(section=>section.hasAttribute("data-comparison-row")).forEach((row,index)=>row.style.setProperty("--row-index",index));
  if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver"in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("tariff-revealed");observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:"0px 0px -40px 0px"});
    sections.forEach(section=>observer.observe(section));
  }else sections.forEach(section=>section.classList.add("tariff-revealed"));
  selectPlan(activePlanId);
}

function setPageMeta(){const pages={home:["СКОЛ — платформа программных продуктов","Программные продукты СКОЛ для реальных задач бизнеса. Каталог, лицензии, обновления и поддержка."],catalog:["Каталог программ СКОЛ — программные продукты","Каталог программных продуктов СКОЛ. Сейчас доступна СКОЛ CRM — локальная система управления строительным бизнесом."],product:["СКОЛ CRM — возможности, модули и лицензии","Подробное описание СКОЛ CRM: клиенты, заявки, объекты, сметы, производство, финансы, поиск заказов и офлайн-лицензирование."],tariffs:["Тарифы СКОЛ CRM — START, PRO, BUSINESS","Сравнение возможностей и тарифов СКОЛ CRM. Подключение через менеджера, офлайн-ключи."],download:["Скачать СКОЛ CRM — версии и обновления","Страница загрузок СКОЛ CRM для Windows: версии, изменения, установка и обновления."],activation:["Активация СКОЛ CRM — офлайн-лицензия","Инструкция по Device ID и локальной активации СКОЛ CRM с цифровой подписью Ed25519."]};const meta=pages[route]||pages.home;document.title=meta[0];let description=document.querySelector('meta[name="description"]');if(description)description.content=meta[1];let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.appendChild(canonical)}canonical.href=location.origin+location.pathname;let ogTitle=document.querySelector('meta[property="og:title"]');if(ogTitle)ogTitle.content=meta[0];let ogDescription=document.querySelector('meta[property="og:description"]');if(ogDescription)ogDescription.content=meta[1]}
async function boot(){
  setPageMeta();
  if(route==="tariffs")await loadTariffConfig();
  const content=route==="catalog"?catalog():route==="product"?product():route==="tariffs"?tariffs():route==="download"?download():route==="activation"?activation():home();
  document.querySelector("#app").innerHTML='<div class="page-transition enter"></div><div class="scroll-progress"></div>'+header()+content+footer();
  const setupTasks=[
    ["theme",setupTheme],
    ["catalog folders",setupCatalogFolders],
    ["home interactions",setupHomeInteractions],
    ["motion",setupMotion],
    ["motion system",()=>initMotionSystem(document)],
    ["demo",setupDemo],
    ["forms",setupForms],
    ["tariff motion",setupTariffMotion],
    ["tariff selection",setupTariffSelection]
  ];
  for(const [name,setup] of setupTasks){
    try{setup()}catch(error){console.error("SKOL setup failed ("+name+"):",error)}
  }
  document.querySelectorAll('a[href^="/#"]').forEach(a=>a.addEventListener("click",event=>{if(route==="home"){const target=document.getElementById(a.getAttribute("href").split("#")[1]);if(target){event.preventDefault();target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}}}));
  if(location.hash)setTimeout(()=>document.querySelector(location.hash)?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"}),160);
}
boot().catch(error=>{console.error('SKOL boot failed:',error);const root=document.querySelector('#app');if(root)root.textContent='Не удалось загрузить страницу СКОЛ. Обновите страницу или обратитесь в поддержку.'});
