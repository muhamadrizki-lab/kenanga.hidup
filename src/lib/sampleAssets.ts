import heroSunriseImg from '../assets/images/hero_sunrise_peak_1794557102825.jpg';
import diengHikeImg from '../assets/images/memory_dieng_hike_1794557102915.jpg';
import engagementImg from '../assets/images/memory_engagement_moment_1794557103398.jpg';
import firstCarImg from '../assets/images/memory_first_car_journey_1794557103985.jpg';
import graduationImg from '../assets/images/memory_graduation_milestone_1794557104452.jpg';
import { MemoryCategory, MemoryMood } from '../types/memoria';

export const HERO_BANNER_IMAGE = heroSunriseImg;

export interface StarterMemorySeed {
  idSuffix: string;
  title: string;
  story: string;
  date: string;
  location: string;
  category: MemoryCategory;
  mood: MemoryMood;
  photos: string[];
  isMilestone: boolean;
  isFavorite: boolean;
}

export const STARTER_MEMORIES: StarterMemorySeed[] = [
  {
    idSuffix: 'dieng_2026',
    title: 'Pendakian ke Dieng',
    story:
      'Perjalanan seru ke Dataran Tinggi Dieng bersama sahabat terdekat. Kami mulai mendaki pukul tiga pagi menembus udara dingin 6 derajat Celsius, ditemani cahaya senter dan obrolan hangat di sepanjang jalur setapak.\n\nSaat matahari akhirnya terbit di balik barisan pegunungan dan kabut perlahan turun menyelimuti danau vulkanik, semua rasa lelah langsung terbayar. Momen ini mengingatkan betapa kecilnya kita di hadapan alam, dan betapa berharganya waktu bersama teman-teman seperjalanan.',
    date: '2026-10-12',
    location: 'Dataran Tinggi Dieng, Wonosobo',
    category: 'Pendakian',
    mood: 'Petualang',
    photos: [diengHikeImg, heroSunriseImg],
    isMilestone: true,
    isFavorite: true,
  },
  {
    idSuffix: 'lamaran_2026',
    title: 'Lamaran',
    story:
      'Hari paling membahagiakan saat melangkah menuju babak baru kehidupan bersama orang terkasih dan kedua keluarga besar. Persiapan yang penuh doa selama berbulan-bulan akhirnya terwujud dengan sederhana, hangat, dan penuh haru.\n\nDi taman kecil sore itu, diiringi bunga mawar putih dan senyuman keluarga, kami mengikat janji untuk saling menjaga dan tumbuh bersama di setiap musim kehidupan.',
    date: '2026-08-20',
    location: 'Bandung, Jawa Barat',
    category: 'Keluarga',
    mood: 'Haru',
    photos: [engagementImg],
    isMilestone: true,
    isFavorite: true,
  },
  {
    idSuffix: 'mobil_2026',
    title: 'Mobil Pertamaku',
    story:
      'Salah satu impian yang akhirnya tercapai setelah bertahun-tahun menabung, belajar, dan berdoa tanpa putus. Perjalanan perdana menyusuri jalan pesisir saat matahari terbenam terasa seperti perayaan kecil atas segala kerja keras selama ini.\n\nKendaraan ini bukan sekadar alat transportasi, tetapi saksi perjalanan menuju mimpi-mimpi keluarga berikutnya.',
    date: '2026-07-15',
    location: 'Pantai Selatan, Yogyakarta',
    category: 'Pencapaian',
    mood: 'Bangga',
    photos: [firstCarImg],
    isMilestone: true,
    isFavorite: false,
  },
  {
    idSuffix: 'wisuda_2021',
    title: 'Wisuda S1 Teknik Informatika',
    story:
      'Empat tahun penuh begadang mengerjakan tugas akhir, riset di perpustakaan, dan belajar membangun sistem dari nol akhirnya bermuara di halaman kampus yang rindang ini.\n\nMelihat senyum bangga orang tua saat toga dipindahkan menjadi salah satu kenangan paling berkesan yang selalu memacu semangat di dunia karier.',
    date: '2021-03-28',
    location: 'Depok, Jawa Barat',
    category: 'Karier',
    mood: 'Bersyukur',
    photos: [graduationImg],
    isMilestone: true,
    isFavorite: true,
  },
];
