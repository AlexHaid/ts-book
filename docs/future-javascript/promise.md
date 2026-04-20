# Promise

Класс Promise существует во многих современных движках JavaScript и может быть легко заполифиллен. Основной причиной использования промисов является синхронный стиль обработки ошибок в отличие от асинхронного коллбэк стиля.

## Коллбэк стиль

Чтобы в полной мере оценить промисы, давайте рассмотрим простой пример, который доказывает сложность создания надежного асинхронного кода с помощью только коллбэков. Рассмотрим простой случай создания асинхронной версии загрузки JSON из файла. Синхронная версия этого может быть довольно простой:

```ts
import fs = require('fs');

function loadJSONSync(filename: string) {
    return JSON.parse(fs.readFileSync(filename));
}

// валидный json файл
console.log(loadJSONSync('good.json'));

// несуществующий файл, поэтому fs.readFileSync завершается ошибкой
try {
    console.log(loadJSONSync('absent.json'));
} catch (err) {
    console.log('absent.json error', err.message);
}

// невалидный json файл т.е файл существует, но содержит невалидный JSON,
// поэтому JSON.parse завершается ошибкой
try {
    console.log(loadJSONSync('invalid.json'));
} catch (err) {
    console.log('invalid.json error', err.message);
}
```

Эта простая функция `loadJSONSync` имеет три варианта поведения: валидное возвращаемое значение, ошибка файловой системы или ошибка JSON.parse. Мы обрабатываем ошибки с помощью простого метода try / catch, как вы привыкли делать синхронное программирование на других языках. Теперь давайте сделаем хорошую асинхронную версию такой функции. Неплохая первоначальная версия с простой проверкой ошибки будет выглядеть следующим образом:

```ts
import fs = require('fs');

// Неплохая первоначальная версия .... но неправильная. Мы объясним причины ниже
function loadJSON(
    filename: string,
    cb: (error: Error, data: any) => void
) {
    fs.readFile(filename, function (err, data) {
        if (err) cb(err);
        else cb(null, JSON.parse(data));
    });
}
```

Всё достаточно просто, функция принимает коллбэк, передавая ему любые ошибки файловой системы. Если нет ошибок файловой системы, он возвращает результат `JSON.parse`. При работе с асинхронными функциями, основанными на обратных вызовах, следует помнить следующее:

1. Никогда не вызывайте коллбэк дважды.
2. Никогда не бросайте ошибку.

Однако эта простая функция не подходит для второго пункта. Фактически, `JSON.parse` выдает ошибку, если ему передан неверный JSON, в итоге коллбэк никогда не вызывается и приложение вылетает. Это продемонстрировано в следующем примере:

```ts
import fs = require('fs');

// Неплохая первоначальная версия .... но неправильная
function loadJSON(
    filename: string,
    cb: (error: Error, data: any) => void
) {
    fs.readFile(filename, function (err, data) {
        if (err) cb(err);
        else cb(null, JSON.parse(data));
    });
}

// загрузка невалидного json
loadJSON('invalid.json', function (err, data) {
    // Этот код никогда не выполнится
    if (err) console.log('bad.json error', err.message);
    else console.log(data);
});
```

Было бы наивной попыткой исправить это обернуть `JSON.parse` в `try...catch`, как показано в следующем примере:

```ts
import fs = require('fs');

// Версия получше .... но всё ещё неправильная
function loadJSON(
    filename: string,
    cb: (error: Error) => void
) {
    fs.readFile(filename, function (err, data) {
        if (err) {
            cb(err);
        } else {
            try {
                cb(null, JSON.parse(data));
            } catch (err) {
                cb(err);
            }
        }
    });
}

// загрузка невалидного json
loadJSON('invalid.json', function (err, data) {
    if (err) console.log('bad.json error', err.message);
    else console.log(data);
});
```

