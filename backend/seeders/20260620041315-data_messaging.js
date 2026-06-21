import Conversation from "../models/conversation.model.js";


// 📚 Kumpulan Variasi Percakapan Real Seputar Pemrograman Web
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
  }
];

export async function up(queryInterface, Sequelize) {
  try {
    // 1. Ambil semua konversasi yang ada
    const conversations = await queryInterface.sequelize.query(
      'SELECT conversation_id, created_at FROM conversations;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (conversations.length === 0) {
      console.log("❌ Tidak ada data conversation.");
      return;
    }

    // ── KUNCI PERBAIKAN DI SINI: HITUNG JUMLAH MESSAGES EXISTING ──
    const countResult = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM messages;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Jadikan jumlah total baris saat ini sebagai index awal aman (misal ada 49, counter mulai dari 49 -> next 50)
    let messageCounter = parseInt(countResult[0].count || countResult[0].COUNT || 0, 10);
    console.log(`📊 Total data pesan saat ini: ${messageCounter}. Generator akan mulai dari MSG-${String(messageCounter + 1).padStart(4, "0")}`);

    const bulkMessages = [];

    // 2. Iterasi setiap konversasi untuk disuntikkan chat
    conversations.forEach((conv) => {
      // Pilih topik secara acak
      const randomTopic = WEB_PROG_TOPICS[Math.floor(Math.random() * WEB_PROG_TOPICS.length)];
      let currentChatTime = new Date(conv.created_at);

      randomTopic.dialogs.forEach((dialog) => {
        messageCounter++; // Angka dijamin terus naik dan di atas record existing
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
          token_usage: dialog.role === "assistant" ? Math.floor(Math.random() * 150) + 50 : 0,
          latency_ms: dialog.role === "assistant" ? Math.floor(Math.random() * 1200) + 300 : 0,
          is_edited: false,
          metadata: JSON.stringify(metaObj),
          created_at: currentChatTime,
          updated_at: currentChatTime
        });
      });
    });

    // 3. Eksekusi masal ke Supabase
    if (bulkMessages.length > 0) {
      await queryInterface.bulkInsert('messages', bulkMessages);
      console.log(`✅ Berhasil menyuntikkan ${bulkMessages.length} pesan baru tanpa tabrakan ID!`);
    }

  } catch (error) {
    console.error("🚨 Gagal melakukan bulk insert data pesan:", error);
  }
}
export async function down(queryInterface, Sequelize) {
  // Opsi rollback untuk membersihkan dummy message di atas ID awal
  await queryInterface.bulkDelete('messages', null, {});
}