// Ambil data dari LocalStorage atau gunakan data awal jika kosong
let dataBarang = JSON.parse(localStorage.getItem('inventarisData')) || [
    { id: 1, nama: "Laptop Asus", kategori: "Elektronik", stok: 10 },
    { id: 2, nama: "Pulpen Snowman", kategori: "ATK", stok: 3 }
];

// Elemen DOM
const formBarang = document.getElementById('form-barang');
const tabelBarang = document.querySelector('#tabel-barang tbody');
const inputSearch = document.getElementById('search-input');
const filterKategori = document.getElementById('filter-kategori');

// Simpan ke LocalStorage
function simpanKeStorage() {
    localStorage.setItem('inventarisData', JSON.stringify(dataBarang));
}

// Format Rupiah / Angka
function formatAngka(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Render Tabel & Statistik
function renderTabel() {
    tabelBarang.innerHTML = ''; 
    
    // Ambil nilai pencarian dan filter
    const keyword = inputSearch.value.toLowerCase();
    const kategoriTerpilih = filterKategori.value;

    // Filter data
    const dataTerfilter = dataBarang.filter(barang => {
        const cocokNama = barang.nama.toLowerCase().includes(keyword);
        const cocokKategori = kategoriTerpilih === 'Semua' || barang.kategori === kategoriTerpilih;
        return cocokNama && cocokKategori;
    });

    // Render baris tabel
    if (dataTerfilter.length === 0) {
        tabelBarang.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: #6b7280;">Tidak ada data barang ditemukan.</td></tr>`;
    } else {
        dataTerfilter.forEach((barang, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td style="font-weight: 500;">${barang.nama}</td>
                <td><span class="badge ${barang.kategori}">${barang.kategori}</span></td>
                <td style="font-weight: ${barang.stok < 5 ? 'bold' : 'normal'}; color: ${barang.stok < 5 ? '#ef4444' : '#111827'};">
                    ${formatAngka(barang.stok)}
                </td>
                <td>
                    <button class="aksi-btn btn-edit" onclick="editBarang(${barang.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="aksi-btn btn-hapus" onclick="hapusBarang(${barang.id})"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tabelBarang.appendChild(tr);
        });
    }

    updateStatistik();
}

// Update Kartu Statistik
function updateStatistik() {
    const totalBarang = dataBarang.length;
    const totalStok = dataBarang.reduce((total, b) => total + b.stok, 0);
    const stokMenipis = dataBarang.filter(b => b.stok < 5).length;

    document.getElementById('total-barang').innerText = totalBarang;
    document.getElementById('total-stok').innerText = formatAngka(totalStok);
    document.getElementById('stok-menipis').innerText = stokMenipis;
}

// Tambah / Simpan Edit Barang
formBarang.addEventListener('submit', function(e) {
    e.preventDefault();

    const idEdit = document.getElementById('edit-id').value;
    const nama = document.getElementById('nama-barang').value;
    const stok = parseInt(document.getElementById('stok-barang').value);
    const kategori = document.getElementById('kategori-barang').value;

    if (idEdit) {
        // Mode Edit
        const index = dataBarang.findIndex(b => b.id == idEdit);
        dataBarang[index] = { id: parseInt(idEdit), nama, kategori, stok };
        tampilkanToast('Data barang berhasil diperbarui!');
        resetForm();
    } else {
        // Mode Tambah Baru
        const idBaru = dataBarang.length > 0 ? Math.max(...dataBarang.map(b => b.id)) + 1 : 1;
        dataBarang.push({ id: idBaru, nama, kategori, stok });
        tampilkanToast('Barang baru berhasil ditambahkan!');
        formBarang.reset();
    }

    simpanKeStorage();
    renderTabel();
});

// Edit Barang (Mengisi Form)
function editBarang(id) {
    const barang = dataBarang.find(b => b.id === id);
    if (barang) {
        document.getElementById('edit-id').value = barang.id;
        document.getElementById('nama-barang').value = barang.nama;
        document.getElementById('stok-barang').value = barang.stok;
        document.getElementById('kategori-barang').value = barang.kategori;
        
        document.getElementById('form-title').innerText = "Edit Data Barang";
        document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Simpan Perubahan';
        document.getElementById('btn-cancel').style.display = 'block';
    }
}

// Reset Form ke Mode Tambah
function resetForm() {
    formBarang.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').innerText = "Tambah Barang Baru";
    document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Barang';
    document.getElementById('btn-cancel').style.display = 'none';
}

// Hapus Barang
function hapusBarang(id) {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        dataBarang = dataBarang.filter(barang => barang.id !== id);
        simpanKeStorage();
        renderTabel();
        tampilkanToast('Barang berhasil dihapus!');
    }
}

// Toast Notifikasi
function tampilkanToast(pesan) {
    const toast = document.getElementById('toast');
    toast.innerText = pesan;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Event Listener untuk Pencarian & Filter
inputSearch.addEventListener('input', renderTabel);
filterKategori.addEventListener('change', renderTabel);

// Render pertama kali saat dibuka
renderTabel();
// Fungsi untuk navigasi antar menu
function gantiHalaman(namaHalaman, elemenMenu) {
    // 1. Ubah status aktif pada menu sidebar
    const semuaMenu = document.querySelectorAll('.menu li');
    semuaMenu.forEach(menu => menu.classList.remove('active'));
    elemenMenu.classList.add('active');

    // 2. Sembunyikan semua halaman
    document.getElementById('halaman-dashboard').style.display = 'none';
    document.getElementById('halaman-lain').style.display = 'none';

    // 3. Tampilkan halaman sesuai yang diklik
    if (namaHalaman === 'dashboard') {
        document.getElementById('halaman-dashboard').style.display = 'block';
    } else {
        document.getElementById('halaman-lain').style.display = 'block';
        document.getElementById('judul-halaman-lain').innerText = `Halaman ${namaHalaman.charAt(0).toUpperCase() + namaHalaman.slice(1)}`;
    }
}