Тем не менее, в этом коде есть небольшая ошибка. Если коллбэк (`cb`), а не `JSON.parse`, выдает ошибку, так как мы завернули ее в `try...catch`, выполняется `catch`, и мы снова вызываем коллбэк, т. е. вызываем дважды! Это продемонстрировано в примере ниже:

```ts
import fs = require('fs');

function loadJSON(
    filename: string,
    cb: (error: Error) => void
) {
    fs.readFile(filename, function (err, data) {
        if (err) {
            cb(err);
        } else {
            try {
                cb(null, JSON.parse(data));
            } catch (err) {
                cb(err);
            }
        }
    });
}

// валидный файл, но плохой коллбэк ... вызывается снова!
loadJSON('good.json', function (err, data) {
    console.log('our callback called');

    if (err) console.log('Error:', err.message);
    else {
        // давайте имитируем ошибку, пытаясь получить
        // доступ к свойству неопределенной переменной
        var foo;
        // Следующий код выбросит ошибку
        // `Error: Cannot read property 'bar' of undefined`
        console.log(foo.bar);
    }
});
```

---

```bash
$ node asyncbadcatchdemo.js
our callback called
our callback called
Error: Cannot read property 'bar' of undefined
```

Это потому что наша функция `loadJSON` неправильно завернула коллбэк в блок `try`. Здесь нужно запомнить простое правило.

:::warning[Простое правило]

Держите весь ваш синхронный код в `try...catch`, кроме случаев, когда вы вызываете коллбэк.

:::

Следуя этому простому правилу, мы имеем полностью функциональную асинхронную версию `loadJSON`, как показано ниже:

```ts
import fs = require('fs');

function loadJSON(
    filename: string,
    cb: (error: Error) => void
) {
    fs.readFile(filename, function (err, data) {
        if (err) return cb(err);
        // Держим весь ваш синхронный код в try catch
        try {
            var parsed = JSON.parse(data);
        } catch (err) {
            return cb(err);
        }
        // кроме случаев, когда вы вызываете коллбэк
        return cb(null, parsed);
    });
}
```

Конечно, этому легко следовать как только вы уже проделали это несколько раз, но, тем не менее, это много шаблонного кода, который нужно писать просто для хорошей обработки ошибок. Теперь давайте рассмотрим более удачный способ борьбы с асинхронным JavaScript с использованием промисов.

## Создание Promise

Промис может быть в состоянии ожидание(`pending`), исполнено(`fulfilled`) или отклонено(`rejected`).

