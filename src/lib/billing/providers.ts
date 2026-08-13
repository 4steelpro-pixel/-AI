export type PaymentProvider = "yoomoney" | "cloudpayments" | "manual";

export function getRecommendedProvider(): PaymentProvider {
  return "yoomoney";
}

export function getProviderConfig(provider: PaymentProvider) {
  switch (provider) {
    case "yoomoney":
      return {
        name: "ЮKassa / YooMoney",
        description: "Подходит для русских карт и банковских платежей в РФ.",
        docs: "https://yookassa.ru/docs",
      };
    case "cloudpayments":
      return {
        name: "CloudPayments",
        description: "Поддержка карт РФ и популярных способов оплаты.",
        docs: "https://cloudpayments.ru/",
      };
    default:
      return {
        name: "Ручная проверка",
        description: "Для локального MVP и тестов без внешней интеграции.",
        docs: "",
      };
  }
}
