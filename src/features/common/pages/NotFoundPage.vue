<script setup>
import { RouterLink } from "vue-router";
</script>

<template>
  <main id="main" class="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
    <p class="text-7xl font-extrabold text-indigo-950">404</p>
    <h1 class="mt-4 text-2xl font-bold text-slate-900">Halaman tidak ditemukan</h1>
    <p class="mt-2 max-w-md text-slate-700">
      Lelang atau halaman yang kamu cari sudah ditutup atau tidak pernah ada.
    </p>
    <RouterLink to="/" class="mt-8 rounded-lg bg-indigo-950 px-5 py-3 font-semibold text-white hover:bg-indigo-900">
      Kembali ke beranda
    </RouterLink>
  </main>
</template>
