import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  ArrowRight,
  Calendar,
  Images as ImagesIcon,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Star,
} from 'lucide-react';
import { AlbumModal } from './components/AlbumModal';
import { AuthScreen } from './components/AuthScreen';
import { CategoriesView } from './components/CategoriesView';
import { GalleryView } from './components/GalleryView';
import { HeroBanner } from './components/HeroBanner';
import { MemoryCard } from './components/MemoryCard';
import { MemoryDetailModal } from './components/MemoryDetailModal';
import { MemoryEditorModal } from './components/MemoryEditorModal';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { StatsView } from './components/StatsView';
import { StoriesView } from './components/StoriesView';
import { TimelineRail } from './components/TimelineRail';
import { TimelineView } from './components/TimelineView';
import { TopBar } from './components/TopBar';
import { auth, googleProvider } from './lib/firebase';
import {
  createAlbum,
  createMemory,
  deleteAlbum,
  deleteMemory,
  ensureUserProfileAndSeed,
  subscribeAlbums,
  subscribeMemories,
  subscribeUserProfile,
  toggleFavoriteMemory,
  updateMemory,
  updateUserProfile,
} from './lib/memoriaService';
import { formatIndonesianDate, MEMORY_CATEGORIES } from './lib/validation';
import {
  Album,
  Memory,
  MemoryCategory,
  MemoryInput,
  NavSection,
  ReminderFrequency,
  UserProfile,
} from './types/memoria';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<NavSection>('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const [homeCategory, setHomeCategory] = useState<'Semua' | MemoryCategory>('Semua');
  const [galleryMode, setGalleryMode] = useState<'grid' | 'list'>('grid');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [detailMemory, setDetailMemory] = useState<Memory | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (nextUser) {
        try {
          await ensureUserProfileAndSeed(nextUser);
        } catch (err) {
          setDataError(
            err instanceof Error ? err.message : 'Gagal menyiapkan profil pengguna.'
          );
        }
      } else {
        setProfile(null);
        setMemories([]);
        setAlbums([]);
        setDataLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    setDataLoading(true);
    setDataError(null);

    const unsubProfile = subscribeUserProfile(
      user.uid,
      (p) => setProfile(p),
      (err) => setDataError(err.message)
    );

    const unsubMemories = subscribeMemories(
      user.uid,
      (items) => {
        setMemories(items);
        setDataLoading(false);
      },
      (err) => {
        setDataError(err.message);
        setDataLoading(false);
      }
    );

    const unsubAlbums = subscribeAlbums(
      user.uid,
      (items) => setAlbums(items),
      (err) => setDataError(err.message)
    );

    return () => {
      unsubProfile();
      unsubMemories();
      unsubAlbums();
    };
  }, [authReady, user]);

  // Keep detail modal synchronized with real-time updates
  useEffect(() => {
    if (!detailMemory) return;
    const updated = memories.find((m) => m.id === detailMemory.id);
    if (updated) {
      setDetailMemory(updated);
    }
  }, [memories, detailMemory]);

  const handleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Gagal masuk dengan Google. Silakan coba lagi.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSaveMemory = async (input: MemoryInput, editingId?: string) => {
    if (!user) return;
    if (editingId) {
      await updateMemory(editingId, input);
    } else {
      await createMemory(user.uid, input);
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    await deleteMemory(memoryId);
  };

  const handleToggleFavorite = async (memory: Memory) => {
    await toggleFavoriteMemory(memory.id, !memory.isFavorite);
  };

  const handleUpdateTitleSubtitle = async (journalTitle: string, journalSubtitle: string) => {
    if (!user) return;
    await updateUserProfile(user.uid, {
      journalTitle,
      journalSubtitle,
      quote: profile?.quote || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.',
      reminderFrequency: profile?.reminderFrequency || 'weekly',
    });
  };

  const handleSaveProfileSettings = async (settings: {
    journalTitle: string;
    journalSubtitle: string;
    quote: string;
    reminderFrequency: ReminderFrequency;
  }) => {
    if (!user) return;
    await updateUserProfile(user.uid, settings);
  };

  const handleCreateAlbum = async (input: {
    name: string;
    description: string;
    categoryFilter: 'Semua' | MemoryCategory;
    yearFilter: number;
    coverPhoto: string;
  }) => {
    if (!user) return;
    await createAlbum(user.uid, input);
  };

  const filteredMemories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return memories;
    return memories.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.story.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.date.includes(q)
    );
  }, [memories, searchQuery]);

  const homeGalleryMemories = useMemo(() => {
    if (homeCategory === 'Semua') return filteredMemories;
    return filteredMemories.filter((m) => m.category === homeCategory);
  }, [filteredMemories, homeCategory]);

  const homeGalleryPhotos = useMemo(() => {
    const items: { src: string; memory: Memory; photoIndex: number }[] = [];
    homeGalleryMemories.forEach((m) => {
      (m.photos || []).forEach((src, idx) => {
        items.push({ src, memory: m, photoIndex: idx });
      });
    });
    return items;
  }, [homeGalleryMemories]);

  // Deterministic throwback reminder selection based on current day/week
  const throwbackMemories = useMemo(() => {
    if (memories.length === 0 || profile?.reminderFrequency === 'off') return [];
    const now = new Date();
    const daySeed =
      profile?.reminderFrequency === 'daily'
        ? now.getFullYear() * 366 + now.getMonth() * 31 + now.getDate()
        : now.getFullYear() * 53 + Math.floor((now.getTime() / (1000 * 60 * 60 * 24 * 7)) % 53);

    const sortedOldestFirst = memories
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));

    const first = sortedOldestFirst[daySeed % sortedOldestFirst.length];
    const second =
      sortedOldestFirst.length > 1
        ? sortedOldestFirst[(daySeed + 1) % sortedOldestFirst.length]
        : null;
    return second && second.id !== first.id ? [first, second] : [first];
  }, [memories, profile?.reminderFrequency]);

  const totalPhotos = useMemo(
    () => memories.reduce((sum, m) => sum + (m.photos?.length || 0), 0),
    [memories]
  );

  const availableYears = useMemo(() => {
    const yrs = new Set<number>();
    memories.forEach((m) => yrs.add(m.year || Number(m.date.slice(0, 4))));
    return Array.from(yrs).sort((a, b) => b - a);
  }, [memories]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#4E556F]">
          <Loader2 className="w-7 h-7 animate-spin text-[#4F5BD5]" />
          <p className="text-sm font-medium">Menyiapkan ruang kenangan MEMORIA...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen
        onSignIn={handleSignIn}
        loading={authLoading}
        error={authError}
      />
    );
  }

  const recentMemories = filteredMemories.slice(0, 3);
  const featuredThrowback = throwbackMemories[0] || null;

  return (
    <div className="min-h-screen bg-[#F6F7FB] text-[#171A2E] flex">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onNewMemory={() => {
          setEditingMemory(null);
          setEditorOpen(true);
        }}
        quote={profile?.quote || 'Simpan cerita, abadikan momen, kenang sepanjang waktu.'}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          activeSection={activeSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          throwbackMemories={throwbackMemories}
          onOpenMemory={(mem) => {
            setDetailPhotoIndex(0);
            setDetailMemory(mem);
          }}
          onOpenSettings={() => setActiveSection('pengaturan')}
          onSignOut={handleSignOut}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          profile={profile}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {dataError && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs"
            >
              Terjadi kendala saat menyinkronkan data: {dataError}
            </div>
          )}

          {dataLoading ? (
            <div className="bg-white rounded-2xl border border-[#E6E8F0] p-16 flex flex-col items-center justify-center gap-3 text-[#646B84]">
              <Loader2 className="w-7 h-7 animate-spin text-[#4F5BD5]" />
              <p className="text-sm font-medium">Memuat kenangan pribadi Anda...</p>
            </div>
          ) : (
            <>
              {activeSection === 'beranda' && (
                <div className="space-y-6">
                  {/* Top Panoramic Hero */}
                  <HeroBanner
                    profile={profile}
                    totalMemories={memories.length}
                    totalPhotos={totalPhotos}
                    totalStories={memories.length}
                    onNewMemory={() => {
                      setEditingMemory(null);
                      setEditorOpen(true);
                    }}
                    onUpdateTitle={handleUpdateTitleSubtitle}
                  />

                  {/* Throwback Reminder Banner */}
                  {featuredThrowback && profile?.reminderFrequency !== 'off' && (
                    <section className="bg-white rounded-2xl border border-[#E6E8F0] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#ECEFF8] shrink-0">
                          {featuredThrowback.photos[0] ? (
                            <img
                              src={featuredThrowback.photos[0]}
                              alt={featuredThrowback.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#D97706]">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>
                              Kilas Balik{' '}
                              {profile?.reminderFrequency === 'daily' ? 'Hari Ini' : 'Minggu Ini'}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#171A2E] truncate mt-0.5">
                            {featuredThrowback.title}
                          </p>
                          <p className="text-xs text-[#646B84] truncate tabular-nums">
                            {formatIndonesianDate(featuredThrowback.date)} ·{' '}
                            {featuredThrowback.location}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setDetailPhotoIndex(0);
                          setDetailMemory(featuredThrowback);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FEF3C7]/70 hover:bg-[#FEF3C7] text-[#92400E] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Kenang Kembali</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </section>
                  )}

                  {/* Main Split: Content + Timeline Right Rail */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    <div className="xl:col-span-9 space-y-8">
                      {/* Kenangan Terbaru */}
                      <section>
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-[#D97706] fill-current" />
                            <h2 className="text-lg font-semibold text-[#171A2E]">
                              Kenangan Terbaru
                            </h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSection('timeline')}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#4F5BD5] hover:underline cursor-pointer whitespace-nowrap"
                          >
                            <span>Lihat Semua</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {recentMemories.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-[#E6E8F0] p-10 text-center">
                            <p className="font-display text-lg font-semibold text-[#171A2E]">
                              {searchQuery
                                ? 'Tidak ada kenangan yang cocok dengan pencarian Anda'
                                : 'Mulai Simpan Kenangan Pertama Anda'}
                            </p>
                            <p className="mt-1 text-xs text-[#646B84] mb-4">
                              {searchQuery
                                ? 'Coba kata kunci lain atau hapus filter pencarian.'
                                : 'Unggah foto favorit dan tulis cerita berkesan hari ini.'}
                            </p>
                            {!searchQuery && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMemory(null);
                                  setEditorOpen(true);
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E2342] text-white text-xs font-semibold cursor-pointer"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Tambah Kenangan</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {recentMemories.map((mem) => (
                              <MemoryCard
                                key={mem.id}
                                memory={mem}
                                onOpen={(m) => {
                                  setDetailPhotoIndex(0);
                                  setDetailMemory(m);
                                }}
                                onToggleFavorite={handleToggleFavorite}
                              />
                            ))}
                          </div>
                        )}
                      </section>

                      {/* Galeri Kenangan */}
                      <section>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <ImagesIcon className="w-4 h-4 text-[#4F5BD5]" />
                            <h2 className="text-lg font-semibold text-[#171A2E]">
                              Galeri Kenangan
                            </h2>
                          </div>

                          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-[#E6E8F0] self-start sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setGalleryMode('grid')}
                              aria-label="Tampilan grid"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                galleryMode === 'grid'
                                  ? 'bg-[#4F5BD5]/12 text-[#4F5BD5]'
                                  : 'text-[#646B84] hover:text-[#171A2E]'
                              }`}
                            >
                              <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setGalleryMode('list')}
                              aria-label="Tampilan daftar"
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                galleryMode === 'list'
                                  ? 'bg-[#4F5BD5]/12 text-[#4F5BD5]'
                                  : 'text-[#646B84] hover:text-[#171A2E]'
                              }`}
                            >
                              <List className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Category Filter Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
                          {(['Semua', ...MEMORY_CATEGORIES] as const).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setHomeCategory(cat)}
                              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                                homeCategory === cat
                                  ? 'bg-[#4F5BD5] text-white'
                                  : 'bg-white border border-[#E6E8F0] text-[#4E556F] hover:text-[#171A2E]'
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {homeGalleryPhotos.length === 0 ? (
                          <div className="bg-white rounded-2xl border border-[#E6E8F0] p-10 text-center text-xs text-[#646B84]">
                            Belum ada foto untuk kategori ini.
                          </div>
                        ) : galleryMode === 'grid' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {homeGalleryPhotos.map((item, idx) => (
                              <button
                                key={`${item.memory.id}-gal-${idx}`}
                                type="button"
                                onClick={() => {
                                  setDetailPhotoIndex(item.photoIndex);
                                  setDetailMemory(item.memory);
                                }}
                                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#ECEFF8] border border-[#E6E8F0] text-left cursor-pointer"
                              >
                                <img
                                  src={item.src}
                                  alt={item.memory.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                                  <p className="text-xs font-semibold truncate">
                                    {item.memory.title}
                                  </p>
                                  <p className="text-[11px] text-white/80 tabular-nums truncate">
                                    {formatIndonesianDate(item.memory.date)}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white rounded-2xl border border-[#E6E8F0] divide-y divide-[#F0F2F8]">
                            {homeGalleryMemories.map((mem) => (
                              <button
                                key={mem.id}
                                type="button"
                                onClick={() => {
                                  setDetailPhotoIndex(0);
                                  setDetailMemory(mem);
                                }}
                                className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#F9FAFD] transition-colors cursor-pointer"
                              >
                                <div className="w-16 h-12 rounded-xl overflow-hidden bg-[#ECEFF8] shrink-0">
                                  {mem.photos[0] ? (
                                    <img
                                      src={mem.photos[0]}
                                      alt={mem.title}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-[#171A2E] truncate">
                                    {mem.title}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-[#646B84] mt-0.5">
                                    <span className="font-medium text-[#4F5BD5]">
                                      {mem.category}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="inline-flex items-center gap-1 tabular-nums">
                                      <Calendar className="w-3 h-3" />
                                      {formatIndonesianDate(mem.date)}
                                    </span>
                                    <span aria-hidden="true">·</span>
                                    <span className="inline-flex items-center gap-1 truncate">
                                      <MapPin className="w-3 h-3 shrink-0" />
                                      {mem.location}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-mono text-xs tabular-nums text-[#646B84] shrink-0">
                                  {mem.photos.length} foto
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>

                    {/* Right Rail: Timeline Perjalanan Hidup */}
                    <div className="xl:col-span-3">
                      <TimelineRail
                        memories={memories}
                        onOpenMemory={(m) => {
                          setDetailPhotoIndex(0);
                          setDetailMemory(m);
                        }}
                        onViewAllTimeline={() => setActiveSection('timeline')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'timeline' && (
                <TimelineView
                  memories={filteredMemories}
                  onOpenMemory={(m) => {
                    setDetailPhotoIndex(0);
                    setDetailMemory(m);
                  }}
                  onEditMemory={(m) => {
                    setEditingMemory(m);
                    setEditorOpen(true);
                  }}
                  onNewMemory={() => {
                    setEditingMemory(null);
                    setEditorOpen(true);
                  }}
                />
              )}

              {activeSection === 'galeri' && (
                <GalleryView
                  memories={filteredMemories}
                  albums={albums}
                  onOpenPhotoMemory={(m, idx) => {
                    setDetailPhotoIndex(idx);
                    setDetailMemory(m);
                  }}
                  onOpenNewAlbum={() => setAlbumModalOpen(true)}
                  onDeleteAlbum={deleteAlbum}
                />
              )}

              {activeSection === 'cerita' && (
                <StoriesView
                  memories={filteredMemories}
                  onEditMemory={(m) => {
                    setEditingMemory(m);
                    setEditorOpen(true);
                  }}
                  onToggleFavorite={handleToggleFavorite}
                  onNewMemory={() => {
                    setEditingMemory(null);
                    setEditorOpen(true);
                  }}
                />
              )}

              {activeSection === 'kategori' && (
                <CategoriesView
                  memories={memories}
                  albums={albums}
                  onSelectCategory={(cat) => {
                    setHomeCategory(cat);
                    setActiveSection('beranda');
                  }}
                  onOpenNewAlbum={() => setAlbumModalOpen(true)}
                />
              )}

              {activeSection === 'statistik' && <StatsView memories={memories} />}

              {activeSection === 'pengaturan' && (
                <SettingsView
                  profile={profile}
                  memories={memories}
                  onSaveProfile={handleSaveProfileSettings}
                  onSignOut={handleSignOut}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <MemoryEditorModal
        open={editorOpen}
        initialMemory={editingMemory}
        onClose={() => {
          setEditorOpen(false);
          setEditingMemory(null);
        }}
        onSave={handleSaveMemory}
      />

      <MemoryDetailModal
        memory={detailMemory}
        initialPhotoIndex={detailPhotoIndex}
        onClose={() => setDetailMemory(null)}
        onEdit={(mem) => {
          setEditingMemory(mem);
          setEditorOpen(true);
        }}
        onDelete={handleDeleteMemory}
        onToggleFavorite={handleToggleFavorite}
      />

      <AlbumModal
        open={albumModalOpen}
        availableYears={availableYears}
        defaultCoverPhoto={memories.find((m) => m.photos?.length > 0)?.photos[0] || ''}
        onClose={() => setAlbumModalOpen(false)}
        onCreate={handleCreateAlbum}
      />
    </div>
  );
}
