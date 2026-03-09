<?php

namespace App\Notifications;

use App\Models\CouncilSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SessionCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public CouncilSession $session
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $title = $this->session->session_title ?? 'Session';
        $date = $this->session->session_date?->format('F j, Y') ?? '';
        $committee = $this->session->committee?->name ?? 'All SB Members';
        $message = "You have been scheduled to attend a session. {$title} — {$date}" . ($committee ? " ({$committee})" : '');

        return [
            'type' => 'session_created',
            'title' => 'New Session Scheduled',
            'message' => $message,
            'session_id' => $this->session->id,
            'session_title' => $this->session->session_title,
            'session_date' => $this->session->session_date?->toDateString(),
            'committee' => $committee,
        ];
    }
}
