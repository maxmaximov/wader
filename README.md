# App.Js

## Общая информация

"Фреймворк" построенный на принципе MVC ( HMVC ) с учётом особенностей языка.

* Блекджек и блудницы
* Единая точка входа
* Система роутинга

## Зависимости

* jQuery
* jQuery.Class
* History.js
* Require.js
* Underscore.js

## История версий

### 0.1

inital release

### 0.1.1

* Система роутинга ( App.Route );

### 0.1.2

* Pub\Sub интерфейс  (App.sub(), App.pub(), App.unsub());
* Рефакторинг (поведение App как модуля, JsLint);

### 0.1.3

* App.Router bugfixes
* App.Router GET parameters workaround (App.Router.getParams():object, App.Router.getParamsString():string)

### 0.1.4

* App.js рефакторинг, смена схемы роутинга (модуль-правила на класс-правила);

### 0.2

* Все части App теперь объединены нейспейсом (и одноимённой папкой) app.
* App теперь реализует паттерн синглтон. (См. пример ниже).
* И зависит от Underscore.js.
* App.Route.js переименован в app/Router.js (класс app.Router).
* Pubsub (методы App.sub, App.unsub и App.pub) вынесен из App.js в app/Hub.js (класс app.Hub). Сигнатуры и реализация методов не изменились.
* App.dmesg переименован в Logger.log и, соответственно, перенесён в app/Logger.js (класс app.Logger).
* Добавлен app.Comet
* Добавлен интерфейс для модулей app.IModule
* Добавлен абстрактный класс app.ADeferredModule
* Добавлен app.App.when()
* Изменились правила преобразования имени модуля в имя соответствующего файла (метод app.App._getModuleNameByClass()).
  Было: Filehost.Module.Gallery -> filehost/module/gallery.js
  Стало: filehost.module.Gallery -> filehost/module/Gallery.js 
* У App-а появилось состояние готовности. Выключается при выполнении метода run(). Включается по факту готовности всех модулей.
  Модули бывают двух типов — обычные (реализующие интерфейс app.IModule) и «отложенные» (наследующие абстрактный класс app.ADeferredModule). 
  App считает обычный модуль готовым, как только его метод run() возвращает управление.
  «Отложенные» модули должны сами сообщить о своей готовности: app.Hub.pub("app/module/ready", that.constructor.fullName); 


## Строение

### app.App (app/App.js)

**Статические методы**

when()

**Методы прототипа**

init()
run()
cleanup()

**Описание**

Ядро.

Следит за изменениями location и запускает модули-контроллеры в соответствии с заданными правилами роутинга.

### app.Router (app/Router.js)

**Статические методы**

**Методы прототипа**

**Описание**

Роутер.

блаблабла

### app.Hub (app/Hub.js)

**Статические методы**

pub()
sub()
unsub()

**Методы прототипа**

Отсутствуют.

**Описание**

Pubsub Hub.

блаблабла

### app.Logger (app/Logger.js)

**Статические методы**

log()

**Методы прототипа**

Отсутствуют.

**Описание**

Обёртка вокруг console.log.

### app.Comet (app/Comet.js)

**Статические методы**

send()

**Методы прототипа**

init()

**Описание**

Реализует (пока) только long-polling. Реализован (пока) как синглтон.

## Пример использования

### Единая точка входа

подключается директивой "data-main" в тeге <script> используемом для require.js

    <script data-main="/js/main" src="/js/require.js"></script>

Пример содержимого:
    require([ "app/App" ], function(App) {
        // Правила для роутера вида ( Класс (контроллер) : массив правил ). Правила могут быть строкой или регулярным выражением.
        var moduleRoutes = {
            "app.module.Common" : [ /.*/ ],
            "app.module.CategoryList" : [ "product/category/list" ],
            "app.module.CategoryEdit" : [ "product/category/edit" ]
        };

        // Инициализация ядра приложения
        var app = new App.getInstance({
            routes: moduleRoutes,
            baseNamespace: "App"
        });
    
        // Первый запуск ( Последующие сработают автоматически при смене url )
        app.run();
    });

### TODO для документации

PUB/SUB
