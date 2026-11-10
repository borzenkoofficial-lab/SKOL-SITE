const REDUCED="(prefers-reduced-motion: reduce)";

function crmScreen(){
  return `<section class="crm-scroll-showcase" id="crm-experience" aria-label="Интерфейс СКОЛ CRM">
    <div class="crm-scroll-sticky">
      <div class="crm-showcase-head"><span><i></i> СКОЛ CRM / PRODUCT EXPERIENCE</span><span>01 — 03 / РАБОЧАЯ СРЕДА</span></div>
      <div class="crm-showcase-copy"><p class="eyebrow">НЕ КОНЦЕПТ. РАБОЧИЙ ИНСТРУМЕНТ.</p><h2>Вся работа.<br><em>В одной системе.</em></h2><p>От первого обращения до экономики объекта — связанные данные, понятные действия и контроль исполнения.</p></div>
      <div class="crm-showcase-stage">
        <div class="crm-app-shell">
          <div class="crm-app-top"><div class="crm-app-brand"><b>С</b><span>СКОЛ <small>CRM</small></span></div><div class="crm-app-crumb">Рабочее пространство <i>/</i> <b data-crm-screen-title>Обзор бизнеса</b></div><div class="crm-app-user"><i></i> Локальный режим <b>СБ</b></div></div>
          <aside class="crm-app-rail" aria-label="Разделы программы"><b class="is-active">⌂</b><b>▤</b><b>⌑</b><b>◷</b><b>▥</b><b>⌘</b></aside>
          <div class="crm-app-content">
            <div class="crm-app-pagehead"><div><small>РАБОЧЕЕ ПРОСТРАНСТВО / СКОЛ CRM</small><h3 data-crm-screen-heading>Обзор бизнеса</h3></div><span class="crm-app-date">10 НОЯБРЯ 2026</span></div>
            <div class="crm-app-tabs"><span class="is-active" data-crm-tab="overview">Обзор</span><span data-crm-tab="leads">Заявки</span><span data-crm-tab="objects">Объекты</span><span data-crm-tab="estimate">Расчёт</span><span data-crm-tab="radar">Радар</span></div>
            <div class="crm-app-panels">
              <div class="crm-app-view is-active" data-crm-view="overview">
                <div class="crm-app-metrics"><article><small>ПОСТУПЛЕНИЯ</small><b>100 000 000 ₽</b><i>За выбранный период</i></article><article><small>РАСХОДЫ</small><b>0 ₽</b><i>Фактические затраты</i></article><article class="is-lime"><small>ОСТАТОК</small><b>100 000 000 ₽</b><i>Финансовый результат</i></article></div>
                <div class="crm-app-chart"><div class="crm-app-panel-title"><b>Динамика бизнеса</b><small>ПО МЕСЯЦАМ</small></div><div class="crm-app-bars">${[30,44,38,56,49,72,61,84,70,94,78,100].map((h,i)=>`<i style="--bar:${h}%;--i:${i}"></i>`).join("")}</div><div class="crm-app-chart-labels"><span>ЯНВ</span><span>МАР</span><span>МАЙ</span><span>ИЮЛ</span><span>СЕН</span><span>НОЯ</span></div></div>
                <div class="crm-app-bottom"><div><small>АКТИВНЫЕ ЗАЯВКИ</small><b>18</b><span>Требуют внимания</span></div><div><small>ОБЪЕКТЫ В РАБОТЕ</small><b>07</b><span>Текущие проекты</span></div><div><small>ЗАДАЧИ</small><b>24</b><span>Запланировано</span></div></div>
              </div>
              <div class="crm-app-view" data-crm-view="leads"><div class="crm-app-list-head"><b>Заявки</b><span>+ Новая заявка</span></div><div class="crm-app-table"><div class="crm-app-row crm-app-row-head"><span>НАЗВАНИЕ</span><span>КЛИЕНТ</span><span>СТАТУС</span><span>БЮДЖЕТ</span></div><div class="crm-app-row"><b>Демонтаж помещения</b><span>ООО «Вектор»</span><em>В работе</em><strong>1 850 000 ₽</strong></div><div class="crm-app-row"><b>Подготовка объекта</b><span>А. Смирнов</span><em>Новая</em><strong>640 000 ₽</strong></div><div class="crm-app-row"><b>Комплексная отделка</b><span>ООО «Контур»</span><em>Расчёт</em><strong>3 200 000 ₽</strong></div></div><div class="crm-app-hint">Заявка связана с клиентом, объектом, расчётом и дальнейшими задачами.</div></div>
              <div class="crm-app-view" data-crm-view="objects"><div class="crm-app-object-title"><div><small>ОБЪЕКТ / 024</small><b>Демонтаж и подготовка помещения</b></div><span>В РАБОТЕ</span></div><div class="crm-app-object-grid"><div><small>ПЛОЩАДЬ</small><b>420 м²</b></div><div><small>ЭТАП</small><b>Демонтаж</b></div><div><small>СРОК</small><b>12 дней</b></div><div><small>ПЛАНОВАЯ СТОИМОСТЬ</small><b>1 850 000 ₽</b></div></div><div class="crm-app-progress"><div><span>ХОД ВЫПОЛНЕНИЯ</span><b>68%</b></div><i><b></b></i></div><div class="crm-app-hint">Смета, исполнители, сроки и финансовые показатели собраны в карточке объекта.</div></div>
              <div class="crm-app-view" data-crm-view="estimate"><div class="crm-app-list-head"><b>Производство и ПИ</b><span>Новый расчёт</span></div><div class="crm-app-object-grid crm-app-estimate-grid"><div><small>ОБЪЁМ РАБОТ</small><b>420 м²</b></div><div><small>ТРУДОЁМКОСТЬ</small><b>186 ч</b></div><div><small>БРИГАДА</small><b>4 чел.</b></div><div><small>СРОК</small><b>12 дней</b></div></div><div class="crm-app-chart crm-app-estimate"><div class="crm-app-panel-title"><b>Структура расчёта</b><small>ПЛАНОВЫЕ ЗНАЧЕНИЯ</small></div><div class="crm-app-cost-row"><span>Работы</span><i><b style="width:78%"></b></i><strong>1 180 000 ₽</strong></div><div class="crm-app-cost-row"><span>Материалы</span><i><b style="width:46%"></b></i><strong>420 000 ₽</strong></div><div class="crm-app-cost-row"><span>Логистика</span><i><b style="width:23%"></b></i><strong>135 000 ₽</strong></div><div class="crm-app-cost-total"><span>ИТОГО ПО РАСЧЁТУ</span><b>1 735 000 ₽</b></div></div><div class="crm-app-hint">Плановые затраты, объёмы и трудоёмкость связаны с карточкой объекта.</div></div>
              <div class="crm-app-view" data-crm-view="radar"><div class="crm-app-list-head"><b>Радар заказов</b><span>Обновить поиск ↗</span></div><div class="crm-app-radar-summary"><div><small>НАЙДЕНО ЗАКАЗОВ</small><b>128</b><span>За текущий период</span></div><div><small>ПОДХОДЯТ ПО КРИТЕРИЯМ</small><b>16</b><span>Можно взять в работу</span></div></div><div class="crm-app-table crm-app-radar-table"><div class="crm-app-row crm-app-row-head"><span>ЗАКАЗ</span><span>ИСТОЧНИК</span><span>СОВПАДЕНИЕ</span><span>БЮДЖЕТ</span></div><div class="crm-app-row"><b>Ремонт офисного блока</b><span>Тендер</span><em>92%</em><strong>от 2,4 млн ₽</strong></div><div class="crm-app-row"><b>Демонтаж помещений</b><span>Площадка</span><em>86%</em><strong>от 780 тыс. ₽</strong></div><div class="crm-app-row"><b>Отделка коммерческого объекта</b><span>ЕИС</span><em>81%</em><strong>от 5,1 млн ₽</strong></div></div><div class="crm-app-hint">Поиск и предварительная оценка заказов по профилю, региону и экономике.</div></div>
            </div>
          </div>
        </div>
        <div class="crm-stage-index"><b data-crm-index>01</b><span>/ 05</span><i><b data-crm-progress></b></i></div>
      </div>
      <div class="crm-showcase-foot"><span data-crm-caption>01 / ОБЩАЯ КАРТИНА БИЗНЕСА</span><span>ПРОКРУТИТЕ, ЧТОБЫ ИЗУЧИТЬ <b>↓</b></span></div>
    </div>
  </section>`;
}

