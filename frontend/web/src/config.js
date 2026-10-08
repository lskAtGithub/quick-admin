import { SystemThemeEnum } from "@/enums/appEnum";

const AppConfig = {
  systemInfo: {
    name: "QuickAdmin",
  },
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: "" },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK },
  },
  systemMainColor: ["#4080ff", "#13deb9", "#ffae1f", "#ff4d4f", "#909399"],
};

export default AppConfig;
