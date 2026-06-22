import Conversation from "../models/conversation.model.js";

// 📚 20 Kumpulan Variasi Percakapan Real & Super Masif Seputar Pemrograman Web
const WEB_PROG_TOPICS = [
  {
    topic: "Web Browser",
    dialogs: [
      { role: "user", type: "text", content: "Halo, mau tanya dong apa bedanya web browser sama web server?" },
      { role: "assistant", type: "text", content: "Halo! Singkatnya, web browser itu software di sisi client (seperti Chrome/Edge) untuk menampilkan web. Sedangkan web server adalah software di sisi server (seperti Apache/Nginx) yang menyimpan dan mengirimkan file web ke browser.", animation: "Menjelaskan", expression: "smile" },
      { role: "user", type: "text", content: "Oh berarti browser yang nerjemahin HTML CSS nya ya?" },
      { role: "assistant", type: "text", content: "Tepat sekali! Browser memiliki rendering engine untuk membaca kode HTML, CSS, dan JavaScript lalu mengubahnya menjadi halaman visual yang kamu lihat.", animation: "TepukTangan", expression: "smile" }
    ]
  },
  {
    topic: "Dasar JavaScript",
    dialogs: [
      { role: "user", type: "voice", content: "Kak, bedanya var, let, sama const di JavaScript apa sih?" },
      { role: "assistant", type: "text", content: "Pertanyaan bagus! 'var' memiliki scope fungsi dan bisa di-declare ulang (sering bikin bug). 'let' itu block scope dan nilainya bisa diubah. Sedangkan 'const' juga block scope tapi nilainya mutlak tidak bisa diubah setelah di-assign.", animation: "Menjelaskan", expression: "default" },
      { role: "user", type: "text", content: "Kalau buat variable looping disarankan pakai apa?" },
      { role: "assistant", type: "text", content: "Sangat disarankan menggunakan 'let' di dalam perulangan (loop) karena nilainya akan terus berubah di setiap iterasi.", animation: "Idle", expression: "smile" }
    ]
  },
  {
    topic: "DOM Manipulation",
    dialogs: [
      { role: "user", type: "text", content: "Cara ngambil element HTML berdasarkan class di JS gimana?" },
      { role: "assistant", type: "text", content: "Kamu bisa menggunakan perintah `document.querySelector('.nama-class')` atau `document.getElementsByClassName('nama-class')`. Lebih disarankan querySelector karena lebih fleksibel!", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Asynchronous JS",
    dialogs: [
      { role: "user", type: "text", content: "Bingung nih bedanya Promise sama Async Await." },
      { role: "assistant", type: "text", content: "Async/Await sebenarnya adalah sintaks alternatif (*syntactic sugar*) untuk memproses Promise agar penulisan kodenya terlihat sekuensial dan lebih mudah dibaca seperti kode synchronous.", animation: "Menjelaskan", expression: "default" },
      { role: "user", type: "voice", content: "Berarti performanya sama aja ya?" },
      { role: "assistant", type: "text", content: "Betul sekali, di balik layar keduanya memanfaatkan event loop yang sama di V8 Engine JavaScript.", animation: "Idle", expression: "smile" }
    ]
  },
  {
    topic: "CSS Flexbox vs Grid",
    dialogs: [
      { role: "user", type: "text", content: "Kapan harus pakai CSS Flexbox dan kapan harus pakai CSS Grid?" },
      { role: "assistant", type: "text", content: "Gunakan Flexbox untuk tata letak satu dimensi (satu baris atau satu kolom saja). Gunakan CSS Grid jika kamu butuh tata letak dua dimensi yang kompleks (punya baris sekaligus kolom sekaligus).", animation: "Menjelaskan", expression: "smile" },
      { role: "user", type: "text", content: "Kalau buat layout navbar mending flexbox berarti?" },
      { role: "assistant", type: "text", content: "Betul, navbar sangat cocok menggunakan Flexbox karena elemen di dalamnya hanya berjejer secara horizontal.", animation: "TepukTangan", expression: "smile" }
    ]
  },
  {
    topic: "Express JS Routing",
    dialogs: [
      { role: "user", type: "text", content: "Error terus pas nyoba req.body di Express, nilainya undefined mulu kenapa ya?" },
      { role: "assistant", type: "text", content: "Ah, itu karena kamu belum memasang middleware parser json! Coba tambahkan baris kode `app.use(express.json())` di bagian atas sebelum definisi routing kamu, ya.", animation: "Bertanya", expression: "default" },
      { role: "user", type: "text", content: "Wah langsung bisa, makasih banyak!" }
    ]
  },
  {
    topic: "Database Sequelize Setup",
    dialogs: [
      { role: "user", type: "voice", content: "Cara hubungin Sequelize biar konek ke database Supabase gimana?" },
      { role: "assistant", type: "text", content: "Kamu cukup mengambil URI Connection string dari dashboard Supabase, lalu masukkan ke instansiasi `new Sequelize(CONNECTION_STRING)`. Jangan lupa pasang SSL mode require ya karena Supabase mewajibkannya.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "RESTful API Concept",
    dialogs: [
      { role: "user", type: "text", content: "Bedanya method PUT sama PATCH dalam REST API itu apa?" },
      { role: "assistant", type: "text", content: "Method PUT digunakan untuk mengganti seluruh data secara total (replace), sedangkan PATCH digunakan untuk memperbarui sebagian kolom saja (partial update) tanpa mengganggu data lainnya.", animation: "Menjelaskan", expression: "default" }
    ]
  },
  {
    topic: "JSON Web Token (JWT)",
    dialogs: [
      { role: "user", type: "text", content: "Gimana cara kerja authentication pake token JWT?" },
      { role: "assistant", type: "text", content: "Saat user berhasil login, server akan meng-generate token JWT. Token ini disimpan oleh client (biasanya di localStorage/cookies) dan dikirim kembali di dalam header `Authorization: Bearer <token>` setiap kali meminta data sensitif.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Error Handling Middleware",
    dialogs: [
      { role: "user", type: "text", content: "Gimana cara bikin global error handling middleware di Express?" },
      { role: "assistant", type: "text", content: "Kamu buat fungsi dengan 4 parameter: `(err, req, res, next)`. Taruh middleware ini di baris paling bawah setelah semua route kamu terdaftar agar semua error otomatis terlempar ke sana.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  // ── TAMBAHAN 10 TOPIK BARU BIAR MAKIN MELEDAK DATANYA ──
  {
    topic: "React State vs Props",
    dialogs: [
      { role: "user", type: "text", content: "Bingung bedanya useState sama props di React, kapan pakenya?" },
      { role: "assistant", type: "text", content: "State (`useState`) digunakan untuk mengelola data internal komponen yang bisa berubah (dinamis). Sedangkan `props` adalah data read-only yang dioper dari komponen parent ke komponen child.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Middleware Concept",
    dialogs: [
      { role: "user", type: "voice", content: "Fungsi dari perintah next() di middleware Express buat apa?" },
      { role: "assistant", type: "text", content: "Fungsi `next()` digunakan untuk mengoper kendali request ke fungsi middleware berikutnya. Jika kamu lupa memanggil `next()`, request dari client akan hang/menggantung selamanya!", animation: "Bertanya", expression: "default" }
    ]
  },
  {
    topic: "CORS Error",
    dialogs: [
      { role: "user", type: "text", content: "Dapet error No Access-Control-Allow-Origin header pas fetch API, solusinya gimana?" },
      { role: "assistant", type: "text", content: "Itu masalah CORS! Server kamu memblokir request dari domain frontend yang berbeda. Kamu tinggal install package `cors` di backend Express, lalu pasang `app.use(cors())` untuk mengizinkan akses.", animation: "TepukTangan", expression: "smile" }
    ]
  },
  {
    topic: "Git Version Control",
    dialogs: [
      { role: "user", type: "text", content: "Bedanya git merge sama git rebase pas mau gabungin branch apa?" },
      { role: "assistant", type: "text", content: "Git merge menggabungkan sejarah commit kedua branch dengan membuat satu 'merge commit' baru. Sedangkan git rebase memindahkan seluruh commit branch kamu ke ujung branch utama sehingga riwayatnya lurus tanpa merge commit.", animation: "Menjelaskan", expression: "default" }
    ]
  },
  {
    topic: "SQL Injection Security",
    dialogs: [
      { role: "user", type: "text", content: "Gimana cara ngamanin backend Express dari serangan SQL Injection?" },
      { role: "assistant", type: "text", content: "Hindari merangkai string kueri SQL secara manual seperti `WHERE id = ` + id. Gunakan ORM seperti Sequelize atau biasakan memakai *Parameterized Queries* (`?` atau `:id`) karena otomatis disaring oleh database.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Local Storage vs Cookies",
    dialogs: [
      { role: "user", type: "voice", content: "Lebih bagus simpan token login di localStorage atau HttpOnly Cookie?" },
      { role: "assistant", type: "text", content: "Sangat disarankan menggunakan HttpOnly Cookie untuk menyimpan token sensitif karena kebal dari serangan pencurian script XSS, berbeda dengan localStorage yang bisa dibaca script luar.", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Node JS Environment Variables",
    dialogs: [
      { role: "user", type: "text", content: "Kenapa variable di file .env gak kebaca pas di panggil pake process.env?" },
      { role: "assistant", type: "text", content: "Pastikan kamu sudah menginstall package `dotenv` dan memanggil perintah `dotenv.config()` di baris paling pertama file entrypoint (`app.js` atau `server.js`) kamu.", animation: "Bertanya", expression: "default" }
    ]
  },
  {
    topic: "HTTP Status Codes",
    dialogs: [
      { role: "user", type: "text", content: "Bedanya status code 401 Unauthorized sama 403 Forbidden apa?" },
      { role: "assistant", type: "text", content: "401 berarti server tidak tahu siapa kamu (belum login/token absen). Sedangkan 403 artinya server tahu siapa kamu, tapi kamu tidak punya hak akses (misal mahasiswa mencoba mengakses menu admin).", animation: "Menjelaskan", expression: "smile" }
    ]
  },
  {
    topic: "Deployment Vercel vs VPS",
    dialogs: [
      { role: "user", type: "text", content: "Mending deploy backend Node JS ke Vercel atau VPS biasa?" },
      { role: "assistant", type: "text", content: "Vercel sangat optimal untuk frontend atau serverless functions server murni. Untuk backend Node.js Express yang berjalan stand-alone secara persistent, menggunakan VPS (seperti DigitalOcean/Linode) jauh lebih stabil.", animation: "Menjelaskan", expression: "default" }
    ]
  },
  {
    topic: "NPM Package Management",
    dialogs: [
      { role: "user", type: "text", content: "Apa bedanya dependencies sama devDependencies di file package.json?" },
      { role: "assistant", type: "text", content: "`dependencies` adalah package yang dibutuhkan aplikasi agar bisa berjalan di server production (ex: express, sequelize). `devDependencies` hanya dibutuhkan saat proses coding/development oleh developer saja (ex: nodemon, jest).", animation: "Menjelaskan", expression: "smile" }
    ]
  }
];

export async function up(queryInterface, Sequelize) {
  try {
    const conversations = await queryInterface.sequelize.query(
      'SELECT conversation_id, created_at FROM conversations;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (conversations.length === 0) {
      console.log("❌ Tidak ada data conversation.");
      return;
    }

    const countResult = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM messages;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    let messageCounter = parseInt(countResult[0].count || countResult[0].COUNT || 0, 10);
    console.log(`📊 Total data pesan saat ini: ${messageCounter}. Generator akan mulai dari MSG-${String(messageCounter + 1).padStart(4, "0")}`);

    const bulkMessages = [];

    conversations.forEach((conv) => {
      // Mengacak 1 dari 20 topik web programming biar variatif masif antar mahasiswa
      const randomTopic = WEB_PROG_TOPICS[Math.floor(Math.random() * WEB_PROG_TOPICS.length)];
      let currentChatTime = new Date(conv.created_at);

      randomTopic.dialogs.forEach((dialog) => {
        messageCounter++;
        const msgId = `MSG-${String(messageCounter).padStart(4, "0")}`;
        
        currentChatTime = new Date(currentChatTime.getTime() + (Math.floor(Math.random() * 15) + 15) * 1000);

        const metaObj = dialog.role === "assistant" 
          ? { animation: dialog.animation, facialExpression: dialog.expression } 
          : {};

        bulkMessages.push({
          message_id: msgId,
          conversation_id: conv.conversation_id,
          parent_id: null,
          role: dialog.role,
          type: dialog.type,
          content: dialog.content,
          status: "pending",
          audio_url: null,
          emotion: dialog.role === "assistant" ? "happy" : null,
          model: dialog.role === "assistant" ? "gpt-4o" : null,
          finish_reason: dialog.role === "assistant" ? "stop" : null,
          // ── KUNCI VARIABEL DATA PENILAIAN GRAPH / LEADERBOARD ──
          token_usage: dialog.role === "assistant" ? Math.floor(Math.random() * 280) + 40 : 0,  
          latency_ms: dialog.role === "assistant" ? Math.floor(Math.random() * 1700) + 150 : 0, 
          is_edited: false,
          metadata: JSON.stringify(metaObj),
          created_at: currentChatTime,
          updated_at: currentChatTime
        });
      });
    });

    if (bulkMessages.length > 0) {
      await queryInterface.bulkInsert('messages', bulkMessages);
      console.log(`✅ BERHASIL SEEDING ULTRA MASIF: ${bulkMessages.length} pesan terbagi acak di 20 topik Pemrograman Web!`);
    }

  } catch (error) {
    console.error("🚨 Gagal melakukan bulk insert data pesan:", error);
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('messages', null, {});
}