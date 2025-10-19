<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emploi du temps</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 25px;
            border-radius: 8px 8px 0 0;
            margin: -30px -30px 30px -30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .greeting {
            font-size: 18px;
            color: #555;
            margin-bottom: 20px;
        }
        .class-info {
            background-color: #e8f5e9;
            border-left: 4px solid #4caf50;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .stats {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
            flex-wrap: wrap;
        }
        .stat-item {
            text-align: center;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            min-width: 120px;
            margin: 10px;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            color: #11998e;
            display: block;
        }
        .stat-label {
            color: #666;
            font-size: 13px;
            margin-top: 5px;
        }
        .schedule-day {
            margin: 25px 0;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .day-header {
            background-color: #11998e;
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            font-size: 16px;
        }
        .course-item {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: start;
        }
        .course-item:last-child {
            border-bottom: none;
        }
        .course-time {
            background-color: #11998e;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: bold;
            min-width: 80px;
            text-align: center;
            margin-right: 15px;
        }
        .course-details {
            flex: 1;
        }
        .course-name {
            font-weight: bold;
            font-size: 16px;
            color: #333;
            margin-bottom: 5px;
        }
        .course-info {
            color: #666;
            font-size: 14px;
        }
        .course-stats {
            margin: 25px 0;
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .course-stats h3 {
            color: #11998e;
            margin-top: 0;
        }
        .course-stat-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .course-stat-row:last-child {
            border-bottom: none;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 8px;
        }
        .badge-success {
            background-color: #d4edda;
            color: #155724;
        }
        .badge-primary {
            background-color: #cce5ff;
            color: #004085;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
        .custom-message {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 15px;
            }
            .stats {
                flex-direction: column;
            }
            .stat-item {
                margin: 5px 0;
            }
            .course-item {
                flex-direction: column;
            }
            .course-time {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Emploi du Temps</h1>
            <h2 style="margin: 10px 0; font-size: 20px;">{{ $class->name }}</h2>
            <p>Du {{ $startDate }} au {{ $endDate }}</p>
        </div>

        <p class="greeting">Bonjour <strong>{{ $student->name }}</strong>,</p>

        @if($customMessage)
        <div class="custom-message">
            <strong>📢 Message :</strong><br>
            {{ $customMessage }}
        </div>
        @endif

        <div class="class-info">
            <strong>🎓 Informations de votre classe :</strong><br>
            <strong>Classe :</strong> {{ $class->name }}<br>
            <strong>Année académique :</strong> {{ $class->academicYear->name ?? 'N/A' }}<br>
            @if($class->level)
            <strong>Niveau :</strong> {{ $class->level }}
            @endif
        </div>

        <div class="stats">
            <div class="stat-item">
                <span class="stat-number">{{ count($schedules) }}</span>
                <span class="stat-label">Séances</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">{{ number_format($totalHours, 1) }}h</span>
                <span class="stat-label">Volume horaire</span>
            </div>
            <div class="stat-item">
                <span class="stat-number">{{ count($courseStats) }}</span>
                <span class="stat-label">Matières</span>
            </div>
        </div>

        <h2 style="color: #11998e; margin-top: 30px;">Planning de la semaine</h2>

        @foreach($schedulesByDay as $day => $data)
            @if(count($data['schedules']) > 0)
            <div class="schedule-day">
                <div class="day-header">
                    {{ $data['name'] }} 
                    <span class="badge badge-primary">{{ count($data['schedules']) }} cours</span>
                </div>
               @foreach(collect($data['schedules'])->sortBy('start_time') as $schedule)
                <div class="course-item">
                    <div class="course-time">
                        {{ \Carbon\Carbon::parse($schedule->start_time)->format('H:i') }}<br>
                        <small style="font-size: 11px;">{{ \Carbon\Carbon::parse($schedule->end_time)->format('H:i') }}</small>
                    </div>
                    <div class="course-details">
                        <div class="course-name">
                            📖 {{ $schedule->course->name ?? 'Cours' }}
                            @if($schedule->status === 'completed')
                                <span class="badge badge-success">Terminé</span>
                            @endif
                        </div>
                        <div class="course-info">
                            👨‍🏫 <strong>Enseignant :</strong> {{ $schedule->teacher->name ?? 'N/A' }} |
                            🚪 <strong>Salle :</strong> {{ $schedule->classroom->name ?? 'N/A' }}
                        </div>
                        @if($schedule->notes)
                        <div class="course-info" style="margin-top: 5px; font-style: italic;">
                            📝 {{ $schedule->notes }}
                        </div>
                        @endif
                    </div>
                </div>
                @endforeach
            </div>
            @endif
        @endforeach

        <div class="course-stats">
            <h3>📊 Répartition par matière</h3>
            @foreach($courseStats as $courseName => $stats)
            <div class="course-stat-row">
                <span><strong>{{ $courseName }}</strong></span>
                <span>
                    {{ $stats['count'] }} séance(s) • {{ number_format($stats['hours'], 1) }}h
                </span>
            </div>
            @endforeach
        </div>

        <div class="footer">
            <p>
                <strong>📎 Document PDF joint</strong><br>
                Un fichier PDF contenant l'emploi du temps complet est joint à cet email.
            </p>
          
        </div>
    </div>
</body>
</html>