<template>
  <div
    class="min-h-screen bg-slate-100 flex items-center justify-center p-4"
  >
    <div
      class="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200"
    >
      <!-- Banner -->
      <section
        class="hidden lg:flex bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700 text-white p-10 flex-col justify-between"
      >
        <div>
          <div
            class="w-12 h-12 rounded-2xl bg-white text-indigo-700 flex items-center justify-center shadow-sm text-xl font-black"
            aria-label="Delcom Auction"
          >
            DA
          </div>

          <p
            class="mt-6 text-sm font-semibold uppercase tracking-wider text-white/70"
          >
            Praktikum 5 PABWE
          </p>

          <h1
            class="mt-3 text-4xl font-extrabold leading-tight"
          >
            Delcom Auction
          </h1>

          <p
            class="mt-4 text-white/80 leading-relaxed"
          >
            Platform lelang untuk menemukan
            barang menarik dan memberikan
            tawaran terbaik.
          </p>
        </div>

        <div
          class="text-sm text-white/60"
        >
          © 2026 Delcom Auction
        </div>
      </section>

      <!-- Form -->
      <main
        class="p-6 sm:p-8 lg:p-10 flex items-center"
      >
        <div
          class="w-full max-w-md mx-auto"
        >
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import {
  RouterView,
} from "vue-router";
</script>