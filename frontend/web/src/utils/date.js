const pad = (n) => String(n).padStart(2, "0");

export function formatToDate(date = new Date(), format = "YYYY-MM-DD") {
  const d = date instanceof Date ? date : new Date(date);
  const map = {
    YYYY: d.getFullYear(),
    MM: pad(d.getMonth() + 1),
    DD: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m]);
}
