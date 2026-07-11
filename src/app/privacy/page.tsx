import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Link href="/" className="text-sm text-slate-400 hover:text-brand">
        ← На главную
      </Link>
      <h1 className="text-3xl font-semibold text-slate-800">Политика конфиденциальности</h1>
      <div className="flex flex-col gap-4 text-slate-600">
        <p>
          Сервис «ПрофНавигатор AI» собирает ответы, которые вы указываете в опросе (включая
          сведения о доходе, стаже и семейном положении), исключительно для формирования вашего
          персонального отчёта о подборе профессии.
        </p>
        <p>
          Ваши ответы не передаются третьим лицам и не используются в рекламных целях. Данные
          хранятся на серверах, расположенных на территории Российской Федерации, в соответствии
          с требованиями 152-ФЗ «О персональных данных».
        </p>
        <p>
          Сгенерированный отчёт доступен только вам по прямой ссылке для скачивания и не
          публикуется без вашего действия.
        </p>
        <p>
          По вопросам обработки данных вы можете написать нам на{" "}
          <a href="mailto:support@profnavigator.ai" className="text-brand hover:text-brand-hover">
            support@profnavigator.ai
          </a>
          .
        </p>
      </div>
    </main>
  );
}
