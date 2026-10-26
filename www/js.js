
const sep = document.getElementById("sebha-page");
const sepha = document.getElementById("home");
const sephaCard = document.querySelector(".sep");
const back = document.getElementById("back-btn");
const counter = document.getElementById("counter");
const taspehBtn = document.getElementById("tasbeeh-btn");
const resetBtn = document.getElementById("reset-btn");

const mos = document.getElementById("mos_page");
const mosCard = document.querySelector(".mos");
const backMos = document.getElementById("back-btn-mos");
const header = document.getElementById("main-header");

const searchInput = document.getElementById("surah-search");
const surahButtons = document.querySelectorAll(".surah-btn");
const surahList = document.getElementById("surah-list");
const surahReader = document.getElementById("surah-reader");
const surahName = document.getElementById("surah-name");
const ayahList = document.getElementById("ayah-list");
const surahStatus = document.getElementById("surah-status");
const backToSurahs = document.getElementById("back-to-surahs");
const surahTitle = document.getElementById("moshaf-title");
const searchBox = document.getElementById("surah-search");

const prayerPage = document.getElementById("prayer-page");
const prayerCard = document.querySelector(".sal");
const prayerBack = document.getElementById("back-prayer");
const prayerRefresh = document.getElementById("refresh-prayers");

sepha.style.display = "flex";
header.style.display = "block";
sep.style.display = "none";
mos.style.display = "none";
prayerPage.style.display = "none";
localStorage.setItem("currentPage", "home");

let z = Number(localStorage.getItem("counter")) || 0;
counter.textContent = z;

function showHome() {
    sepha.style.display = "flex";
    header.style.display = "block";
    sep.style.display = "none";
    mos.style.display = "none";
    prayerPage.style.display = "none";
    localStorage.setItem("currentPage", "home");
}

sephaCard.addEventListener("click", function() {
    sepha.style.display = "none";
    header.style.display = "none";
    mos.style.display = "none";
    prayerPage.style.display = "none";
    sep.style.display = "flex";
});

back.addEventListener("click", showHome);

taspehBtn.addEventListener("click", function() {
    z++;
    counter.textContent = z;
    localStorage.setItem("counter", z);
});

resetBtn.addEventListener("click", function() {
    z = 0;
    counter.textContent = z;
    localStorage.setItem("counter", z);
});

mosCard.addEventListener("click", function() {
    sepha.style.display = "none";
    sep.style.display = "none";
    header.style.display = "none";
    prayerPage.style.display = "none";
    mos.style.display = "block";

    surahList.style.display = "flex";
    surahReader.style.display = "none";
    surahTitle.style.display = "block";
    searchBox.style.display = "block";
    searchBox.value = "";

    filterSurahs();
});

backMos.addEventListener("click", showHome);

function normalizeArabic(text) {
    return text
        .replace(/[أإآٱ]/g, "ا")
        .replace(/ى/g, "ي")
        .replace(/ة/g, "ه")
        .replace(/ؤ/g, "و")
        .replace(/ئ/g, "ي")
        .replace(/ـ/g, "")
        .replace(/[\u064B-\u065F\u0670]/g, "")
        .trim()
        .toLowerCase();
}

function filterSurahs() {
    const searchValue = normalizeArabic(searchInput.value);

    surahButtons.forEach(function(button) {
        const name = button.textContent.replace(/^\d+\.\s*/, "");
        const normalizedName = normalizeArabic(name);

        button.style.display =
            normalizedName.includes(searchValue) ? "block" : "none";
    });
}

searchInput.addEventListener("input", filterSurahs);

