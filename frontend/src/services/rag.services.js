const API_URL = "http://localhost:3000";

class RagService {
  async retrievePlayground(question, limit = 5, threshold = 0.7) {
    const response = await fetch(`${API_URL}/api/v1/rag/playground`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question,
      }),
    });

    // const response = {
    //   success: true,
    //   message: "Retrieve success",
    //   data: {
    //     question:
    //       "dalam aturan konsep penamaan variable di javascript ada apa saja",
    //     answersAI: [
    //       {
    //         text: "Wah, pertanyaan yang bagus sekali! Untuk penamaan variabel di JavaScript, ada beberapa aturan penting yang perlu kamu ingat agar kodenya rapi dan benar.",
    //         facialExpression: "smile",
    //         animation: "Idle",
    //       },
    //       {
    //         text: "Pertama, nama variabel harus dimulai dengan huruf atau karakter underscore (_). Lalu, bisa terdiri dari huruf, angka, dan underscore. Ingat ya, tidak boleh ada spasi di tengah nama variabel!",
    //         facialExpression: "smile",
    //         animation: "Menjelaskan",
    //       },
    //       {
    //         text: "Yang paling penting juga, jangan gunakan 'reserved word' atau kata kunci yang sudah dipakai JavaScript, dan ingat kalau JavaScript itu case sensitive, jadi huruf besar dan kecil itu beda artinya! Semangat terus belajarnya!",
    //         facialExpression: "smile",
    //         animation: "Menjelaskan",
    //       },
    //     ],
    //     summary: {
    //       totalRetrieved: 5,
    //       totalRelevant: 2,
    //       threshold: 0.7,
    //     },
    //     retrievedChunks: [
    //       {
    //         index: 1,
    //         chunkId: "4fd808ef-3714-41bc-b771-e47ec7c653e5",
    //         documentId: "f7d6153f-1924-46fb-9921-e1997d7d5a91",
    //         similarityScore: 0.7806,
    //         content:
    //           "- Tidak boleh mengandung spasi\n- Tidak boleh menggunakan reserved word\nJavaScript bersifat case sensitive, sehingga huruf besar dan kecil dibedakan.\nContoh nama variabel yang benar:\n- variabel\n- Nama_Dari_Variabel\n- nama_dari_variabel_123\nContoh nama variabel yang salah:\n- Nama Dari Variabel\n- 123Nama\n- transient\nDokumen ini dibuat ulang dalam format teks agar dapat dicopy, dibaca manusia, dan diproses langsung oleh LLM\ntanpa OCR.",
    //         metadata: {
    //           source: "Materi_Teks_Pemrograman_Berbasis_Web_3KA.pdf",
    //           page: 3,
    //         },
    //       },
    //       {
    //         index: 2,
    //         chunkId: "145a5389-2ce0-40f0-b66e-d3ba29539b2e",
    //         documentId: "f7d6153f-1924-46fb-9921-e1997d7d5a91",
    //         similarityScore: 0.7559,
    //         content:
    //           "- small-caps\n8. JavaScript Sebagai Bahasa Berorientasi Objek\nJavaScript mendukung konsep pemrograman berorientasi objek.\nSebuah objek terdiri dari:\n- Properti\n- Metode\n- Penanganan kejadian (event handling)\nProperti:\n- Merupakan atribut dari sebuah objek\n- Contoh objek dalam JavaScript adalah window\n- Salah satu propertinya adalah defaultStatus\nCara mengakses properti:\nnama_objek.nama_properti\nContoh:\nwindow.defaultStatus\n9. Konsep Variabel dalam JavaScript\nVariabel adalah objek yang berisi data dan dapat dimodifikasi selama program berjalan.\nAturan penamaan variabel:\n- Harus dimulai dengan huruf atau karakter underscore (_)\n- Dapat terdiri dari huruf, angka, dan underscore\n- Tidak boleh mengandung spasi\n- Tidak boleh menggunakan reserved word",
    //         metadata: {
    //           source: "Materi_Teks_Pemrograman_Berbasis_Web_3KA.pdf",
    //           page: 3,
    //         },
    //       },
    //     ],
    //     context:
    //       "\n          [Source 1]\n          - Tidak boleh mengandung spasi\n- Tidak boleh menggunakan reserved word\nJavaScript bersifat case sensitive, sehingga huruf besar dan kecil dibedakan.\nContoh nama variabel yang benar:\n- variabel\n- Nama_Dari_Variabel\n- nama_dari_variabel_123\nContoh nama variabel yang salah:\n- Nama Dari Variabel\n- 123Nama\n- transient\nDokumen ini dibuat ulang dalam format teks agar dapat dicopy, dibaca manusia, dan diproses langsung oleh LLM\ntanpa OCR.\n\n\n\n          [Source 2]\n          - small-caps\n8. JavaScript Sebagai Bahasa Berorientasi Objek\nJavaScript mendukung konsep pemrograman berorientasi objek.\nSebuah objek terdiri dari:\n- Properti\n- Metode\n- Penanganan kejadian (event handling)\nProperti:\n- Merupakan atribut dari sebuah objek\n- Contoh objek dalam JavaScript adalah window\n- Salah satu propertinya adalah defaultStatus\nCara mengakses properti:\nnama_objek.nama_properti\nContoh:\nwindow.defaultStatus\n9. Konsep Variabel dalam JavaScript\nVariabel adalah objek yang berisi data dan dapat dimodifikasi selama program berjalan.\nAturan penamaan variabel:\n- Harus dimulai dengan huruf atau karakter underscore (_)\n- Dapat terdiri dari huruf, angka, dan underscore\n- Tidak boleh mengandung spasi\n- Tidak boleh menggunakan reserved word\n",
    //   },
    // };

    if (!response.ok) {
      throw new Error("Failed to retrieve playground");
    }

    return response.json();
    // return response;
  }
}

export default new RagService();
