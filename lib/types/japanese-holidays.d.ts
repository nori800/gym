declare module "japanese-holidays" {
  const JapaneseHolidays: {
    /** 祝日なら名称の文字列、否则 undefined。furikae 既定 true で振替休日・国民の休日を含む */
    isHoliday(date: Date, furikae?: boolean): string | undefined;
  };
  export default JapaneseHolidays;
}
