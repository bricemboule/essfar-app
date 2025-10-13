<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Emploi du temps - {{ $teacher->name }}</title>
    <style>
        @page {
            margin: 15mm;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11pt;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #667eea;
            color: white;
            border-radius: 5px;
        }
        .header h1 {
            margin: 0;
            font-size: 20pt;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 11pt;
        }
        .info-section {
            margin: 15px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
        }
        .info-section p {
            margin: 5px 0;
        }
        .stats {
            display: table;
            width: 100%;
            margin: 15px 0;
        }
        .stat-item {
            display: table-cell;
            width: 50%;
            text-align: center;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
        }
        .stat-number {
            font-size: 24pt;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            font-size: 10pt;
            color: #666;
        }
        .day-section {
            margin: 20px 0;
            page-break-inside: avoid;
        }
        .day-header {
            background-color: #667eea;
            color: white;
            padding: 8px 12px;
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 10px;
        }
        .course-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .course-table th {
            background-color: #e9ecef;
            padding: 8px;
            text-align: left;
            border: 1px solid #dee2e6;
            font-size: 10pt;
        }
        .course-table td {
            padding: 10px 8px;
            border: 1px solid #dee2e6;
            font-size: 10pt;
            vertical-align: top;
        }
        .time-cell {
            background-color: #667eea;
            color: white;
            font-weight: bold;
            text-align: center;
            width: 80px;
        }
        .course-name {
            font-weight: bold;
            color: #333;
            margin-bottom: 3px;
        }
        .course-details {
            color: #666;
            font-size: 9pt;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 3px;
            font-size: 8pt;
            font-weight: bold;
        }
        .badge-scheduled {
            background-color: #cce5ff;
            color: #004085;
        }
        .badge-completed {
            background-color: #d4edda;
            color: #155724;
        }
        .badge-cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            font-size: 9pt;
            color: #666;
        }
        .no-courses {
            padding: 10px;
            text-align: center;
            color: #666;
            font-style: italic;
            background-color: #f8f9fa;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📅 EMPLOI DU TEMPS</h1>
        <p>{{ $teacher->name }}</p>
        <p>Du {{ \Carbon\Carbon::parse($startDate)->format('d/m/Y') }} au {{ \Carbon\Carbon::parse($endDate)->format('d/m/Y') }}</p>
    </div>

    <div class="info-section">
        <p><strong>Enseignant :</strong> {{ $teacher->name }}</p>
        <p><strong>Email :</strong> {{ $teacher->email }}</p>
        <p><strong>Période :</strong> Semaine du {{ \Carbon\Carbon::parse($startDate)->format('d/m/Y') }}</p>
    </div>

    <div class="stats">
        <div class="stat-item">
            <div class="stat-number">{{ count($schedules) }}</div>
            <div class="stat-label">Séances programmées</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">
                {{ number_format($schedules->sum(function($s) {
                    $start = new DateTime($s->start_time);
                    $end = new DateTime($s->end_time);
                    return $end->diff($start)->h + ($end->diff($start)->i / 60);
                }), 1) }}h
            </div>
            <div class="stat-label">Volume horaire total</div>
        </div>
    </div>

    <h2 style="color: #667eea; margin-top: 25px; border-bottom: 2px solid #667eea; padding-bottom: 5px;">
        Planning détaillé de la semaine
    </h2>

    @php
        $days = [
            1 => ['name' => 'Lundi', 'schedules' => []],
            2 => ['name' => 'Mardi', 'schedules' => []],
            3 => ['name' => 'Mercredi', 'schedules' => []],
            4 => ['name' => 'Jeudi', 'schedules' => []],
            5 => ['name' => 'Vendredi', 'schedules' => []],
            6 => ['name' => 'Samedi', 'schedules' => []],
            7 => ['name' => 'Dimanche', 'schedules' => []],
        ];
        
        foreach ($schedules as $schedule) {
            $dayOfWeek = \Carbon\Carbon::parse($schedule->start_time)->dayOfWeek ?: 7;
            if (isset($days[$dayOfWeek])) {
                $days[$dayOfWeek]['schedules'][] = $schedule;
            }
        }
    @endphp

    @foreach($days as $day => $data)
        <div class="day-section">
            <div class="day-header">
                {{ $data['name'] }} - {{ count($data['schedules']) }} cours
            </div>

            @if(count($data['schedules']) > 0)
                <table class="course-table">
                    <thead>
                        <tr>
                            <th style="width: 80px;">Heure</th>
                            <th>Cours</th>
                            <th style="width: 120px;">Classe</th>
                            <th style="width: 100px;">Salle</th>
                            <th style="width: 80px;">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach(collect($data['schedules'])->sortBy('start_time') as $schedule)
                        <tr>
                            <td class="time-cell">
                                {{ \Carbon\Carbon::parse($schedule->start_time)->format('H:i') }}<br>
                                {{ \Carbon\Carbon::parse($schedule->end_time)->format('H:i') }}
                            </td>
                            <td>
                                <div class="course-name">{{ $schedule->course->name ?? 'Cours' }}</div>
                                @if($schedule->notes)
                                <div class="course-details">📝 {{ $schedule->notes }}</div>
                                @endif
                                <div class="course-details">
                                    ⏱️ Durée : 
                                    @php
                                        $start = new DateTime($schedule->start_time);
                                        $end = new DateTime($schedule->end_time);
                                        $duration = $end->diff($start);
                                        echo $duration->h . 'h' . ($duration->i > 0 ? $duration->i . 'min' : '');
                                    @endphp
                                </div>
                            </td>
                            <td>{{ $schedule->schoolClass->name ?? 'N/A' }}</td>
                            <td>{{ $schedule->classroom->name ?? 'N/A' }}</td>
                            <td>
                                @php
                                    $statusClass = 'badge-scheduled';
                                    $statusLabel = 'Programmé';
                                    if ($schedule->status === 'completed') {
                                        $statusClass = 'badge-completed';
                                        $statusLabel = 'Terminé';
                                    } elseif ($schedule->status === 'cancelled') {
                                        $statusClass = 'badge-cancelled';
                                        $statusLabel = 'Annulé';
                                    }
                                @endphp
                                <span class="status-badge {{ $statusClass }}">{{ $statusLabel }}</span>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="no-courses">Aucun cours programmé</div>
            @endif
        </div>
    @endforeach

    <div class="footer">
        <p><strong>Document généré le {{ $generatedDate }}</strong></p>
        <p>Ce planning est susceptible d'être modifié. Consultez régulièrement votre emploi du temps.</p>
        <p>Pour toute question, contactez le service scolarité.</p>
    </div>
</body>
</html>