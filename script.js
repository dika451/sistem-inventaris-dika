// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://jcltzkkonuhloykhlxun.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbHR6a2tvbnVobG95a2hseHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Njc5NjUsImV4cCI6MjEwODQ0Mzk2NX0.TAE91ZLnDx2ChiX1jr3KYGdyOKxVXChN2dQGRolPr40';

// Inisialisasi Supabase Client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LOGIKA AUTENTIKASI (LOGIN/LOGOUT) ---

// Cek status login saat halaman dimuat
async function cekSesiLogin() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        tampilkanDashboard();
    } else {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('dashboard-page').style.display = 'none';
    }
}

// Proses Login
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        alert('Login Gagal: ' + error.message);
    } else {
        tampilkanDashboard();
    }
});

// Proses Logout
async function logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        document.getElementById('login-page').style.display = 'flex';
        document.getElementById('dashboard-page').style.display = 'none';
    }
}

// Fungsi untuk menampilkan Dashboard
async function tampilkanDashboard() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('dashboard-page').style.display = 'flex'; // flex karena layout body pakai flex
    await initData(); // Ambil data setelah login
}


// --- LOGIKA CRUD BARANG ---

let dataBarang = [];
const formBarang = document.getElementById('form-barang');
const tabelBarang = document.querySelector('#tabel-barang tbody');
const inputSearch = document.getElementById('search-input');
const filterKategori = document.getElementById('filter-kategori');

async function ambilDataDariSupabase() {
    const { data, error } = await supabaseClient
        .from('barang')
        .select('*')
        .order('id', { ascending: true });
    
    if (error) {
        console.error('Error ambil data:', error);
        return [];
    }
    return data;
}

async function tambahKeSupabase(nama, kategori, stok) {
    const { error } = await supabaseClient
        .from('barang')
        .insert([{ nama, kategori, stok }]);
    
    if (error) {
        console.error(error);
        alert('Gagal menyimpan data!');
        return false;
    }
    return true;
}

async function updateKeSupabase(id, nama, kategori, stok) {
    const { error } = await supabaseClient
        .from('barang')
        .update({ nama, kategori, stok })
        .eq('id', id);
    
    if (error) {
        console.error(error);
        alert('Gagal mengupdate data!');
        return false;
    }
    return true;
}

async function hapusDariSupabase(id) {
    const { error } = await supabaseClient
        .from('barang')
        .delete()
        .eq('id', id);
    
    if (error) {
        console.error(error);
        alert('Gagal menghapus data!');
        return false;
    }
    return true;
}


// --- LOGIKA UI & RENDER ---

function formatAngka(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function renderTabel() {
    tabelBarang.innerHTML = ''; 
    const keyword = inputSearch.value.toLowerCase();
    const kategoriTerpilih = filterKategori.value;

    const dataTerfilter = dataBarang.filter(barang => {
        const cocokNama = barang.nama.toLowerCase().includes(keyword);
        const cocokKategori = kategoriTerpilih === 'Semua' || barang.kategori === kategoriTerpilih;
        return cocokNama && cocokKategori;
    });

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

function updateStatistik() {
    const totalBarang = dataBarang.length;
    const totalStok = dataBarang.reduce((total, b) => total + b.stok, 0);
    const stokMenipis = dataBarang.filter(b => b.stok < 5).length;

    document.getElementById('total-barang').innerText = totalBarang;
    document.getElementById('total-stok').innerText = formatAngka(totalStok);
    document.getElementById('stok-menipis').innerText = stokMenipis;
}

formBarang.addEventListener('submit', async function(e) {
    e.preventDefault();
    const idEdit = document.getElementById('edit-id').value;
    const nama = document.getElementById('nama-barang').value;
    const stok = parseInt(document.getElementById('stok-barang').value);
    const kategori = document.getElementById('kategori-barang').value;

    let berhasil = false;

    if (idEdit) {
        // Mode Edit
        berhasil = await updateKeSupabase(idEdit, nama, kategori, stok);
        if (berhasil) tampilkanToast('Data barang berhasil diperbarui!');
    } else {
        // Mode Tambah
        berhasil = await tambahKeSupabase(nama, kategori, stok);
        if (berhasil) tampilkanToast('Barang berhasil ditambahkan!');
    }
    
    if (berhasil) {
        resetForm();
        dataBarang = await ambilDataDariSupabase(); 
        renderTabel();
    }
});

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
        window.scrollTo(0, 0); // Scroll ke atas agar form terlihat
    }
}

function resetForm() {
    formBarang.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').innerText = "Tambah Barang Baru";
    document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-plus"></i> Tambah Barang';
    document.getElementById('btn-cancel').style.display = 'none';
}

async function hapusBarang(id) {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        const berhasil = await hapusDariSupabase(id);
        if (berhasil) {
            dataBarang = await ambilDataDariSupabase();
            renderTabel();
            tampilkanToast('Barang berhasil dihapus!');
        }
    }
}

function tampilkanToast(pesan) {
    const toast = document.getElementById('toast');
    toast.innerText = pesan;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

inputSearch.addEventListener('input', renderTabel);
filterKategori.addEventListener('change', renderTabel);

// Mulai aplikasi dengan mengecek sesi login
async function initData() {
    dataBarang = await ambilDataDariSupabase();
    renderTabel();
}

cekSesiLogin();