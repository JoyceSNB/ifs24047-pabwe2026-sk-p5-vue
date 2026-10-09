<script setup>
import { RouterView } from "vue-router";
import { Gavel } from "lucide-vue-next";
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-white">
    <aside
      class="hidden lg:flex flex-col justify-between bg-indigo-950 text-indigo-50 p-12"
      data-testid="auth-banner"
    >
      <p class="flex items-center gap-3 text-xl font-bold">
        <Gavel class="size-8 text-amber-400" aria-hidden="true" />
        Delcom Auction
      </p>
      <div>
        <p class="text-5xl font-extrabold leading-tight tracking-tight">
          Sekali ketuk,<br />barang berpindah tangan.
        </p>
        <p class="mt-6 max-w-md text-lg text-indigo-100">
          Pasang barang, pantau penawaran masuk, dan menangkan lelang dengan
          harga terbaik.
        </p>
      </div>
      <p class="text-sm text-indigo-200">Praktikum PABWE 2026</p>
    </aside>

    <main id="main" class="flex items-center justify-center p-6 sm:p-12">
      <div class="w-full max-w-md">
        <p class="lg:hidden mb-8 flex items-center gap-2 text-lg font-bold text-indigo-950">
          <Gavel class="size-6 text-amber-700" aria-hidden="true" />
          Delcom Auction
        </p>
        <RouterView />
      </div>
    </main>
  </div>
</template>
