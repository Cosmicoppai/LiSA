export const timeHourMin = (time: string | Date) => {
    time = new Date(time);
    return time.toLocaleString('en-IN', {
        hour: 'numeric',
        minute: 'numeric',
        month: 'short',
        year: '2-digit',
        day: 'numeric',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
};
