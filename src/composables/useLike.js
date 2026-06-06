import { ref } from 'vue'

const likedIds = ref(new Set(JSON.parse(localStorage.getItem('likedIds') || '[]')))
const likedSongs = ref([])

export function useLike() {
  function toggleLike(id, findSongById) {
    if (likedIds.value.has(id)) {
      likedIds.value.delete(id)
      likedSongs.value = likedSongs.value.filter(s => s.id !== id)
    } else {
      likedIds.value.add(id)
      if (findSongById) {
        const s = findSongById(id)
        if (s) likedSongs.value.push(normalizeSong(s))
      }
    }
    localStorage.setItem('likedIds', JSON.stringify([...likedIds.value]))
  }

  function normalizeSong(s) {
    return {
      id: s.id,
      name: s.name,
      ar: s.ar || s.artists,
      al: s.al || s.album,
      dt: s.dt || s.duration,
      picUrl: s.al?.picUrl || s.album?.picUrl || s.picUrl
    }
  }

  return { likedIds, likedSongs, toggleLike, normalizeSong }
}
