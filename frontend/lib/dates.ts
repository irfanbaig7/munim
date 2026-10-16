const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" (aapke local time ke hisaab se) */
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const todayYMD = () => ymd(new Date());

export function addDaysYMD(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return ymd(d);
}

/** Entry kab bani (aapke local time mein): "15 Oct, 5:20 pm" */
export function formatDay(iso: string): string {
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

/** Dene ki tareekh. Ye UTC midnight par save hoti hai, isliye UTC mein hi dikhate hain, warna din badal sakta hai. */
export function formatDue(iso: string): string {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}