export class GlobalVariable {
    public static pageTake: number = window.innerWidth > 1366 ? 10 : 10;
    public static audioSuccess: HTMLAudioElement = new Audio(
        './sound/success-notification-alert_A_major.wav'
    );

    public static audioFailed: HTMLAudioElement = new Audio(
        './sound/windows-xp-error.wav'
    );

    public static audioInfo: HTMLAudioElement = new Audio(
        './sound/windows-logon.wav'
    );
}
