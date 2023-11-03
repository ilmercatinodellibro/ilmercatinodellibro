import {
  mdiAlert,
  mdiAlertCircle,
  mdiAlertCircleOutline,
  mdiCheckCircle,
} from "@quasar/extras/mdi-v7";
import { useI18nOutsideSetup } from "src/boot/i18n";

const { t } = useI18nOutsideSetup();

export const STRENGTH_BAR_STEPS: PasswordStrengthBarStep[] = [
  {
    minOccurrences: 0,
    end: 100,
    start: 100,
    color: "positive",
    message: t("auth.securePassword"),
    icon: mdiCheckCircle,
  },
  {
    minOccurrences: 1,
    end: 100,
    start: 80,
    color: "warning",
    message: t("auth.vulnerablePassword"),
    icon: mdiAlert,
  },
  {
    minOccurrences: 10,
    end: 80,
    start: 25,
    color: "orange",
    message: t("auth.vulnerablePasswordWarning"),
    icon: mdiAlertCircleOutline,
  },
  {
    minOccurrences: 90,
    end: 25,
    start: 1,
    color: "negative",
    message: t("auth.dangerousPassword"),
    icon: mdiAlertCircle,
  },
];

export interface PasswordStrengthBarStep {
  minOccurrences: number;
  start: number;
  end: number;
  color: string;
  icon: string;
  message: string;
}
