export const timeHourMin = (time) => {
    time = new Date(time);
    return time.toLocaleString('en-IN', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
};
