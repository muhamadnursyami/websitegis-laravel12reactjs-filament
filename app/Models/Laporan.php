<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Laporan extends Model
{
    protected $fillable = [
        'category_id', 'nama', 'email', 'telepon', 'tanggal', 'waktu', 
        'kondisi', 'detail_lokasi', 'deskripsi_laporan', 'gambar', 'latitude', 
        'longitude', 'status'
    ];
    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'status' => 'boolean',
        'tanggal' => 'date',
    ];
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function scopeVerified($q)
    {
        return $q->where('status', true);
    }
}
