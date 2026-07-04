"use strict";

/* ==========================================================
   PORTFOLIO
   UI Manager v1.0
   ========================================================== */

class UIManager {

    constructor() {
        this.galleryImage = document.getElementById("galleryImage");
    }

    init() {
        this.disableImageDrag();
    }

    disableImageDrag() {
        if (!this.galleryImage) return;

        this.galleryImage.draggable = false;

        this.galleryImage.addEventListener("dragstart", event => {
            event.preventDefault();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UIManager();
    ui.init();
});
