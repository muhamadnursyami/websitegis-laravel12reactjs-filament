<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('laporans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id');
            $table->string('nama')->nullable();
            $table->string('email')->nullable();
            $table->string('telepon')->nullable();
            $table->date('tanggal')->nullable();
            $table->time('waktu')->nullable();
            $table->string('kondisi')->nullable();
            $table->string('detail_lokasi')->nullable();
            $table->text('deskripsi_laporan')->nullable();
            $table->string('gambar')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->boolean('status')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laporans');
    }
};
