// Array untuk menyimpan data barang (sebagai database sementara)
let dataBarang = [
    { id: 1, nama: "Laptop Asus", kategori: "Elektronik", stok: 10 },
    { id: 2, nama: "Pulpen Snowman", kategori: "ATK", stok: 50 }
];

// Ambil elemen dari HTML
const formBarang = document.getElementById('form-barang');
const tabelBarang = document.querySelector('#tabel-barang tbody');

// Fungsi untuk menampilkan data ke tabel
function renderTabel() {
    tabelBarang.innerHTML = ''; // Kosongkan tabel dulu
    
    dataBarang.forEach((barang, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${barang.nama}</td>
            <td>${barang.kategori}</td>
            <td>${barang.stok}</td>
            <td><button class="btn-hapus" onclick="hapusBarang(${barang.id})">Hapus</button></td>
        `;
        tabelBarang.appendChild(tr);
    });
}

// Fungsi untuk menambah barang baru
formBarang.addEventListener('submit', function(e) {
    e.preventDefault(); // Mencegah form reload halaman

    const nama = document.getElementById('nama-barang').value;
    const stok = document.getElementById('stok-barang').value;
    const kategori = document.getElementById('kategori-barang').value;

    // Buat ID baru (ambil dari ID terakhir + 1)
    const idBaru = dataBarang.length > 0 ? dataBarang[dataBarang.length - 1].id + 1 : 1;

    // Masukkan data baru ke array
    dataBarang.push({
        id: idBaru,
        nama: nama,
        kategori: kategori,
        stok: parseInt(stok)
    });

    // Reset form
    formBarang.reset();

    // Tampilkan ulang tabel
    renderTabel();
    alert('Barang berhasil ditambahkan!');
});

// Fungsi untuk menghapus barang
function hapusBarang(id) {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        // Filter array untuk membuang barang dengan ID yang dipilih
        dataBarang = dataBarang.filter(barang => barang.id !== id);
        renderTabel();
    }
}

// Panggil fungsi render saat halaman pertama kali dibuka
renderTabel();