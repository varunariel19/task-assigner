import { Script, scripts } from "../constants";

export function formatTime12h(dateString: string): string {
    const now = new Date(dateString);
    const month = now.getMonth();
    const year = now.getFullYear();
    const date = now.getDate();



    const fullTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    }).format(now);

    return `${getFullMonth(month)} ${date}, ${year} at ${fullTime}`
}

export function getFullMonth(month: number): string {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return months[month] ?? "";
}


export function bindPromptScript(script: Script) {
    return scripts[script].generatePrompt;
}