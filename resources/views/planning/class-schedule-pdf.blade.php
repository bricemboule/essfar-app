<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Emploi du temps - {{ $class->name }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DejaVu Sans', Arial, sans-serif; font-size: 10px; }
        
        .header {
    text-align: center;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #007bff; 
    color: white;
    border: 1px solid #0056b3;
}
.header h1 {
    font-size: 16px;
    margin-bottom: 5px;
}
.header .info {
    font-size: 10px;
}

        
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        thead th {
            background-color: #6c757d;
            color: white;
            padding: 10px 5px;
            border: 1px solid #495057;
            font-size: 10px;
        }
        tbody td {
            padding: 8px 5px;
            border: 1px solid #dee2e6;
            vertical-align: top;
        }
        .day-cell {
            background-color: #f8f9fa;
            font-weight: bold;
            text-align: center;
            width: 12%;
        }
        .course-item {
            background: #e9ecef;
            padding: 6px;
            margin-bottom: 5px;
            border-left: 3px solid #007bff;
            font-size: 9px;
        }
        .course-item:last-child { margin-bottom: 0; }
        .time { font-weight: bold; color: #007bff; }
        .teacher { color: #6c757d; margin-top: 2px; }
        .classroom { color: #28a745; margin-top: 2px; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            margin-top: 3px;
        }
        .badge-primary { background: #007bff; color: white; }
        .badge-success { background: #28a745; color: white; }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #dee2e6;
            text-align: center;
            font-size: 8px;
            color: #6c757d;
        }
    </style>
</head>
<body>
   <div class="header">
    <h1>📅 EMPLOI DU TEMPS - {{ strtoupper($class->name) }}</h1>
    <div class="info">
        Période : {{ $startDate }} au {{ $endDate }} <br>
        Année académique : {{ $academicYear?->name ?? 'Non définie' }}
    </div>
</div>


    <table>
        <thead>
            <tr>
                <th>Jour</th>
                <th>Cours de la journée</th>
            </tr>
        </thead>
        <tbody>
            @php
                $days = [
                    1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi',
                    4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi', 7 => 'Dimanche'
                ];
                $grouped = $schedules->groupBy(function($s) {
                    return \Carbon\Carbon::parse($s->start_time)->dayOfWeek ?: 7;
                });
            @endphp

            @foreach($days as $num => $name)
                <tr>
                    <td class="day-cell">{{ $name }}</td>
                    <td>
                        @if(isset($grouped[$num]) && $grouped[$num]->count() > 0)
                            @foreach($grouped[$num]->sortBy('start_time') as $schedule)
                                <div class="course-item">
                                    <div class="time">
                                        {{ \Carbon\Carbon::parse($schedule->start_time)->format('H:i') }} - 
                                        {{ \Carbon\Carbon::parse($schedule->end_time)->format('H:i') }}
                                    </div>
                                    <div><strong>{{ $schedule->course?->name ?? 'Cours non défini' }}</strong></div>
                                    <div class="teacher">👤 {{ $schedule->teacher?->name ?? 'Non assigné' }}</div>
                                    <div class="classroom">🚪 {{ $schedule->classroom?->name ?? 'Non attribuée' }}</div>
                                   
                                </div>
                            @endforeach
                        @else
                            <em style="color: #6c757d;">Pas de cours</em>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>Document généré le {{ $generatedDate }}</p>
        <p>Total : {{ $schedules->count() }} séance(s) programmée(s)</p>
    </div>
</body>
</html>
