// Smoke test: entry wiki (src/wiki/wiki.js) harus bisa di-load tanpa error (urutan import + circular import aman).
import './env-setup.mjs';
try {
    await import('../src/wiki/wiki.js');
    console.log('WIKI IMPORT SUKSES');
    process.exit(0);
} catch (e) {
    console.error('WIKI IMPORT GAGAL:', e.message);
    console.error(e.stack.split('\n').slice(0, 8).join('\n'));
    process.exit(1);
}
