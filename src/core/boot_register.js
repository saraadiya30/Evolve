// Modul efek-samping: mengisi semua registry game saat dimuat. Dipakai sebagai import PERTAMA oleh entry yang modul-modulnya
// sudah memakai data terdaftar saat load (wiki). main.js memanggil registerAll() langsung di badan modulnya.
import { registerAll } from './register_all.js';

registerAll();
