<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable()->change();
            $table->foreignId('reply_id')->nullable()->after('post_id')->constrained()->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('likes', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable(false)->change();
            $table->dropColumn('reply_id');
        });
    }
};