surahList.addEventListener("click", async function(event) {
    const button = event.target.closest(".surah-btn");

    if (!button) return;

    const surahNumber = parseInt(button.textContent, 10);

    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
        return;
    }

    surahList.style.display = "none";
    surahReader.style.display = "block";
    surahTitle.style.display = "none";
    searchBox.style.display = "none";

    surahName.textContent = button.textContent.replace(/^\d+\.\s*/, "");
    ayahList.textContent = "";
    surahStatus.textContent = "جاري تحميل الآيات...";

    try {
        const response = await fetch(
            `https://api.alquran.cloud/v1/surah/${surahNumber}`
        );

        if (!response.ok) {
            throw new Error("فشل الاتصال بالمصدر");
        }

        const result = await response.json();

        if (result.code !== 200 || !result.data?.ayahs) {
            throw new Error("تعذر تحميل السورة");
        }

        surahName.textContent = result.data.name;
        surahStatus.textContent =
            "عدد الآيات: " + result.data.numberOfAyahs;

        result.data.ayahs.forEach(function(ayah) {
            const ayahElement = document.createElement("span");
            ayahElement.className = "ayah";
            ayahElement.textContent =
                ayah.text + " ﴿" + ayah.numberInSurah + "﴾ ";

            ayahList.appendChild(ayahElement);
        });
    } catch (error) {
        surahStatus.textContent =
            "تعذر تحميل السورة. تأكد من الإنترنت وحاول مرة أخرى.";
        console.error("Quran API error:", error);
    }
});

backToSurahs.addEventListener("click", function() {
    surahReader.style.display = "none";
    surahList.style.display = "flex";
    surahTitle.style.display = "block";
    searchBox.style.display = "block";

    surahStatus.textContent = "";
    ayahList.textContent = "";

    filterSurahs();
});

const prayerIds = {
    Fajr: "fajr",
    Sunrise: "sunrise",
    Dhuhr: "dhuhr",
    Asr: "asr",
    Maghrib: "maghrib",
    Isha: "isha"
};

prayerCard.addEventListener("click", function() {
    sepha.style.display = "none";
    sep.style.display = "none";
    mos.style.display = "none";
    header.style.display = "none";
    prayerPage.style.display = "block";

    loadPrayerTimes();
});

async function loadPrayerTimes() {
    const status = document.getElementById("prayer-status");
    const dateElement = document.getElementById("prayer-date");

    status.textContent = "جاري تحميل المواقيت...";

    Object.values(prayerIds).forEach(function(id) {
        document.getElementById(id).textContent = "--:--";
    });

    try {
        const now = new Date();

        const date = [
            String(now.getDate()).padStart(2, "0"),
            String(now.getMonth() + 1).padStart(2, "0"),
            now.getFullYear()
        ].join("-");

        const url =
            `https://api.aladhan.com/v1/timingsByCity/${date}` +
            `?city=Damietta&country=Egypt&method=5`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("فشل الاتصال بخدمة المواقيت");
        }

        const result = await response.json();

        if (result.code !== 200 || !result.data?.timings) {
            throw new Error("بيانات المواقيت غير متاحة");
        }

        const timings = result.data.timings;

        Object.entries(prayerIds).forEach(function([prayer, id]) {
            const time = timings[prayer];

            if (time) {
               const time24 = time.split(" ")[0];
               const [hours, minutes] = time24.split(":").map(Number);

               const period = hours >= 12 ? "م" : "ص"; 
               const hours12 = hours % 12 || 12;

document.getElementById(id).textContent =
    `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
            }
        });

        const gregorianDate = result.data.date.readable;
        const hijriDate = result.data.date.hijri?.date;

        dateElement.textContent = hijriDate
            ? `${gregorianDate} - ${hijriDate} هـ`
            : gregorianDate;

        status.textContent = "تم تحميل المواقيت بنجاح";
    } catch (error) {
        console.error("Prayer times error:", error);
        status.textContent =
            "تعذر تحميل المواقيت. تأكد من الإنترنت واضغط تحديث المواقيت.";
    }
}

prayerRefresh.addEventListener("click", loadPrayerTimes);

prayerBack.addEventListener("click", showHome);