export function initCrmScrollShowcase(root=document){
  if(root.querySelector(".crm-scroll-showcase"))return;
  const hero=root.querySelector(".platform-hero");
  if(!hero)return;
  hero.insertAdjacentHTML("afterend",crmScreen());
  const section=root.querySelector(".crm-scroll-showcase");
  const reduced=window.matchMedia(REDUCED);
  const views=[...section.querySelectorAll("[data-crm-view]")];
  const tabs=[...section.querySelectorAll("[data-crm-tab]")];
  const captions=["ОБЩАЯ КАРТИНА БИЗНЕСА","ЗАЯВКИ И КЛИЕНТЫ","ОБЪЕКТЫ И ИСПОЛНЕНИЕ","ПРОИЗВОДСТВО И РАСЧЁТ","ПОИСК НОВЫХ ЗАКАЗОВ"];
  let frame=0;
  function render(){
    frame=0;
    const rect=section.getBoundingClientRect();
    const range=Math.max(1,rect.height-window.innerHeight);
    const progress=Math.max(0,Math.min(1,-rect.top/range));
    const index=Math.min(4,Math.floor(progress*5));
    const local=progress*5-index;
    section.style.setProperty("--crm-scroll-progress",progress.toFixed(4));
    section.style.setProperty("--crm-stage-scale",(0.88+Math.min(1,progress*2)*0.12).toFixed(3));
    section.style.setProperty("--crm-stage-y",(42-Math.min(1,progress*2)*42).toFixed(1)+"px");
    views.forEach((view,i)=>view.classList.toggle("is-active",i===index));
    tabs.forEach((tab,i)=>tab.classList.toggle("is-active",i===index));
    const title=["Обзор бизнеса","Заявки","Объекты","Производство и ПИ","Радар заказов"][index];
    const heading=section.querySelector("[data-crm-screen-heading]");
    const crumb=section.querySelector("[data-crm-screen-title]");
    if(heading)heading.textContent=title;
    if(crumb)crumb.textContent=title;
    const number=section.querySelector("[data-crm-index]");
    const caption=section.querySelector("[data-crm-caption]");
    const bar=section.querySelector("[data-crm-progress]");
    if(number)number.textContent="0"+(index+1);
    if(caption)caption.textContent=String(index+1).padStart(2,"0")+" / "+captions[index];
    if(bar)bar.style.transform="scaleX("+Math.max(.04,local)+")";
  }
  function schedule(){if(frame)return;frame=requestAnimationFrame(render)}
  if(!reduced.matches){
    window.addEventListener("scroll",schedule,{passive:true});
    window.addEventListener("resize",schedule,{passive:true});
    schedule();
  }else{
    section.classList.add("crm-motion-static");
    tabs.forEach((tab,i)=>tab.addEventListener("click",()=>{views.forEach((view,j)=>view.classList.toggle("is-active",i===j));tabs.forEach((item,j)=>item.classList.toggle("is-active",i===j));}));
  }
  if("IntersectionObserver"in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)section.classList.add("is-in-view")}),{threshold:.12});
    observer.observe(section);
  }
}
