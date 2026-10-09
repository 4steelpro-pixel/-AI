import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";

export const metadata = {
  title: "Политика использования cookie",
};

export default function CookiesPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/" className="text-sm text-slate-400 hover:text-brand">← На главную</Link>
      <h1 className="text-3xl font-semibold text-slate-800">Политика использования cookie</h1>
      <p className="text-sm text-slate-400">Редакция от 8 октября 2026 года</p>

      <div className="flex flex-col gap-5 leading-7 text-slate-600">
        <p>
          Сервис «ПрофНавигатор AI» использует файлы cookie и локальное хранилище браузера.
          Cookie — это небольшие записи, которые сайт сохраняет в браузере. Локальное хранилище
          работает сходным образом, но данные из него не отправляются серверу автоматически.
        </p>

        <h2 className="text-xl font-semibold text-slate-800">Обязательные технологии</h2>
        <p>
          Они необходимы для безопасности, входа в аккаунт, сохранения оплаченного доступа и
          запоминания выбранных настроек. Без них отдельные функции сервиса работать не смогут.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead><tr className="border-b"><th className="p-3">Название</th><th className="p-3">Назначение</th><th className="p-3">Срок</th></tr></thead>
            <tbody>
              <tr className="border-b"><td className="p-3 font-mono">pn_cookie_consent</td><td className="p-3">Выбранный режим cookie</td><td className="p-3">1 год</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">pn_consent_id</td><td className="p-3">Подтверждение записи выбора; недоступен JavaScript</td><td className="p-3">1 год</td></tr>
              <tr className="border-b"><td className="p-3 font-mono">pn_access_token</td><td className="p-3">Защищённое подтверждение оплаченного доступа; недоступен JavaScript</td><td className="p-3">1 год</td></tr>
              <tr><td className="p-3 font-mono">authToken</td><td className="p-3">Авторизация пользователя в личном кабинете (localStorage)</td><td className="p-3">До выхода из аккаунта или очистки браузера</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-slate-800">Продуктовая аналитика</h2>
        <p>
          Только после выбора «Принять все» сервис регистрирует этапы прохождения теста:
          начало, завершение разделов, отправку анкеты и выгрузку отчёта. Для связи событий одной
          сессии используется случайный UUID. Сторонние рекламные счётчики сейчас не применяются.
          При выборе «Только необходимые» такие клиентские события не отправляются.
        </p>

        <h2 className="text-xl font-semibold text-slate-800">Как изменить выбор</h2>
        <p>
          Вы можете в любой момент открыть настройки ниже. Новый выбор заменит прежний.
          Дополнительно cookie и localStorage можно удалить в настройках браузера; после этого
          потребуется войти заново, а гостевой оплаченный доступ может потребовать восстановления.
        </p>
        <div><CookieSettingsButton /></div>

        <h2 className="text-xl font-semibold text-slate-800">Контакты</h2>
        <p>
          Оператор: ИП Аношин Илья Александрович, ИНН 645393837753. Вопросы можно направлять на{" "}
          <a href="mailto:info@profnaviai.ru" className="text-brand underline">info@profnaviai.ru</a>.
        </p>
        <p>
          Подробнее об обработке информации — в{" "}
          <Link href="/privacy" className="text-brand underline">Политике обработки персональных данных</Link>.
        </p>
      </div>
    </main>
  );
}
