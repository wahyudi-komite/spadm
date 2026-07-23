import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ConfirmDialogData } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogFeedbackService {
    private toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        },
    });

    confirm(data: ConfirmDialogData): Observable<boolean> {
        const isWarn = data.tone === 'warn';
        this.playSound(isWarn ? 'warning' : 'info');
        return from(
            Swal.fire({
                title: data.title || 'Konfirmasi',
                text: data.message,
                icon: isWarn ? 'warning' : 'question',
                showCancelButton: true,
                confirmButtonText: data.confirmText || 'Ya, Lanjutkan',
                cancelButtonText: data.cancelText || 'Batal',
                confirmButtonColor: isWarn ? '#dc2626' : '#2563eb',
                cancelButtonColor: '#6b7280',
                reverseButtons: true,
                customClass: {
                    popup: 'font-sans rounded-2xl p-6 shadow-2xl',
                    title: 'text-xl font-bold text-gray-900 dark:text-white',
                    htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
                    confirmButton: 'font-sans font-semibold px-4 py-2 rounded-xl text-sm shadow-md',
                    cancelButton: 'font-sans font-semibold px-4 py-2 rounded-xl text-sm',
                },
            })
        ).pipe(map((result) => result.isConfirmed));
    }

    success(message: string): void {
        this.playSound('success');
        this.toast.fire({
            icon: 'success',
            title: message,
        });
    }

    error(message: string): void {
        this.playSound('error');
        this.toast.fire({
            icon: 'error',
            title: message,
        });
    }

    info(message: string): void {
        this.playSound('info');
        this.toast.fire({
            icon: 'info',
            title: message,
        });
    }

    warning(message: string): void {
        this.playSound('warning');
        this.toast.fire({
            icon: 'warning',
            title: message,
        });
    }

    private playSound(type: 'success' | 'error' | 'warning' | 'info') {
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            if (type === 'success') {
                // Success Chime: C5 - E5 - G5 major chord chime
                const notes = [523.25, 659.25, 784.00];
                notes.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08);

                    gain.gain.setValueAtTime(0.12, ctx.currentTime + index * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.08 + 0.25);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + index * 0.08);
                    osc.stop(ctx.currentTime + index * 0.08 + 0.25);
                });
            } else if (type === 'error') {
                // Error Sound: Downward 350Hz - 220Hz notes
                const notes = [350, 220];
                notes.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);

                    gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.1);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.1 + 0.3);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + index * 0.1);
                    osc.stop(ctx.currentTime + index * 0.1 + 0.3);
                });
            } else {
                // Warning / Info Chime: Gentle 440Hz -> 587Hz
                const notes = [440, 587.33];
                notes.forEach((freq, index) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.09);

                    gain.gain.setValueAtTime(0.1, ctx.currentTime + index * 0.09);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.09 + 0.25);

                    osc.connect(gain);
                    gain.connect(ctx.destination);

                    osc.start(ctx.currentTime + index * 0.09);
                    osc.stop(ctx.currentTime + index * 0.09 + 0.25);
                });
            }
        } catch {
            // AudioContext fallback for browser autoplay policies
        }
    }
}
