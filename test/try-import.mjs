import './env-setup.mjs';
try {
    await import('../src/main.js');
    console.log('IMPORT SUKSES');
    process.exit(0); // ada setInterval version_check yg nyala pas import, sengaja dipaksa exit
} catch (e) {
    console.error('IMPORT GAGAL:', e.message);
    console.error(e.stack.split('\n').slice(0, 8).join('\n'));
    process.exit(1);
}
