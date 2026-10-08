import { SystemThemeEnum, MenuThemeEnum } from "@/enums/appEnum";

const AppConfig = {
  systemInfo: {
    name: "QuickAdmin",
  },
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: "" },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK },
  },
  themeList: [
    {
      theme: MenuThemeEnum.DESIGN,
      background: "#FFFFFF",
      systemNameColor: "var(--qa-gray-800)",
      iconColor: "#6B6B6B",
      textColor: "#29343D",
    },
    {
      theme: MenuThemeEnum.DARK,
      background: "#191A23",
      systemNameColor: "#D9DADB",
      iconColor: "#BABBBD",
      textColor: "#BABBBD",
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: "#ffffff",
      systemNameColor: "var(--qa-gray-800)",
      iconColor: "#6B6B6B",
      textColor: "#29343D",
    },
  ],
  darkMenuStyles: [
    {
      theme: MenuThemeEnum.DARK,
      background: "var(--default-box-color)",
      systemNameColor: "#DDDDDD",
      iconColor: "#BABBBD",
      textColor: "rgba(#FFFFFF, 0.7)",
    },
  ],
  systemMainColor: ["#4080ff", "#13deb9", "#ffae1f", "#ff4d4f", "#909399"],
};

export default AppConfig;
