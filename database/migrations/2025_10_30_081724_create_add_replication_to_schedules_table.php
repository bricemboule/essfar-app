<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('schedules', function (Blueprint $table) {
           
            $table->foreignId('parent_schedule_id')
                ->nullable()
                ->after('id')
                ->constrained('schedules')
                ->onDelete('cascade')
                ->comment('Planning parent si c\'est une réplication');

            $table->boolean('is_replicated')
                ->default(false)
                ->after('is_recurring')
                ->comment('Indique si ce planning est une réplication automatique');

            if (!Schema::hasColumn('schedules', 'completion_notes')) {
                $table->text('completion_notes')
                    ->nullable()
                    ->after('completed_hours')
                    ->comment('Notes lors de la complétion du cours');
            }

            // Index pour améliorer les performances
            $table->index('parent_schedule_id');
            $table->index(['course_id', 'school_class_id']);
        });
    }

    public function down()
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropForeign(['parent_schedule_id']);
            $table->dropColumn(['parent_schedule_id', 'is_replicated']);
            
            if (Schema::hasColumn('schedules', 'completion_notes')) {
                $table->dropColumn('completion_notes');
            }
        });
    }
};