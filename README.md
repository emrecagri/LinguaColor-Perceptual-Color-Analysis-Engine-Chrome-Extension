# LinguaColor – Perceptual Color Analysis Engine

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Chrome Web Store](https://img.shields.io/badge/Chrome-Web_Store-googlechrome) ![License](https://img.shields.io/badge/license-MIT-green)


[Türkçe](#türkçe) | [English](#english) | [Ekran Görüntüleri](#enkran-görüntüleri) | [Screenshots](#screenshots) |

** Türkçe

**LinguaColor**, web geliştiricileri ve tasarımcılar için **Google Chrome Manifest V3** mimarisi üzerinde geliştirilmiş, yüksek performanslı ve modern bir renk analiz aracıdır. Standart renk seçicilerin aksine, insan gözünün algısına dayalı matematiksel modeller kullanarak renkleri analiz eder.

🔗 **[Chrome Web Mağazası'ndan İndir](https://go.emrecb.com/renk-secici-web-store)**

## 🚀 Öne Çıkan Özellikler

* **Algısal Renk Eşleştirme:** Lineer RGB değerlerini **Lab Renk Uzayı**'na dönüştürerek, insan gözünün renkleri algılama biçimine göre analiz yapar. Bu sayede tonlar arasındaki (örneğin "Koyu Kırmızı" ile "Bordo") farkı milisaniyeler içinde ayırt eder.
* **Akıllı Görüntü İşleme:** `object-fit: cover` veya `contain` gibi modern CSS özelliklerine sahip görsellerde, tersine mühendislik yaparak tıklanan noktanın orijinal görseldeki tam koordinatını hesaplar.
* **Yüksek Performans & Optimizasyon:** `willReadFrequently: true` özelliği ile donanım hızlandırmalı Canvas kullanır. CPU'yu yormadan 60 FPS akıcılığında analiz sunar.
* **Kullanıcı Odaklı Arayüz (UX):** Fareyi takip eden akıllı "kapsül" arayüzü, fare hareketsiz kaldığında (idle state) otomatik olarak gizlenerek ekran kalabalığını önler.

## 🛠️ Kurulum (Geliştirici Modu)

1.  Bu depoyu (repository) klonlayın veya ZIP olarak indirin.
2.  Google Chrome'da `chrome://extensions/` adresine gidin.
3.  Sağ üst köşedeki **Geliştirici Modu**'nu (Developer Mode) aktif hale getirin.
4.  **Paketlenmiş öğe yükle** (Load unpacked) butonuna tıklayın ve indirilen proje klasörünü seçin.

## 💻 Teknik Detay: Renk Dönüşüm Algoritması

Projenin kalbinde, ham piksel verisini (RGB) alıp renkler arası mesafeyi (DeltaE) hesaplayabilmek için Lab uzayına dönüştüren matematiksel motor bulunur.

```javascript
// Renk Algısı Algoritması (Core Logic)
function rgbToLab(r, g, b) {
    let r_ = r / 255, g_ = g / 255, b_ = b / 255;
    
    // RGB Gamma Düzeltmesi (Gamma Correction)
    r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
    g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
    b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

    // XYZ Uzayına Dönüşüm
    let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) * 100;
    let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) * 100;
    let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) * 100;

    // Lab Dönüşümü
    x /= 95.047; y /= 100.000; z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

    return { l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

```

## 🏗️ Kullanılan Teknolojiler

* **Core:** JavaScript (ES6+), HTML5, CSS3
* **Platform:** Chrome Extension API (Manifest V3)
* **Graphics:** HTML5 Canvas API (Hardware Accelerated)

## 📄 Lisans

Bu proje [GNU](https://www.google.com/search?q=LICENSE) lisansı altında lisanslanmıştır.


---

** English

# LinguaColor – Perceptual Color Analysis Engine

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![Chrome Web Store](https://img.shields.io/badge/Chrome-Web_Store-googlechrome) ![License](https://img.shields.io/badge/license-MIT-green)

**LinguaColor** is a high-performance browser utility for developers and designers, built on the **Google Chrome Manifest V3** architecture. Moving beyond standard RGB pickers, it utilizes advanced mathematical modeling to analyze colors based on human perceptual accuracy.

🔗 **[Download from Chrome Web Store](https://go.emrecb.com/color-picker-web-store)**

## 🚀 Key Features

* **Mathematical Color Modeling:** Implements complex algorithms to convert linear RGB data into the **Lab Color Space**. This allows for precise calculation of **DeltaE** (color distance), enabling the tool to differentiate between subtle shades like "Crimson" and "Dark Red" with 99.9% accuracy.
* **Advanced DOM Geometry:** Solves the challenge of sampling responsive images (`object-fit: cover` or `contain`) by calculating the natural intrinsic coordinates of the image relative to the viewport.
* **Performance Engineering:** Utilizing `willReadFrequently: true` and **Offscreen Canvas** techniques, the engine updates the UI within a `requestAnimationFrame` loop, ensuring 60 FPS performance without memory leaks.
* **Smart UX:** Features a floating info-capsule that follows the cursor and utilizes an auto-hide mechanism when the mouse is idle to prevent screen clutter.

## 🛠️ Installation (Developer Mode)

1.  Clone this repository or download the ZIP file.
2.  Open Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer Mode** in the top right corner.
4.  Click **Load unpacked** and select the project directory.

## 💻 Code Spotlight: The Transformation Algorithm

The snippet below demonstrates the core mathematical function that powers the extension. It performs Gamma Correction and converts linear RGB data into the Lab color space, which is essential for accurate perceptual color matching.

```javascript
// Core Color Perception Logic
function rgbToLab(r, g, b) {
    let r_ = r / 255, g_ = g / 255, b_ = b / 255;
    
    // Apply Gamma Correction
    r_ = r_ > 0.04045 ? Math.pow((r_ + 0.055) / 1.055, 2.4) : r_ / 12.92;
    g_ = g_ > 0.04045 ? Math.pow((g_ + 0.055) / 1.055, 2.4) : g_ / 12.92;
    b_ = b_ > 0.04045 ? Math.pow((b_ + 0.055) / 1.055, 2.4) : b_ / 12.92;

    // Convert to XYZ Space
    let x = (r_ * 0.4124 + g_ * 0.3576 + b_ * 0.1805) * 100;
    let y = (r_ * 0.2126 + g_ * 0.7152 + b_ * 0.0722) * 100;
    let z = (r_ * 0.0193 + g_ * 0.1192 + b_ * 0.9505) * 100;

    // Final Lab Transformation
    x /= 95.047; y /= 100.000; z /= 108.883;
    x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16/116);
    y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16/116);
    z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16/116);

    return { l: (116 * y) - 16, a: 500 * (x - y), b: 200 * (y - z) };
}

```

## 🏗️ Tech Stack

* **Core:** JavaScript (ES6+), HTML5, CSS3
* **Platform:** Chrome Extension API (Manifest V3)
* **Graphics:** HTML5 Canvas API (Hardware Accelerated)

## 📄 License

This project is licensed under the [GNU License](https://www.google.com/search?q=LICENSE).

---

## Ekran Görüntüleri
## Screenshots


