"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const content = document.getElementById("pageContent");
    if (!content) return;

    const page = window.location.pathname.split("/").pop().toLowerCase();

    let file = "";

    if (page === "about.html") {
        file = "data/about.txt";
    } else if (page === "contacts.html") {
        file = "data/contacts.txt";
    } else {
        return;
    }

    fetch(file)
        .then(response => {
            if (!response.ok) {
                throw new Error("Файл не найден: " + file);
            }
            return response.text();
        })
        .then(text => {
            content.innerHTML = formatText(text);
        })
        .catch(error => {
            content.innerHTML = "<p>Не удалось загрузить текст.</p>";
            console.error(error);
        });
});

function formatText(text) {
    const lines = text.split(/\r?\n/);
    let html = "";

    lines.forEach(line => {
        const trimmed = line.trim();

        if (trimmed === "") {
            html += `<div class="page-space"></div>`;
            return;
        }

        if (trimmed.startsWith("##")) {
            html += `<h2>${escapeHtml(trimmed.replace(/^##\s*/, ""))}</h2>`;
            return;
        }

        if (trimmed.startsWith("#")) {
            html += `<h1>${escapeHtml(trimmed.replace(/^#\s*/, ""))}</h1>`;
            return;
        }

        if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ") ||
            trimmed.startsWith("• ")
        ) {
            const text = trimmed.replace(/^[-*•]\s*/, "");
            html += `<p class="page-list-item">${escapeHtml(text)}</p>`;
            return;
        }

        html += `<p>${escapeHtml(trimmed)}</p>`;
    });

    return html;
}

function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}