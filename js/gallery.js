"use strict";

/* ======================================================================
   PORTFOLIO
   Gallery Engine v1.0
   ====================================================================== */

class PortfolioGallery {

    constructor() {
        this.gallery = [];
        this.sections = [];
        this.currentGallery = [];
        this.currentIndex = 0;
        this.currentSection = "all";

        this.autoPlay = true;
        this.delay = 3000;
        this.timer = null;
        this.fadeTime = 180;

        this.image = document.getElementById("galleryImage");
        this.empty = document.getElementById("galleryEmpty");
        this.menu = document.getElementById("sections");
        this.viewer = document.getElementById("viewer");
        this.viewerImage = document.getElementById("viewerImage");
        this.viewerClose = document.getElementById("viewerClose");
    }

    async init() {
        await this.loadData();

        this.buildMenu();
        this.selectSection("all", false);
        this.show();
        this.bindEvents();
        this.startAuto();
        this.updateButtons();
    }

    async loadData() {
        try {
            const galleryResponse = await fetch("data/gallery.json");
            const sectionsResponse = await fetch("data/sections.json");

            this.gallery = await galleryResponse.json();
            this.sections = await sectionsResponse.json();

            if (!Array.isArray(this.gallery)) this.gallery = [];
            if (!Array.isArray(this.sections)) this.sections = [];
        } catch (error) {
            console.error("Gallery loading error:", error);
            this.gallery = [];
            this.sections = [];
        }
    }

    buildMenu() {
        this.menu.innerHTML = "";

        this.createMenuItem({
            id: "all",
            title: "Все работы",
            pdf: null
        });

        this.sections.forEach(section => this.createMenuItem(section));
    }

    createMenuItem(section) {
        const row = document.createElement("div");
        row.className = "section";
        row.dataset.section = section.id;

        const title = document.createElement("div");
        title.className = "section-name";
        title.textContent = section.title;
        row.appendChild(title);

        if (section.pdf) {
            const link = document.createElement("a");
            link.href = section.pdf;
            link.download = "";
            link.className = "section-pdf";
            link.title = "Скачать PDF";

            link.addEventListener("click", event => event.stopPropagation());

            const icon = document.createElement("img");
            icon.src = "images/pdf.svg";
            icon.alt = "PDF";

            link.appendChild(icon);
            row.appendChild(link);
        }

        row.addEventListener("click", () => {
            this.stopAuto();
            this.selectSection(section.id, true);
            this.show();
            this.updateButtons();
        });

        this.menu.appendChild(row);
    }

    selectSection(id, manual = true) {
        this.currentSection = id;

        if (manual) this.autoPlay = false;

        document.querySelectorAll(".section").forEach(item => {
            item.classList.toggle("active", item.dataset.section === id);
        });

        this.currentGallery = id === "all"
            ? [...this.gallery]
            : this.gallery.filter(item => item.section === id);

        if (this.currentGallery.length === 0) {
            this.currentIndex = 0;
            this.image.removeAttribute("src");
            this.image.alt = "";
            this.empty.classList.remove("hidden");
            this.updateButtons();
            return;
        }

        this.empty.classList.add("hidden");

        this.currentIndex = manual
            ? 0
            : this.randomIndex();
    }

    show(index = this.currentIndex) {
        if (this.currentGallery.length === 0) return;

        this.currentIndex = this.normalizeIndex(index);
        const item = this.currentGallery[this.currentIndex];

        this.image.classList.add("fade");

        setTimeout(() => {
            this.image.src = item.file;
            this.image.alt = item.name || "";
            this.image.classList.remove("fade");
            this.preloadNext();
            this.updateButtons();
        }, this.fadeTime);
    }

    normalizeIndex(index) {
        const length = this.currentGallery.length;
        if (length === 0) return 0;
        if (index < 0) return length - 1;
        if (index >= length) return 0;
        return index;
    }

    randomIndex() {
        if (this.currentGallery.length <= 1) return 0;

        let index;
        do {
            index = Math.floor(Math.random() * this.currentGallery.length);
        } while (index === this.currentIndex);

        return index;
    }

    next() {
        if (this.currentGallery.length === 0) return;

        if (this.autoPlay) {
            this.show(this.randomIndex());
            return;
        }

        this.show(this.currentIndex + 1);
    }

    previous() {
        if (this.currentGallery.length === 0) return;
        this.show(this.currentIndex - 1);
    }

    first() {
        if (this.currentGallery.length === 0) return;
        this.show(0);
    }

    last() {
        if (this.currentGallery.length === 0) return;
        this.show(this.currentGallery.length - 1);
    }

    preloadNext() {
        if (this.currentGallery.length < 2) return;

        const nextIndex = this.autoPlay
            ? this.randomIndex()
            : this.normalizeIndex(this.currentIndex + 1);

        const preload = new Image();
        preload.src = this.currentGallery[nextIndex].file;
    }

    startAuto() {
        if (!this.autoPlay || this.currentGallery.length < 2) return;

        this.stopTimerOnly();

        this.timer = setInterval(() => {
            this.next();
        }, this.delay);
    }

    stopTimerOnly() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    stopAuto() {
        this.autoPlay = false;
        this.stopTimerOnly();
    }

    updateButtons() {
        const disabled = this.currentGallery.length === 0;

        ["firstBtn", "prevBtn", "nextBtn", "lastBtn"].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = disabled;
        });
    }

    bindEvents() {
        document.getElementById("firstBtn").addEventListener("click", () => {
            this.stopAuto();
            this.first();
        });

        document.getElementById("prevBtn").addEventListener("click", () => {
            this.stopAuto();
            this.previous();
        });

        document.getElementById("nextBtn").addEventListener("click", () => {
            this.stopAuto();
            this.next();
        });

        document.getElementById("lastBtn").addEventListener("click", () => {
            this.stopAuto();
            this.last();
        });

        this.image.addEventListener("click", () => {
            if (!this.image.src) return;

            this.viewerImage.src = this.image.src;
            this.viewer.classList.remove("hidden");
        });

        this.viewer.addEventListener("click", () => {
            this.viewer.classList.add("hidden");
        });

        this.viewerClose.addEventListener("click", event => {
            event.stopPropagation();
            this.viewer.classList.add("hidden");
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                this.viewer.classList.add("hidden");
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const gallery = new PortfolioGallery();
    await gallery.init();
});
