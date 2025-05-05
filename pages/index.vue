<template>
  <div class="home-page">
    <!-- Featured Section -->
    <section class="featured-section mb-5">
      <h2 class="mb-4">Good evening</h2>
      <div class="row g-3">
        <div v-for="playlist in featuredPlaylists" :key="playlist.id" class="col-12 col-md-6 col-lg-4 col-xl-3">
          <div class="featured-card d-flex align-items-center bg-dark-subtle rounded overflow-hidden">
            <img :src="playlist.imageUrl" :alt="playlist.name" class="featured-image">
            <div class="p-3 flex-grow-1">
              <h5 class="mb-0">{{ playlist.name }}</h5>
            </div>
            <button class="play-button-overlay btn btn-success rounded-circle me-3">
              <i class="bi bi-play-fill fs-4"></i>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Made For You -->
    <section class="made-for-you mb-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Made for you</h2>
        <button class="btn btn-link text-white text-decoration-none">Show all</button>
      </div>
      <div class="row g-3">
        <div v-for="playlist in madeForYou" :key="playlist.id" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
          <div class="card bg-dark h-100 playlist-card">
            <div class="position-relative">
              <img :src="playlist.imageUrl" class="card-img-top" :alt="playlist.name">
              <button class="play-button-overlay btn btn-success rounded-circle">
                <i class="bi bi-play-fill fs-4"></i>
              </button>
            </div>
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ playlist.name }}</h5>
              <p class="card-text text-muted">{{ playlist.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recently Played -->
    <section class="recently-played">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Recently played</h2>
        <button class="btn btn-link text-white text-decoration-none">Show all</button>
      </div>
      <div class="row g-3">
        <div v-for="track in recentlyPlayed" :key="track.id" class="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">
          <div class="card bg-dark h-100 playlist-card">
            <div class="position-relative">
              <img :src="track.imageUrl" class="card-img-top" :alt="track.name">
              <button class="play-button-overlay btn btn-success rounded-circle">
                <i class="bi bi-play-fill fs-4"></i>
              </button>
            </div>
            <div class="card-body">
              <h5 class="card-title text-truncate">{{ track.name }}</h5>
              <p class="card-text text-muted">{{ track.artist }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const featuredPlaylists = ref([
  {
    id: '1',
    name: 'Liked Songs',
    imageUrl: 'https://misc.scdn.co/liked-songs/liked-songs-640.png'
  },
  {
    id: '2',
    name: 'Daily Mix 1',
    imageUrl: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb1020c5e0e7da5a82a475e9dc/1/en/default'
  },
  {
    id: '3',
    name: 'Discover Weekly',
    imageUrl: 'https://newjams-images.scdn.co/image/ab676477000033ad/dt/v3/discover-weekly/aAbca4VNfzWuUCQ_FGiEFA==/dHB0cHRwdA=='
  }
])

const madeForYou = ref([
  {
    id: '1',
    name: 'Daily Mix 1',
    description: 'Lauv, Ed Sheeran, Justin Bieber and more',
    imageUrl: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb1020c5e0e7da5a82a475e9dc/1/en/default'
  },
  {
    id: '2',
    name: 'Discover Weekly',
    description: 'Your weekly mixtape of fresh music',
    imageUrl: 'https://newjams-images.scdn.co/image/ab676477000033ad/dt/v3/discover-weekly/aAbca4VNfzWuUCQ_FGiEFA==/dHB0cHRwdA=='
  }
])

const recentlyPlayed = ref([
  {
    id: '1',
    name: 'Shape of You',
    artist: 'Ed Sheeran',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'
  },
  {
    id: '2',
    name: 'Blinding Lights',
    artist: 'The Weeknd',
    imageUrl: 'https://i.scdn.co/image/ab67616d0000b273a6a2a27d9369a921d5bb5846'
  }
])
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.featured-card {
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
}

.featured-card:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.featured-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
}

.playlist-card {
  cursor: pointer;
  transition: background-color 0.3s;
}

.playlist-card:hover {
  background-color: #282828 !important;
}

.play-button-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.3s;
  background-color: #1DB954;
  width: 48px;
  height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featured-card:hover .play-button-overlay,
.playlist-card:hover .play-button-overlay {
  opacity: 1;
  transform: translateY(0);
}

.play-button-overlay:hover {
  transform: scale(1.1) !important;
  background-color: #1ed760 !important;
}

.card-img-top {
  aspect-ratio: 1;
  object-fit: cover;
}

h2 {
  font-size: 1.5rem;
  font-weight: 700;
}

.bg-dark-subtle {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style> 