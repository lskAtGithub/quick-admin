import { ref, onMounted, onUnmounted } from 'vue';
import { $t } from '@/locales';

const weekText = (d) => $t('home.weekFull', { weekday: $t(`home.week.${d.getDay()}`) });

export function useNow(_showMeridiem = true) {
  const now = new Date();
  const hour = ref(String(now.getHours()).padStart(2, '0'));
  const minute = ref(String(now.getMinutes()).padStart(2, '0'));
  const second = ref(String(now.getSeconds()).padStart(2, '0'));
  const year = ref(now.getFullYear());
  const month = ref(String(now.getMonth() + 1).padStart(2, '0'));
  const day = ref(String(now.getDate()).padStart(2, '0'));
  const week = ref(weekText(now));
  const meridiem = ref(now.getHours() < 12 ? 'AM' : 'PM');

  let timer = null;

  const update = () => {
    const d = new Date();
    hour.value = String(d.getHours()).padStart(2, '0');
    minute.value = String(d.getMinutes()).padStart(2, '0');
    second.value = String(d.getSeconds()).padStart(2, '0');
    year.value = d.getFullYear();
    month.value = String(d.getMonth() + 1).padStart(2, '0');
    day.value = String(d.getDate()).padStart(2, '0');
    meridiem.value = d.getHours() < 12 ? 'AM' : 'PM';
    week.value = weekText(d);
  };

  onMounted(() => {
    update();
    timer = setInterval(update, 1000);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { hour, minute, second, year, month, day, week, meridiem };
}
