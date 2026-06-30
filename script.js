let wordList = [];
let filteredWords = [];
let currentPage = 1;
const itemsPerPage = 50; // Tampilkan 50 kata per halaman
let currentMode = 'awalan';

const searchInput = document.getElementById('search-input');
const resultsList = document.getElementById('results-list');
const resultCount = document.getElementById('result-count');
const pageInfo = document.getElementById('page-info');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const tabs = document.querySelectorAll('.tab');
const clearBtn = document.getElementById('clear-btn');

// 1. Ambil Data TXT dan Suntikkan Kata Tambahan
const kataSpesial = [
    // --- ISTILAH MEDIS & PENYAKIT (SUPER PANJANG) ---
    "pneumonoultramikroskopiksilikovolkanokoniosis", // Penyakit paru-paru debu vulkanik (45 huruf!)
    "otorinolaringologi", // Ilmu kedokteran THT
    "elektroensefalografi", // Perekam aktivitas listrik otak
    "sternokleidomastoid", // Otot besar di bagian leher
    "kardiomiopati", // Penyakit otot jantung
    "hiperkolesterolemia", // Kolesterol tinggi

    // --- ISTILAH YUNANI (SAINS, FILSAFAT, MITOLOGI) ---
    "paraskavedekatriafobia", // Fobia pada hari Jumat tanggal 13 (dari Yunani)
    "heksakosioiheksekontaheksafobia", // Fobia pada angka 666 (dari Yunani)
    "antropomorfisme", // Memberikan sifat manusia pada hewan/benda
    "krisoelefantin", // Teknik patung emas & gading Yunani kuno
    "misantropi", // Kebencian terhadap umat manusia
    "prometeus", // Dewa Titan pencuri api

    // --- KATA EKSTRA PANJANG (BAHASA INDONESIA) ---
    "ketidakberperikemanusiaan",
    "mempertanggungjawabkannya",
    "ketidakseimbangannya",
    "keanekaragamanhayati"
];

fetch('all_entries_v6.1.0.txt')
    .then(response => response.text())
    .then(data => {
        // Ambil data dari file TXT
        let arrayDariFile = data.split('\n');
        
        // Gabungkan data file dengan kataSpesial milik kita
        let gabunganKata = [...arrayDariFile, ...kataSpesial];
        
        // Bersihkan dan saring hanya yang huruf a-z (tanpa spasi/simbol)
        let kataTersaring = gabunganKata
            .map(kata => kata.trim().toLowerCase())
            .filter(kata => kata.length > 0 && /^[a-z]+$/.test(kata));
            
        // Gunakan Set untuk membuang kata yang duplikat (kalau ternyata sudah ada di KBBI), lalu ubah ke Array lagi
        wordList = Array.from(new Set(kataTersaring));
        
        searchInput.placeholder = `Siap! Tersedia ${wordList.length.toLocaleString('id-ID')} kata...`;
    })
    .catch(error => {
        console.error('Error:', error);
        searchInput.placeholder = "Gagal memuat file teks.";
    });

// 2. Logika Filter Kata
function filterWords() {
    let query = searchInput.value.trim().toLowerCase();
    
    // Kalau input kosong, kosongkan list
    if (!query) {
        filteredWords = [];
        currentPage = 1;
        renderResults();
        return;
    }

    filteredWords = wordList.filter(kata => {
        if (currentMode === 'awalan') {
            return kata.startsWith(query);
        } else if (currentMode === 'akhiran') {
            return kata.endsWith(query);
        } else if (currentMode === 'awalakhir') {
            // Mode Awal+Akhir (misal ngetik 'fk', dicari awalan f, akhiran k)
            if (query.length === 1) {
                return kata.startsWith(query) && kata.endsWith(query);
            }
            let hurufAwal = query[0];
            let hurufAkhir = query[query.length - 1];
            return kata.startsWith(hurufAwal) && kata.endsWith(hurufAkhir);
        }
    });

    currentPage = 1; // Reset halaman ke 1 setiap mencari kata baru
    renderResults();
}

// 3. Menampilkan Hasil ke Layar
function renderResults() {
    resultsList.innerHTML = '';
    resultCount.innerText = `${filteredWords.length.toLocaleString('id-ID')} ditemukan`;

    if (filteredWords.length === 0) {
        pageInfo.innerText = "0 / 0";
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    let totalPages = Math.ceil(filteredWords.length / itemsPerPage);
    pageInfo.innerText = `${currentPage} / ${totalPages}`;
    
    // Aktifkan/Matikan tombol next prev
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Ambil sebagian kata sesuai halaman (Slice)
    let startIdx = (currentPage - 1) * itemsPerPage;
    let endIdx = startIdx + itemsPerPage;
    let itemsToDisplay = filteredWords.slice(startIdx, endIdx);

    itemsToDisplay.forEach((kata, index) => {
        const li = document.createElement('li');
        
        // Buat Nomor
        const spanNum = document.createElement('span');
        spanNum.className = 'num';
        spanNum.innerText = startIdx + index + 1;

        // Buat Teks Kata beserta Highlight Oranye
        const spanWord = document.createElement('span');
        let query = searchInput.value.trim().toLowerCase();
        
if (currentMode === 'awalan') {
            spanWord.innerHTML = `<span class="highlight">${kata.substring(0, query.length)}</span><span style="color: #e2e8f0;">${kata.substring(query.length)}</span>`;
        } else if (currentMode === 'akhiran') {
            let cutPos = kata.length - query.length;
            spanWord.innerHTML = `<span style="color: #e2e8f0;">${kata.substring(0, cutPos)}</span><span class="highlight">${kata.substring(cutPos)}</span>`;
        } else {
            spanWord.innerText = kata;
            spanWord.style.color = '#e2e8f0';
        }

        li.appendChild(spanNum);
        li.appendChild(spanWord);
        resultsList.appendChild(li);
    });
}

// 4. Event Listener (Tombol dan Ketikan)
searchInput.addEventListener('input', filterWords);

clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    filterWords();
    searchInput.focus();
});

// Pindah-pindah Tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Hapus warna aktif di semua tab
        tabs.forEach(t => t.classList.remove('active'));
        // Beri warna aktif di tab yang di klik
        tab.classList.add('active');
        
        currentMode = tab.dataset.mode;
        filterWords(); // Filter ulang otomatis saat ganti mode
        searchInput.focus();
    });
});

// Tombol Next & Prev
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderResults();
    }
});

nextBtn.addEventListener('click', () => {
    let totalPages = Math.ceil(filteredWords.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderResults();
    }
});