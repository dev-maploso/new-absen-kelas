<script setup lang="ts">
const menu = [
  {
    title: "Input Absensi",
    description: "Input absensi mahasantri sesuai kelas yang diampu.",
    route: "/attendance",
    icon: "📝",
  },
  {
    title: "Profil",
    description: "Lihat informasi akun wali kelas.",
    route: "/profile",
    icon: "👤",
  },
];
</script>

<template>
  <div class="dashboard">
    <header class="header">
      <h1>Dashboard</h1>
      <p>Selamat datang di Aplikasi Wali Kelas.</p>
    </header>

    <section class="menu-grid">
      <RouterLink
        v-for="item in menu"
        :key="item.route"
        :to="item.route"
        class="menu-card"
      >
        <div class="icon">{{ item.icon }}</div>

        <h3>{{ item.title }}</h3>

        <p>{{ item.description }}</p>
      </RouterLink>
    </section>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px;
}

.header {
  margin-bottom: 28px;
}

.header h1 {
  margin: 0;
  font-size: 28px;
}

.header p {
  margin-top: 8px;
  color: #666;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 18px;
}

.menu-card {
  text-decoration: none;
  color: inherit;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #eee;
  transition: .2s;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
}

.icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.menu-card h3 {
  margin: 0;
}

.menu-card p {
  margin-top: 8px;
  color: #666;
}
</style>