![состояния промиса и варианты его завершения](https://raw.githubusercontent.com/basarat/typescript-book/master/images/promise%20states%20and%20fates.png)

Давайте посмотрим на создание промиса. Достаточно просто вызвать `new` с `Promise` (конструктор промисов). Конструктор промисов передаст `resolve` и `reject` функции для определения состояния промиса:

```ts
const promise = new Promise((resolve, reject) => {
    // resolve / reject функции контролируют варианты завершения промиса
});
```

## Подписка на варианты завершения промиса

На варианты завершения промиса можно подписаться с помощью `.then` (если исполнено) или `.catch` (если отклонено).

```ts
const promise = new Promise((resolve, reject) => {
    resolve(123);
});
promise.then((res) => {
    console.log('I get called:', res === 123); // I get called: true
});
promise.catch((err) => {
    // Не будет вызвано
});
```

---

```ts
const promise = new Promise((resolve, reject) => {
    reject(new Error('Something awful happened'));
});
promise.then((res) => {
    // Не будет вызвано
});
promise.catch((err) => {
    console.log('I get called:', err.message);
    // I get called: 'Something awful happened'
});
```

-   Быстрое создание исполненного промиса: `Promise.resolve(result)`
-   Быстрое создание отклоненного промиса: `Promise.reject(error)`

## Цепочки промисов

Способность создавать цепочки вызова промисов - **это главное преимущество, которое предоставляют промисы**. Как только у вас появляется промис, вы можете использовать функцию `then` для создания цепочки промисов.

-   Если вы возвращаете промис из любой функции в цепочке, `.then` вызывается только когда его значение resolved:

```ts
Promise.resolve(123)
    .then((res) => {
        console.log(res); // 123
        return 456;
    })
    .then((res) => {
        console.log(res); // 456
        return Promise.resolve(123);
        // Обратите внимание, что мы возвращаем промис
    })
    .then((res) => {
        console.log(res);
        // 123 : Обратите внимание, что этот `then`
        // вызывается со значением resolved
        return 123;
    });
```

-   Вы можете объединить обработку ошибок любой предыдущей части цепочки с помощью одного `catch`:

```ts
// Создаём rejected промис
Promise.reject(new Error('something bad happened'))
    .then((res) => {
        console.log(res); // не вызывается
        return 456;
    })
    .then((res) => {
        console.log(res); // не вызывается
        return 123;
    })
    .then((res) => {
        console.log(res); // не вызывается
        return 123;
    })
    .catch((err) => {
        console.log(err.message); // случилось что-то плохое
    });
```

-   `сatch` фактически возвращает новый промис (фактически создавая новую цепочку промисов):

```ts
// Создаём rejected промис
Promise.reject(new Error('something bad happened'))
    .then((res) => {
        console.log(res); // не вызывается
        return 456;
    })
    .catch((err) => {
        console.log(err.message); // случилось что-то плохое
        return 123;
    })
    .then((res) => {
        console.log(res); // 123
    });
```

-   Любые синхронные ошибки, добавленные в `then` (или `catch`), приводят к тому, что возвращаемый промис не исполняется:

```ts
Promise.resolve(123)
    .then((res) => {
        throw new Error('something bad happened');
        // генерируем синхронную ошибку
        return 456;
    })
    .then((res) => {
        console.log(res); // не вызывается
        return Promise.resolve(789);
    })
    .catch((err) => {
        console.log(err.message); // случилось что-то плохое
    });
```

-   Только соответствующий (ближайший) `catch` вызывается для данной ошибки (так как catch запускает новую цепочку промисов).

```ts
Promise.resolve(123)
    .then((res) => {
        throw new Error('something bad happened');
        // генерируем синхронную ошибку
        return 456;
    })
    .catch((err) => {
        console.log('first catch: ' + err.message);
        // случилось что-то плохое
        return 123;
    })
    .then((res) => {
        console.log(res); // 123
        return Promise.resolve(789);
    })
    .catch((err) => {
        console.log('second catch: ' + err.message);
        // не вызывается
    });
```

-   `сatch` вызывается только в случае ошибки в предыдущей цепочке:

```ts
Promise.resolve(123)
    .then((res) => {
        return 456;
    })
    .catch((err) => {
        console.log('HERE'); // не вызывается
    });
```

Дело в том, что:

-   ошибки переходят к `catch` (и пропускают любые средние вызовы `then`) и
-   синхронные ошибки также отлавливаются любым `catch`,

эффективно предоставляя нам парадигму асинхронного программирования, которая позволяет обрабатывать ошибки лучше, чем необработанные коллбэки. Подробнее об этом ниже.

## TypeScript и промисы

Отличительной особенностью TypeScript является то, что он понимает поток значений, проходящих через цепочку промисов:

```ts
Promise.resolve(123)
    .then((res) => {
        // res подразумевает тип `number`
        return true;
    })
    .then((res) => {
        // res подразумевает тип `boolean`
    });
```

Конечно, он также понимает развертывание любых вызовов функций, которые могут вернуть промис:

```ts
function iReturnPromiseAfter1Second(): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => resolve('Hello world!'), 1000);
    });
}

Promise.resolve(123)
    .then((res) => {
        // res подразумевает тип `number`
        return iReturnPromiseAfter1Second(); // мы возвращаем `Promise<string>`
    })
    .then((res) => {
        // res подразумевает тип `string`
        console.log(res); // Hello world!
    });
```

## Преобразование коллбэка для возврата промиса

Просто оберните вызов функции в промис и

-   `reject` если произошла ошибка,
-   `resolve` если все хорошо.

Например, давайте завернем `fs.readFile`:

```ts
import fs = require('fs');
function readFileAsync(filename: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}
```

## Возвращаясь к примеру с JSON

Теперь давайте вернемся к нашему примеру `loadJSON` и перепишем асинхронную версию, которая использует промисы. Все, что нам нужно сделать, это прочитать содержимое файла как промис, затем парсим его как JSON, и все готово. Это показано в следующем примере:

```ts
function loadJSONAsync(filename: string): Promise<any> {
    return readFileAsync(filename) // Use the function we just wrote
        .then(function (res) {
            return JSON.parse(res);
        });
}
```

Использование (обратите внимание, насколько оно похоже на оригинальную версию `sync`, представленную в начале этого раздела 🌹):

```ts
// валидный json файл
loadJSONAsync('good.json')
    .then(function (val) {
        console.log(val);
    })
    .catch(function (err) {
        console.log('good.json error', err.message); // не вызывается
    })

    // несуществующий json файл
    .then(function () {
        return loadJSONAsync('absent.json');
    })
    .then(function (val) {
        console.log(val);
    }) // не вызывается
    .catch(function (err) {
        console.log('absent.json error', err.message);
    })

    // невалидный json файл
    .then(function () {
        return loadJSONAsync('invalid.json');
    })
    .then(function (val) {
        console.log(val);
    }) // не вызывается
    .catch(function (err) {
        console.log('bad.json error', err.message);
    });
```

Эта функция проще, потому что объединение промисов произвело "`loadFile`(async) + `JSON.parse` (sync) => `catch`" объединение. Также коллбэк не был вызван _нами_, но вызван цепочкой промисов, поэтому у нас не было возможности совершить ошибку, заключив его в `try...catch`.

## Параллельное управление потоком

Мы видели, как просто выполнять серию последовательных асинхронных задач с промисами. Просто использованием цепочки вызовов `then`.

Однако вы, возможно, захотите выполнить серию асинхронных задач, а затем что-то сделать с результатами всех этих задач. `Promise` предоставляет статическую функцию `Promise.all`, которую вы можете использовать для ожидания выполнения `n` промисов. Вы предоставляете ему массив `n` промисов, и он дает вам массив `n` resolve значений. Ниже мы показываем последовательный вызов по цепочке, а также параллельно:

```ts
// асинхронная функция для имитации загрузки элемента с какого-либо сервера
function loadItem(id: number): Promise<{ id: number }> {
    return new Promise((resolve) => {
        console.log('loading item', id);
        setTimeout(() => {
            // имитируем задержку сервера
            resolve({ id: id });
        }, 1000);
    });
}

// последовательный вызов по цепочке
let item1, item2;
loadItem(1)
    .then((res) => {
        item1 = res;
        return loadItem(2);
    })
    .then((res) => {
        item2 = res;
        console.log('done');
    }); // общее время будет около 2с.

// параллельный вызов
Promise.all([loadItem(1), loadItem(2)]).then((res) => {
    [item1, item2] = res;
    console.log('done');
}); // общее время будет около 1с.
```

Иногда вы хотите запустить серию асинхронных задач, но вы получите все, что вам нужно, при условии, что будет решена любая из этих задач. `Promise` предоставляет статическую функцию `Promise.race` для этого сценария:

```ts
var task1 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 1000, 'one');
});
var task2 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 2000, 'two');
});

Promise.race([task1, task2]).then(function (value) {
    console.log(value); // "one"
    // исполнены обе, но task1 исполнился быстрее
});
```

## Преобразование коллбэков в промис

Самый надежный способ сделать это вручную. Например, преобразовать `setTimeout` в промис `delay` очень просто:

```ts
const delay = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));
```

Обратите внимание, что в NodeJS есть супер-удобная функция, которая выполняет вот такую `node style function => promise returning function` магию для вас:

```ts
/** Пример использования */
import fs = require('fs');
import util = require('util');
const readFile = util.promisify(fs.readFile);
```
