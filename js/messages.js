"use strict";

/* ==========================================================
   PORTFOLIO
   Message Manager v1.0
   ========================================================== */

class MessageManager {

    constructor() {
        this.messages = [];
        this.current = 0;
        this.delay = 5000;
        this.timer = null;
        this.box = document.getElementById("messageText");
    }

    async init() {
        await this.load();

        if (!this.box || this.messages.length === 0) return;

        this.show();
        this.start();
    }

    async load() {
        try {
            const response = await fetch("data/messages.json");
            this.messages = await response.json();

            if (!Array.isArray(this.messages)) this.messages = [];
        } catch (error) {
            console.error("Messages loading error:", error);
            this.messages = [];
        }
    }

    show() {
        this.box.textContent = this.messages[this.current];
    }

    next() {
        if (this.messages.length === 0) return;

        this.current++;

        if (this.current >= this.messages.length) {
            this.current = 0;
        }

        this.fadeTo(this.messages[this.current]);
    }

    fadeTo(text) {
        this.box.classList.add("fade");

        setTimeout(() => {
            this.box.textContent = text;
            this.box.classList.remove("fade");
        }, 180);
    }

    start() {
        this.stop();

        this.timer = setInterval(() => {
            this.next();
        }, this.delay);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const messages = new MessageManager();
    await messages.init();
});
