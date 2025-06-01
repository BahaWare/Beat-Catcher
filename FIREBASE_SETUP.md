# Firebase Kurulum Rehberi - Beat Catcher Multiplayer

## 🔥 Firebase Hesabı Oluşturma

### 1. Firebase Console'a Gidin
- [https://console.firebase.google.com/](https://console.firebase.google.com/) adresine gidin
- Google hesabınızla giriş yapın

### 2. Yeni Proje Oluşturun
1. "Create a project" veya "Proje oluştur" butonuna tıklayın
2. Proje adı: `beat-catcher-multiplayer` (veya istediğiniz isim)
3. Google Analytics'i kapatabilirsiniz (opsiyonel)
4. "Create project" tıklayın

### 3. Web Uygulaması Ekleyin
1. Proje ana sayfasında `</>` (Web) ikonuna tıklayın
2. Uygulama adı: `Beat Catcher Game`
3. "Firebase Hosting" seçeneğini işaretlemeyin (GitHub Pages kullanacağız)
4. "Register app" tıklayın

### 4. Firebase Config'i Kopyalayın
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "beat-catcher-multiplayer.firebaseapp.com",
  databaseURL: "https://beat-catcher-multiplayer-default-rtdb.firebaseio.com",
  projectId: "beat-catcher-multiplayer",
  storageBucket: "beat-catcher-multiplayer.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. Realtime Database'i Aktifleştirin
1. Sol menüden "Realtime Database" seçin
2. "Create Database" tıklayın
3. Lokasyon seçin (United States önerilir)
4. **"Start in test mode"** seçin (önemli!)
5. "Enable" tıklayın

## 📝 Güvenlik Kuralları

Realtime Database > Rules sekmesine gidin ve şu kuralları yapıştırın:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth == null",
        "players": {
          "$playerId": {
            ".write": "auth == null"
          }
        },
        "fallingObjects": {
          ".write": "data.child('host').val() == auth.uid || auth == null"
        }
      }
    },
    ".read": false,
    ".write": false
  }
}
```

**NOT**: Bu kurallar test amaçlıdır. Production'da authentication ekleyin!

## 🔧 Oyuna Entegrasyon

### 1. Firebase SDK'yı HTML'e Ekleyin

`index.html` dosyasında, diğer script'lerden ÖNCE şunları ekleyin:

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
```

### 2. Firebase Config'i Güncelleyin

`firebase-multiplayer.js` dosyasında, `firebaseConfig` objesini kendi config'inizle değiştirin:

```javascript
this.firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Multiplayer Butonunu Ana Menüye Ekleyin

`index.html` dosyasında, START GAME butonundan sonra:

```html
<button id="multiplayer-button" class="neon-button" style="margin-top: 20px;">MULTIPLAYER</button>
```

### 4. Game.js'e Multiplayer Desteği Ekleyin

`game.js` dosyasının başına ekleyin:
```javascript
// Multiplayer manager instance
this.multiplayerManager = null;
this.isMultiplayer = false;
```

`init()` metoduna ekleyin:
```javascript
// Initialize multiplayer
this.multiplayerManager = new FirebaseMultiplayer();
this.multiplayerManager.init(this);
MultiplayerUI.createMultiplayerMenu();
MultiplayerUI.addMultiplayerStyles();
```

## 🎮 Multiplayer Özellikleri

### Desteklenen Özellikler:
- ✅ 4 oyuncuya kadar oda desteği
- ✅ Gerçek zamanlı skor paylaşımı
- ✅ Oda kodu ile katılma
- ✅ Host/misafir sistemi
- ✅ Ready durumu
- ✅ Oyun sonu liderlik tablosu

### Gelecek Özellikler:
- 🔄 Diğer oyuncuların gemilerini görme
- 🔄 Co-op mod (ortak skor)
- 🔄 Versus mod (rekabet)
- 🔄 Özel oda ayarları

## ⚠️ Önemli Notlar

1. **API Key Güvenliği**: 
   - Firebase config public olacak
   - Domain kısıtlaması ekleyin (Firebase Console > Project Settings > General)
   - Sadece `yourusername.github.io` domain'ine izin verin

2. **Kullanım Limitleri**:
   - Ücretsiz plan: 100 eşzamanlı bağlantı
   - 10GB/ay download
   - 1GB veritabanı boyutu

3. **Test Etme**:
   - Farklı tarayıcı/sekmelerde test edin
   - Incognito modda da deneyin

## 🚀 GitHub Pages'e Yükleme

1. Tüm dosyaları commit'leyin
2. GitHub'a push'layın
3. GitHub Pages'i aktifleştirin
4. Firebase Console'da domain'inizi ekleyin:
   - Authentication > Settings > Authorized domains
   - `yourusername.github.io` ekleyin

## 🐛 Sorun Giderme

### "Permission Denied" Hatası
- Firebase Rules'ı kontrol edin
- Test mode'da olduğunuzdan emin olun

### Bağlantı Sorunları
- Firebase config'in doğru olduğundan emin olun
- Browser console'da hata mesajlarını kontrol edin
- Network sekmesinde Firebase bağlantısını kontrol edin

### Oda Bulunamadı
- Oda kodunun doğru girildiğinden emin olun
- Büyük/küçük harf duyarlıdır

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Firebase Console'da Realtime Database'i kontrol edin
3. GitHub Issues açın

İyi oyunlar! 🎮✨
