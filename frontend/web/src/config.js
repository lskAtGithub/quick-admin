import { SystemThemeEnum, MenuThemeEnum, MenuTypeEnum } from "@/enums/appEnum";
import { configImages } from "@/config/assets/images";

const AppConfig = {
  systemInfo: {
    name: "QuickAdmin",
  },
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: "" },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK },
  },
  settingThemeList: [
    { theme: SystemThemeEnum.LIGHT, img: configImages.themeStyles.light },
    { theme: SystemThemeEnum.DARK, img: configImages.themeStyles.dark },
    { theme: SystemThemeEnum.AUTO, img: configImages.themeStyles.system },
  ],
  menuLayoutList: [
    { value: MenuTypeEnum.LEFT, img: configImages.menuLayouts.vertical },
    { value: MenuTypeEnum.TOP, img: configImages.menuLayouts.horizontal },
    { value: MenuTypeEnum.TOP_LEFT, img: configImages.menuLayouts.mixed },
    { value: MenuTypeEnum.DUAL_MENU, img: configImages.menuLayouts.dualColumn },
  ],
  themeList: [
    {
      theme: MenuThemeEnum.DESIGN,
      img: configImages.menuStyles.design,
      background: "#FFFFFF",
      systemNameColor: "var(--qa-gray-800)",
      iconColor: "#6B6B6B",
      textColor: "#29343D",
    },
    {
      theme: MenuThemeEnum.DARK,
      background: "#191A23",
      img: configImages.menuStyles.dark,
      systemNameColor: "#D9DADB",
      iconColor: "#BABBBD",
      textColor: "#BABBBD",
    },
    {
      theme: MenuThemeEnum.LIGHT,
      img: configImages.menuStyles.light,
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
